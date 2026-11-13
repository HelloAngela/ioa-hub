// Catalog page: search box, three filters and sortable columns.
// The table itself is built by Jekyll, so it still shows if this script fails.
(function () {
  var table = document.getElementById("catalog-table");
  if (!table) return;

  var body = table.tBodies[0];
  var rows = Array.prototype.slice.call(body.rows);
  var controls = document.getElementById("catalog-filters");
  var search = document.getElementById("catalog-search");
  var status = document.getElementById("catalog-status");
  var selects = Array.prototype.slice.call(controls.querySelectorAll("select[data-filter]"));

  // Fill each drop-down with the values found in the table.
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

  function update() {
    var words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    rows.forEach(function (row) {
      var text = row.textContent.toLowerCase();
      var show = words.every(function (word) { return text.indexOf(word) !== -1; });
      selects.forEach(function (select) {
        if (select.value && row.getAttribute("data-" + select.getAttribute("data-filter")) !== select.value) {
          show = false;
        }
      });
      row.hidden = !show;
      if (show) shown += 1;
    });
    status.textContent = shown === 0
      ? "No entries match. Try a different search or filter."
      : "Showing " + shown + " of " + rows.length + " entries.";
  }

  search.addEventListener("input", update);
  selects.forEach(function (select) { select.addEventListener("change", update); });

  // Turn the sortable column headings into buttons.
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
          return sign * ((parseFloat(x) || 0) - (parseFloat(y) || 0));
        }
        return sign * x.localeCompare(y);
      });
      rows.forEach(function (row) { body.appendChild(row); });
    });
  });

  controls.hidden = false;
  update();
})();
