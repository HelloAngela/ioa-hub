// Catalogue page: loads the entries, builds two compact tables, and runs the shared
// search, filters and sortable columns.
//
// 1. The main table: educators who submitted the form and were approved. Each row is
//    one unit. People submit the form once per unit, so entries with the same
//    institution and unit code are grouped into one row, and everyone involved is
//    listed under People. For unit details (students, minutes and so on) the earliest
//    submission wins; blanks are filled from later ones.
//    The entries come from the public tab of the Google Sheet (if its link is set in
//    _config.yml), or from _data/catalog.csv otherwise.
// 2. "Examples from published sources" (collapsed at first): units described in
//    published work, from _data/catalog-published.yml. These show the source instead
//    of people. A unit that is also in the main table is left out here.
//
// Selecting a unit opens a details row underneath. The filters above apply to both tables.
(function () {
  var wrap = document.getElementById("catalog");
  if (!wrap) return;

  var controls = document.getElementById("catalog-filters");
  var search = document.getElementById("catalog-search");
  var hint = document.getElementById("catalog-hint");
  var clearButton = document.getElementById("catalog-clear");
  var selects = Array.prototype.slice.call(controls.querySelectorAll("select[data-filter]"));
  var ranges = Array.prototype.slice.call(controls.querySelectorAll("select[data-range]"));

  function makeList(tableId, statusId, kind) {
    var table = document.getElementById(tableId);
    if (!table) return null;
    return {
      kind: kind, // "people" or "sources"
      table: table,
      body: table.tBodies[0],
      status: document.getElementById(statusId),
      columns: table.tHead.rows[0].cells.length,
      items: [] // one per unit: { row, detail, toggle, text }
    };
  }

  var approved = makeList("catalog-table", "catalog-status", "people");
  var published = makeList("catalog-published-table", "catalog-published-status", "sources");
  var publishedSection = document.getElementById("catalog-published");
  var publishedCount = document.getElementById("catalog-published-count");
  var lists = [approved, published].filter(Boolean);

  // Short labels for the Type column. The filter keeps the full wording.
  var TYPE_SHORT = {
    "interactive oral assessment (ioa)": "IOA",
    "viva or oral examination": "Viva",
    "hybrid oral assessment": "Hybrid",
    "other oral assessment": "Other"
  };

  // ---------- Reading the data ----------

  // Turns CSV text into a list of rows. Handles quotes, commas and line breaks inside quotes.
  function parseCsv(text) {
    var out = [], row = [], value = "", quoted = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { value += '"'; i++; }
        else if (c === '"') quoted = false;
        else value += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") { row.push(value); value = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(value); out.push(row); row = []; value = "";
      } else value += c;
    }
    if (value !== "" || row.length) { row.push(value); out.push(row); }
    return out;
  }

  // First CSV row holds the column names. Each later row becomes an entry.
  function csvToEntries(text) {
    var lines = parseCsv(text);
    if (!lines.length) return [];
    var names = lines[0].map(function (name) { return name.trim().toLowerCase(); });
    return lines.slice(1).map(function (line) {
      var entry = {};
      names.forEach(function (name, i) { entry[name] = line[i]; });
      return entry;
    });
  }

  function clean(value) {
    return value === null || value === undefined ? "" : String(value).trim();
  }

  function number(value) {
    var n = parseFloat(clean(value).replace(/,/g, ""));
    return isNaN(n) ? null : n;
  }

  // ---------- Small building blocks ----------

  function cell(label, content) {
    var td = document.createElement("td");
    td.setAttribute("role", "cell");
    td.setAttribute("data-label", label);
    if (typeof content === "string") td.textContent = content;
    else if (content) td.appendChild(content);
    return td;
  }

  function link(href, text, hiddenText) {
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    if (hiddenText) {
      var hidden = document.createElement("span");
      hidden.className = "visually-hidden";
      hidden.textContent = " " + hiddenText;
      a.appendChild(hidden);
    }
    return a;
  }

  function isWebLink(value) { return /^https?:\/\//i.test(value); }

  function isEmail(value) { return /^[^\s@]+@[^\s@]+$/.test(value); }

  function contactLink(person) {
    if (isWebLink(person.contact)) return link(person.contact, "Contact", person.name);
    if (isEmail(person.contact)) return link("mailto:" + person.contact, "Email", person.name);
    if (person.contact) return document.createTextNode(person.contact);
    return null;
  }

  // People column: names, each linked to their email or profile when public.
  function peopleList(unit) {
    var span = document.createElement("span");
    span.className = "catalog-people";
    unit.people.forEach(function (person, i) {
      if (i > 0) span.appendChild(document.createTextNode(", "));
      var href = isEmail(person.contact) ? "mailto:" + person.contact
        : isWebLink(person.contact) ? person.contact
        : isWebLink(person.profile) ? person.profile : "";
      if (href) {
        var a = document.createElement("a");
        a.href = href;
        a.textContent = person.name;
        span.appendChild(a);
      } else {
        span.appendChild(document.createTextNode(person.name));
      }
    });
    return span;
  }

  // Details: one line per person with their links. Position titles are not shown
  // because they change often.
  function peopleDetail(unit) {
    var ul = document.createElement("ul");
    ul.className = "catalog-people-list";
    unit.people.forEach(function (person) {
      var li = document.createElement("li");
      var strong = document.createElement("strong");
      strong.textContent = person.name;
      li.appendChild(strong);
      [contactLink(person), isWebLink(person.profile) ? link(person.profile, "Profile", "of " + person.name) : null]
        .filter(Boolean)
        .forEach(function (item) {
          li.appendChild(document.createTextNode(" · "));
          li.appendChild(item);
        });
      ul.appendChild(li);
    });
    return ul;
  }

  // Source column: the main source as a short citation, linked to the original.
  function sourceShort(unit) {
    var first = unit.sources[0];
    if (!first) return null;
    var span = document.createElement("span");
    span.className = "catalog-source";
    if (isWebLink(first.url)) span.appendChild(link(first.url, first.short, ""));
    else span.textContent = first.short;
    if (unit.sources.length > 1) {
      span.appendChild(document.createTextNode(" +" + (unit.sources.length - 1)));
    }
    return span;
  }

  // Details: each source written out in full.
  function sourcesDetail(unit) {
    var ul = document.createElement("ul");
    ul.className = "catalog-sources-list";
    unit.sources.forEach(function (source) {
      var li = document.createElement("li");
      li.appendChild(document.createTextNode(source.authors + (source.year ? " (" + source.year + "). " : ". ")));
      if (isWebLink(source.url)) li.appendChild(link(source.url, source.title, ""));
      else li.appendChild(document.createTextNode(source.title));
      if (source.publisher) {
        li.appendChild(document.createTextNode(". "));
        var cite = document.createElement("cite");
        cite.textContent = source.publisher;
        li.appendChild(cite);
      }
      li.appendChild(document.createTextNode("."));
      ul.appendChild(li);
    });
    return ul;
  }

  function resourceLinks(unit) {
    if (!unit.resources.length) return null;
    var span = document.createElement("span");
    span.className = "catalog-links";
    unit.resources.forEach(function (url, i) {
      span.appendChild(link(url, unit.resources.length > 1 ? "Resource " + (i + 1) : "Resource", "about " + unit.label));
    });
    return span;
  }

  function typeLabel(type) {
    var short = TYPE_SHORT[type.toLowerCase()];
    if (!short || short === type) return type;
    var abbr = document.createElement("abbr");
    abbr.title = type;
    abbr.textContent = short;
    return abbr;
  }

  // ---------- Grouping entries into units ----------

  var UNIT_FIELDS = ["institution", "country", "faculty_or_school", "discipline", "unit_code", "unit_name",
    "year_level", "assessment_type", "cohort_size", "length_minutes", "weighting_percent", "year_started",
    "assessment_format"];

  // Same institution and unit code (or unit name if there is no code) = same unit.
  function unitKey(entry) {
    var code = clean(entry.unit_code).toUpperCase().replace(/\s+/g, "");
    var name = clean(entry.unit_name).toLowerCase();
    if (!code && !name) return "";
    return clean(entry.institution).toLowerCase() + "|" + (code || name);
  }

  function groupUnits(entries) {
    var units = [], byKey = {};
    entries.forEach(function (entry, index) {
      var key = unitKey(entry) || "person-" + index; // no unit given: keep as its own row
      var unit = byKey[key];
      if (!unit) {
        unit = byKey[key] = { key: key, people: [], resources: [] };
        UNIT_FIELDS.forEach(function (field) { unit[field] = ""; });
        units.push(unit);
      }
      UNIT_FIELDS.forEach(function (field) {
        if (!unit[field]) unit[field] = clean(entry[field]);
      });
      var resource = clean(entry.resource_url);
      if (isWebLink(resource) && unit.resources.indexOf(resource) === -1) unit.resources.push(resource);
      unit.people.push({
        name: clean(entry.name),
        contact: clean(entry.contact_public),
        profile: clean(entry.profile_url)
      });
    });
    units.forEach(function (unit) { unit.label = unit.unit_code || unit.unit_name || unit.people[0].name; });
    return units;
  }

  // Published examples: one entry per unit already, with its sources.
  function publishedUnits(entries, skipKeys) {
    var units = [];
    entries.forEach(function (entry) {
      var key = unitKey(entry);
      if (key && skipKeys[key]) return; // also in the main table
      var unit = { key: key, resources: [], sources: [], reported: clean(entry.reported) };
      UNIT_FIELDS.forEach(function (field) { unit[field] = clean(entry[field]); });
      var resource = clean(entry.resource_url);
      if (isWebLink(resource)) unit.resources.push(resource);
      (entry.sources || []).forEach(function (source) {
        unit.sources.push({
          short: clean(source.short) || clean(source.authors),
          authors: clean(source.authors),
          year: clean(source.year),
          title: clean(source.title),
          publisher: clean(source.publisher),
          url: clean(source.url)
        });
      });
      unit.label = unit.unit_code || unit.unit_name || unit.discipline;
      units.push(unit);
    });
    return units;
  }

  // ---------- Building the tables ----------

  function buildDetail(unit, id, list) {
    var tr = document.createElement("tr");
    tr.className = "catalog-detail";
    tr.id = id;
    tr.hidden = true;
    var td = document.createElement("td");
    td.colSpan = list.columns;
    var dl = document.createElement("dl");

    function add(term, value) {
      if (!value) return;
      var dt = document.createElement("dt");
      dt.textContent = term;
      var dd = document.createElement("dd");
      if (typeof value === "string") dd.textContent = value; else dd.appendChild(value);
      dl.appendChild(dt);
      dl.appendChild(dd);
    }

    add("How it runs", unit.assessment_format);
    if (list.kind === "people") add(unit.people.length > 1 ? "People" : "Person", peopleDetail(unit));
    else add(unit.sources.length > 1 ? "Sources" : "Source", sourcesDetail(unit));
    add("Unit", [unit.unit_code, unit.unit_name].filter(Boolean).join(" "));
    add("Faculty or school", unit.faculty_or_school);
    add("Institution", [unit.institution, unit.country].filter(Boolean).join(", "));
    add("Assessment type", unit.assessment_type);
    if (list.kind === "people") add("Running since", unit.year_started);
    else {
      add("Started", unit.year_started);
      add("Reported in", unit.reported);
    }
    add("Resources", resourceLinks(unit));
    td.appendChild(dl);
    tr.appendChild(td);
    return tr;
  }

  function buildItem(unit, index, list) {
    var students = number(unit.cohort_size);
    var minutes = number(unit.length_minutes);
    var weighting = number(unit.weighting_percent);
    var detailId = list.table.id + "-detail-" + index;

    var row = document.createElement("tr");
    row.setAttribute("role", "row");
    row.setAttribute("data-institution", unit.institution);
    row.setAttribute("data-country", unit.country);
    row.setAttribute("data-discipline", unit.discipline);
    row.setAttribute("data-year", unit.year_level);
    row.setAttribute("data-assessment_type", unit.assessment_type);
    if (students !== null) row.setAttribute("data-students", students);
    if (minutes !== null) row.setAttribute("data-minutes", minutes);

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "row-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", detailId);
    toggle.textContent = unit.label;
    var unitCell = document.createElement("span");
    unitCell.appendChild(toggle);
    if (unit.unit_code && unit.unit_name) {
      var sub = document.createElement("span");
      sub.className = "catalog-unit-name";
      sub.textContent = unit.unit_name;
      unitCell.appendChild(sub);
    }

    var detail = buildDetail(unit, detailId, list);
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      row.classList.toggle("is-open", open);
      detail.hidden = !open;
    });

    row.appendChild(cell("Unit", unitCell));
    row.appendChild(cell("Discipline", unit.discipline));
    row.appendChild(cell("Type", typeLabel(unit.assessment_type)));
    row.appendChild(cell("Year level", unit.year_level));
    row.appendChild(cell("Students", students === null ? "" : String(students)));
    row.appendChild(cell("Minutes", minutes === null ? "" : String(minutes)));
    row.appendChild(cell("Weighting", weighting === null ? "" : weighting + "%"));
    row.appendChild(cell("Institution", unit.institution));
    if (list.kind === "people") row.appendChild(cell("People", peopleList(unit)));
    else row.appendChild(cell("Source", sourceShort(unit)));

    return { row: row, detail: detail, toggle: toggle, text: (row.textContent + " " + detail.textContent).toLowerCase() };
  }

  // Start with similar units together: by discipline, then unit.
  function byDiscipline(a, b) {
    return a.discipline.localeCompare(b.discipline) || a.label.localeCompare(b.label);
  }

  // ---------- Search and filters ----------

  function inRange(value, range) {
    if (value === null || value === "") return false;
    var parts = range.split("-");
    var n = parseFloat(value);
    if (n < parseFloat(parts[0])) return false;
    return parts[1] === "" || n <= parseFloat(parts[1]);
  }

  function anyFilterSet() {
    return search.value.trim() !== "" || selects.concat(ranges).some(function (s) { return s.value; });
  }

  function matches(item, words) {
    var row = item.row;
    var show = words.every(function (word) { return item.text.indexOf(word) !== -1; });
    selects.forEach(function (select) {
      if (select.value && row.getAttribute("data-" + select.getAttribute("data-filter")) !== select.value) show = false;
    });
    ranges.forEach(function (select) {
      if (select.value && !inRange(row.getAttribute("data-" + select.getAttribute("data-range")), select.value)) show = false;
    });
    return show;
  }

  function update() {
    var words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    var filtered = anyFilterSet();
    lists.forEach(function (list) {
      var shown = 0;
      list.items.forEach(function (item) {
        var show = matches(item, words);
        item.row.hidden = !show;
        item.detail.hidden = !show || item.toggle.getAttribute("aria-expanded") !== "true";
        if (show) shown += 1;
      });
      list.shown = shown;
      if (!list.items.length) return;
      list.status.textContent = shown === 0
        ? "No units match. Try a different search or filter."
        : "Showing " + shown + " of " + list.items.length + (list.items.length === 1 ? " unit." : " units.");
    });
    if (published && publishedCount && published.items.length) {
      publishedCount.textContent = filtered
        ? "(" + published.shown + " of " + published.items.length + " match)"
        : "(" + published.items.length + " units)";
    }
    clearButton.disabled = !filtered;
  }

  function clearFilters() {
    search.value = "";
    selects.concat(ranges).forEach(function (select) { select.value = ""; });
    update();
    search.focus();
  }

  // Filter choices come from both tables.
  function fillSelects() {
    selects.forEach(function (select) {
      var key = select.getAttribute("data-filter");
      var values = [];
      lists.forEach(function (list) {
        list.items.forEach(function (item) {
          var value = item.row.getAttribute("data-" + key);
          if (value && values.indexOf(value) === -1) values.push(value);
        });
      });
      values.sort(function (a, b) { return a.localeCompare(b); });
      values.forEach(function (value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    });
  }

  function placeRows(list) {
    list.items.forEach(function (item) {
      list.body.appendChild(item.row);
      list.body.appendChild(item.detail);
    });
  }

  // Turn the sortable column headings into buttons.
  function makeSortable(list) {
    var headers = Array.prototype.slice.call(list.table.tHead.rows[0].cells);
    headers.forEach(function (header, index) {
      var type = header.getAttribute("data-sort");
      if (!type) return;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "sort-button";
      button.textContent = header.textContent;
      header.textContent = "";
      header.appendChild(button);

      button.addEventListener("click", function () {
        var direction = header.getAttribute("aria-sort") === "ascending" ? "descending" : "ascending";
        headers.forEach(function (other) { other.removeAttribute("aria-sort"); });
        header.setAttribute("aria-sort", direction);
        var sign = direction === "ascending" ? 1 : -1;

        list.items.sort(function (a, b) {
          var x = a.row.cells[index].textContent.trim();
          var y = b.row.cells[index].textContent.trim();
          if (type === "number") {
            // Entries with no number always go last.
            if (x === "" || y === "") return (x === "" ? 1 : 0) - (y === "" ? 1 : 0);
            return sign * (parseFloat(x) - parseFloat(y));
          }
          return sign * x.localeCompare(y);
        });
        placeRows(list);
      });
    });
  }

  // ---------- Start ----------

  function readPublished() {
    var script = document.getElementById("catalog-published-data");
    if (!script) return [];
    try { return JSON.parse(script.textContent) || []; } catch (e) { return []; }
  }

  // approvedEntries is null when the main catalogue could not be loaded.
  function start(approvedEntries) {
    var approvedKeys = {};
    if (approved && approvedEntries) {
      var entries = approvedEntries.filter(function (entry) { return clean(entry.name) !== ""; });
      var units = groupUnits(entries).sort(byDiscipline);
      units.forEach(function (unit) { approvedKeys[unit.key] = true; });
      approved.items = units.map(function (unit, i) { return buildItem(unit, i, approved); });
      if (approved.items.length) approved.table.hidden = false;
      else approved.status.textContent = "No entries yet. Be the first to add yours.";
    }

    if (published) {
      var examples = publishedUnits(readPublished(), approvedKeys).sort(byDiscipline);
      published.items = examples.map(function (unit, i) { return buildItem(unit, i, published); });
      if (published.items.length) {
        published.table.hidden = false;
        publishedSection.hidden = false;
      }
    }

    var withItems = lists.filter(function (list) { return list.items.length; });
    if (!withItems.length) return;

    withItems.forEach(function (list) {
      placeRows(list);
      makeSortable(list);
    });
    fillSelects();
    search.addEventListener("input", update);
    selects.concat(ranges).forEach(function (select) { select.addEventListener("change", update); });
    clearButton.addEventListener("click", clearFilters);
    controls.hidden = false;
    if (approved && approved.items.length) hint.hidden = false;
    update();
  }

  var sheetUrl = wrap.getAttribute("data-sheet-url");
  var local = document.getElementById("catalog-local");

  if (sheetUrl) {
    approved.status.textContent = "Loading the catalogue…";
    fetch(sheetUrl)
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (text) { start(csvToEntries(text)); }, function () {
        approved.status.textContent = "The catalogue could not be loaded. Please try again later.";
        start(null);
      });
  } else {
    start(local ? JSON.parse(local.textContent) : []);
  }
})();
