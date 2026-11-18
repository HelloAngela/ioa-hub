// Catalogue page: loads the entries, builds a compact table, and runs the search,
// filters and sortable columns.
//
// Each row is one unit. People submit the form once per unit, so entries with the
// same institution and unit code are grouped into one row, and everyone involved is
// listed under People. For unit details (students, minutes and so on) the earliest
// submission wins; blanks are filled from later ones. Selecting the unit opens a
// details row underneath (how it runs, people and links).
//
// The entries come from the public tab of the Google Sheet (if its link is set
// in _config.yml), or from _data/catalog.csv otherwise.
(function () {
  var wrap = document.getElementById("catalog");
  if (!wrap) return;

  var table = document.getElementById("catalog-table");
  var body = table.tBodies[0];
  var controls = document.getElementById("catalog-filters");
  var search = document.getElementById("catalog-search");
  var status = document.getElementById("catalog-status");
  var hint = document.getElementById("catalog-hint");
  var clearButton = document.getElementById("catalog-clear");
  var selects = Array.prototype.slice.call(controls.querySelectorAll("select[data-filter]"));
  var ranges = Array.prototype.slice.call(controls.querySelectorAll("select[data-range]"));
  var columns = table.tHead.rows[0].cells.length;
  var items = []; // one per entry: { row, detail, text }

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

  // ---------- Building the table ----------

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
    var hidden = document.createElement("span");
    hidden.className = "visually-hidden";
    hidden.textContent = " " + hiddenText;
    a.appendChild(hidden);
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

  // Details: one line per person with position and links.
  function peopleDetail(unit) {
    var ul = document.createElement("ul");
    ul.className = "catalog-people-list";
    unit.people.forEach(function (person) {
      var li = document.createElement("li");
      var strong = document.createElement("strong");
      strong.textContent = person.name;
      li.appendChild(strong);
      if (person.title) li.appendChild(document.createTextNode(", " + person.title));
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

  function unitKey(entry, index) {
    var code = clean(entry.unit_code).toUpperCase().replace(/\s+/g, "");
    var name = clean(entry.unit_name).toLowerCase();
    if (!code && !name) return "person-" + index; // no unit given: keep as its own row
    return clean(entry.institution).toLowerCase() + "|" + (code || name);
  }

  function groupUnits(entries) {
    var units = [], byKey = {};
    entries.forEach(function (entry, index) {
      var key = unitKey(entry, index);
      var unit = byKey[key];
      if (!unit) {
        unit = byKey[key] = { people: [], resources: [] };
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
        title: clean(entry.title),
        contact: clean(entry.contact_public),
        profile: clean(entry.profile_url)
      });
    });
    units.forEach(function (unit) { unit.label = unit.unit_code || unit.unit_name || unit.people[0].name; });
    return units;
  }

  // ---------- Building the table ----------

  function buildDetail(unit, id) {
    var tr = document.createElement("tr");
    tr.className = "catalog-detail";
    tr.id = id;
    tr.hidden = true;
    var td = document.createElement("td");
    td.colSpan = columns;
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
    add(unit.people.length > 1 ? "People" : "Person", peopleDetail(unit));
    add("Unit", [unit.unit_code, unit.unit_name].filter(Boolean).join(" "));
    add("Faculty or school", unit.faculty_or_school);
    add("Institution", [unit.institution, unit.country].filter(Boolean).join(", "));
    add("Assessment type", unit.assessment_type);
    add("Running since", unit.year_started);
    add("Resources", resourceLinks(unit));
    td.appendChild(dl);
    tr.appendChild(td);
    return tr;
  }

  function buildItem(unit, index) {
    var students = number(unit.cohort_size);
    var minutes = number(unit.length_minutes);
    var weighting = number(unit.weighting_percent);
    var detailId = "catalog-detail-" + index;

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

    var detail = buildDetail(unit, detailId);
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
    row.appendChild(cell("People", peopleList(unit)));

    return { row: row, detail: detail, toggle: toggle, text: (row.textContent + " " + detail.textContent).toLowerCase() };
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

  function update() {
    var words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    items.forEach(function (item) {
      var row = item.row;
      var show = words.every(function (word) { return item.text.indexOf(word) !== -1; });
      selects.forEach(function (select) {
        if (select.value && row.getAttribute("data-" + select.getAttribute("data-filter")) !== select.value) show = false;
      });
      ranges.forEach(function (select) {
        if (select.value && !inRange(row.getAttribute("data-" + select.getAttribute("data-range")), select.value)) show = false;
      });
      row.hidden = !show;
      item.detail.hidden = !show || item.toggle.getAttribute("aria-expanded") !== "true";
      if (show) shown += 1;
    });
    clearButton.disabled = !anyFilterSet();
    status.textContent = shown === 0
      ? "No entries match. Try a different search or filter."
      : "Showing " + shown + " of " + items.length + (items.length === 1 ? " unit." : " units.");
  }

  function clearFilters() {
    search.value = "";
    selects.concat(ranges).forEach(function (select) { select.value = ""; });
    update();
    search.focus();
  }

  function fillSelects() {
    selects.forEach(function (select) {
      var key = select.getAttribute("data-filter");
      var values = [];
      items.forEach(function (item) {
        var value = item.row.getAttribute("data-" + key);
        if (value && values.indexOf(value) === -1) values.push(value);
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

  function placeRows() {
    items.forEach(function (item) {
      body.appendChild(item.row);
      body.appendChild(item.detail);
    });
  }

  // Turn the sortable column headings into buttons.
  function makeSortable() {
    var headers = Array.prototype.slice.call(table.tHead.rows[0].cells);
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

        items.sort(function (a, b) {
          var x = a.row.cells[index].textContent.trim();
          var y = b.row.cells[index].textContent.trim();
          if (type === "number") {
            // Entries with no number always go last.
            if (x === "" || y === "") return (x === "" ? 1 : 0) - (y === "" ? 1 : 0);
            return sign * (parseFloat(x) - parseFloat(y));
          }
          return sign * x.localeCompare(y);
        });
        placeRows();
      });
    });
  }

  // ---------- Start ----------

  function show(entries) {
    entries = entries.filter(function (entry) { return clean(entry.name) !== ""; });
    var units = groupUnits(entries);
    // Start with similar units together: by discipline, then unit.
    units.sort(function (a, b) {
      return a.discipline.localeCompare(b.discipline) || a.label.localeCompare(b.label);
    });
    items = units.map(buildItem);
    if (!items.length) {
      status.textContent = "No entries yet. Be the first to add yours.";
      return;
    }

    placeRows();
    fillSelects();
    makeSortable();
    search.addEventListener("input", update);
    selects.concat(ranges).forEach(function (select) { select.addEventListener("change", update); });
    clearButton.addEventListener("click", clearFilters);
    controls.hidden = false;
    hint.hidden = false;
    table.hidden = false;
    update();
  }

  var sheetUrl = wrap.getAttribute("data-sheet-url");
  var local = document.getElementById("catalog-local");

  if (sheetUrl) {
    status.textContent = "Loading the catalogue…";
    fetch(sheetUrl)
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (text) { show(csvToEntries(text)); })
      .catch(function () {
        status.textContent = "The catalogue could not be loaded. Please try again later.";
      });
  } else if (local) {
    show(JSON.parse(local.textContent));
  }
})();
