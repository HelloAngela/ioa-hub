// Catalogue page: loads the entries, builds the table, and runs the search,
// filters and sortable columns.
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
  var selects = Array.prototype.slice.call(controls.querySelectorAll("select[data-filter]"));
  var ranges = Array.prototype.slice.call(controls.querySelectorAll("select[data-range]"));
  var rows = [];

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

  function cell(label, main, subs) {
    var td = document.createElement("td");
    td.setAttribute("role", "cell");
    td.setAttribute("data-label", label);
    if (main) td.appendChild(document.createTextNode(main));
    (subs || []).forEach(function (sub) {
      if (!sub) return;
      var span = document.createElement("span");
      span.className = "sub";
      span.textContent = sub;
      td.appendChild(span);
    });
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

  function linksCell(entry, name) {
    var td = cell("Links", "");
    var items = [];
    var contact = clean(entry.contact_public);
    var profile = clean(entry.profile_url);
    var resource = clean(entry.resource_url);

    if (isWebLink(contact)) items.push(link(contact, "Contact", name));
    else if (/^[^\s@]+@[^\s@]+$/.test(contact)) items.push(link("mailto:" + contact, "Email", name));
    else if (contact) items.push(document.createTextNode(contact));
    if (isWebLink(profile)) items.push(link(profile, "Profile", "of " + name));
    if (isWebLink(resource)) items.push(link(resource, "Resource", "from " + name));

    items.forEach(function (item, i) {
      if (i > 0) td.appendChild(document.createElement("br"));
      td.appendChild(item);
    });
    return td;
  }

  function buildRow(entry) {
    var name = clean(entry.name);
    var students = number(entry.cohort_size);
    var minutes = number(entry.length_minutes);
    var weighting = number(entry.weighting_percent);
    var started = clean(entry.year_started);

    var tr = document.createElement("tr");
    tr.setAttribute("role", "row");
    tr.setAttribute("data-institution", clean(entry.institution));
    tr.setAttribute("data-country", clean(entry.country));
    tr.setAttribute("data-discipline", clean(entry.discipline));
    tr.setAttribute("data-year", clean(entry.year_level));
    tr.setAttribute("data-assessment_type", clean(entry.assessment_type));
    if (students !== null) tr.setAttribute("data-students", students);
    if (minutes !== null) tr.setAttribute("data-minutes", minutes);

    tr.appendChild(cell("Name", name, [clean(entry.title)]));
    tr.appendChild(cell("Institution", clean(entry.institution), [clean(entry.faculty_or_school), clean(entry.country)]));
    tr.appendChild(cell("Discipline", clean(entry.discipline)));
    tr.appendChild(cell("Assessment type", clean(entry.assessment_type)));
    tr.appendChild(cell("Unit", clean(entry.unit_code), [clean(entry.unit_name), clean(entry.year_level), started ? "Since " + started : ""]));
    tr.appendChild(cell("Students", students === null ? "" : String(students)));
    tr.appendChild(cell("Minutes", minutes === null ? "" : String(minutes)));
    tr.appendChild(cell("Weighting", weighting === null ? "" : weighting + "%"));
    tr.appendChild(cell("How it runs", clean(entry.assessment_format)));
    tr.appendChild(linksCell(entry, name));
    return tr;
  }

  // ---------- Search and filters ----------

  function inRange(value, range) {
    if (value === null || value === "") return false;
    var parts = range.split("-");
    var n = parseFloat(value);
    if (n < parseFloat(parts[0])) return false;
    return parts[1] === "" || n <= parseFloat(parts[1]);
  }

  function update() {
    var words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    rows.forEach(function (row) {
      var text = row.textContent.toLowerCase();
      var show = words.every(function (word) { return text.indexOf(word) !== -1; });
      selects.forEach(function (select) {
        if (select.value && row.getAttribute("data-" + select.getAttribute("data-filter")) !== select.value) show = false;
      });
      ranges.forEach(function (select) {
        if (select.value && !inRange(row.getAttribute("data-" + select.getAttribute("data-range")), select.value)) show = false;
      });
      row.hidden = !show;
      if (show) shown += 1;
    });
    status.textContent = shown === 0
      ? "No entries match. Try a different search or filter."
      : "Showing " + shown + " of " + rows.length + " entries.";
  }

  function fillSelects() {
    selects.forEach(function (select) {
      var key = select.getAttribute("data-filter");
      var values = [];
      rows.forEach(function (row) {
        var value = row.getAttribute("data-" + key);
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

        rows.sort(function (a, b) {
          var x = a.cells[index].textContent.trim();
          var y = b.cells[index].textContent.trim();
          if (type === "number") {
            // Entries with no number always go last.
            if (x === "" || y === "") return (x === "" ? 1 : 0) - (y === "" ? 1 : 0);
            return sign * (parseFloat(x) - parseFloat(y));
          }
          return sign * x.localeCompare(y);
        });
        rows.forEach(function (row) { body.appendChild(row); });
      });
    });
  }

  // ---------- Start ----------

  function show(entries) {
    entries = entries.filter(function (entry) { return clean(entry.name) !== ""; });
    rows = entries.map(buildRow);
    rows.forEach(function (row) { body.appendChild(row); });
    if (!rows.length) {
      status.textContent = "No entries yet. Be the first to add yours.";
      return;
    }

    fillSelects();
    makeSortable();
    search.addEventListener("input", update);
    selects.concat(ranges).forEach(function (select) { select.addEventListener("change", update); });
    controls.hidden = false;
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
