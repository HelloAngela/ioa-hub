// Publications page: search, topic and type filters, sorting and a summaries switch.
// The list itself is built by _includes/publication-list.html; this script only
// shows, hides and reorders the items. Without JavaScript every publication shows,
// newest first, with its summary, and the controls stay hidden.
//
// Picking several topics shows publications that have all of them
// (for example "Vivas and oral exams" and "Large classes").
//
// The chosen filters are kept in the page address, for example
//   /publications/?topic=viva,large-classes&type=research
// so a filtered view can be linked from emails and slides.
// Address options: topic (comma-separated slugs), type (a type slug), q (search
// words), sort (oldest / title), summaries (1 to show summaries).

(function () {
  "use strict";

  var list = document.getElementById("pub-list");
  var controls = document.getElementById("pub-filters");
  if (!list || !controls) return;

  var items = Array.prototype.slice.call(list.querySelectorAll("li[data-date]"));
  items.forEach(function (item, index) { item.setAttribute("data-order", index); });

  var status = document.getElementById("pub-status");
  var search = document.getElementById("pub-search");
  var typeSelect = document.getElementById("pub-type");
  var sortSelect = document.getElementById("pub-sort");
  var summaries = document.getElementById("pub-summaries");
  var clearButton = document.getElementById("pub-clear");
  var details = document.getElementById("pub-topic-details");
  var topicCount = document.getElementById("pub-topic-count");
  var topicGroup = controls.querySelector('[data-filter-group="topic"]');

  var SORTS = ["newest", "oldest", "title"];
  var state = { topics: [], type: "all", q: "", sort: "newest", summaries: false };

  function topicsOf(item) {
    var value = item.getAttribute("data-topics") || "";
    return value ? value.split(" ") : [];
  }

  function topicButtons() {
    return Array.prototype.slice.call(topicGroup.querySelectorAll(".filter-button"));
  }

  // ---------- Topic buttons: add counts, hide topics with no publications ----------

  var knownTopics = [];
  topicButtons().forEach(function (button) {
    var slug = button.getAttribute("data-filter-value");
    var count = items.filter(function (item) { return topicsOf(item).indexOf(slug) !== -1; }).length;
    if (count === 0) {
      button.parentNode.removeChild(button);
      return;
    }
    knownTopics.push(slug);
    var number = document.createElement("span");
    number.className = "filter-count";
    number.textContent = " (" + count + ")";
    button.appendChild(number);
  });
  if (knownTopics.length === 0) details.hidden = true;

  // Types with no publications are dropped from the list.
  var knownTypes = [];
  Array.prototype.slice.call(typeSelect.options).forEach(function (option) {
    if (option.value === "all") return;
    var used = items.some(function (item) { return item.getAttribute("data-type") === option.value; });
    if (used) knownTypes.push(option.value);
    else typeSelect.removeChild(option);
  });

  // ---------- Read and write the page address ----------

  function readAddress() {
    var params = new URLSearchParams(window.location.search);
    state.topics = (params.get("topic") || "").split(",").filter(function (slug) {
      return knownTopics.indexOf(slug) !== -1;
    });
    var type = params.get("type");
    state.type = knownTypes.indexOf(type) !== -1 ? type : "all";
    state.q = (params.get("q") || "").trim();
    var sort = params.get("sort");
    state.sort = SORTS.indexOf(sort) !== -1 ? sort : "newest";
    state.summaries = params.get("summaries") === "1";
  }

  function writeAddress() {
    var params = new URLSearchParams(window.location.search);
    ["topic", "type", "q", "sort", "summaries"].forEach(function (key) { params.delete(key); });
    if (state.topics.length) params.set("topic", state.topics.join(","));
    if (state.type !== "all") params.set("type", state.type);
    if (state.q) params.set("q", state.q);
    if (state.sort !== "newest") params.set("sort", state.sort);
    if (state.summaries) params.set("summaries", "1");
    // Keep commas readable in the address.
    var query = params.toString().replace(/%2C/gi, ",");
    var address = window.location.pathname + (query ? "?" + query : "") + window.location.hash;
    try { window.history.replaceState(null, "", address); } catch (e) { /* ignore */ }
  }

  // ---------- Show the current state in the controls ----------

  function showControls() {
    topicButtons().forEach(function (button) {
      var on = state.topics.indexOf(button.getAttribute("data-filter-value")) !== -1;
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    topicCount.textContent = state.topics.length ? "(" + state.topics.length + " selected)" : "";
    if (search.value.trim() !== state.q) search.value = state.q;
    typeSelect.value = state.type;
    sortSelect.value = state.sort;
    summaries.checked = state.summaries;
    list.classList.toggle("pub-list--no-notes", !state.summaries);
  }

  // ---------- Filter and sort ----------

  function matches(item) {
    if (state.type !== "all" && item.getAttribute("data-type") !== state.type) return false;
    if (state.topics.length) {
      var topics = topicsOf(item);
      var all = state.topics.every(function (slug) { return topics.indexOf(slug) !== -1; });
      if (!all) return false;
    }
    if (state.q) {
      var text = item.getAttribute("data-search") || "";
      var words = state.q.toLowerCase().split(/\s+/);
      for (var i = 0; i < words.length; i += 1) {
        if (text.indexOf(words[i]) === -1) return false;
      }
    }
    return true;
  }

  function compare(a, b) {
    var order = Number(a.getAttribute("data-order")) - Number(b.getAttribute("data-order"));
    if (state.sort === "title") {
      return a.getAttribute("data-title").localeCompare(b.getAttribute("data-title"), "en-AU") || order;
    }
    var dateA = a.getAttribute("data-date") || "";
    var dateB = b.getAttribute("data-date") || "";
    if (dateA === dateB) return order;
    var newestFirst = dateA < dateB ? 1 : -1;
    return state.sort === "oldest" ? -newestFirst : newestFirst;
  }

  function update() {
    var shown = 0;
    items.slice().sort(compare).forEach(function (item) {
      var show = matches(item);
      item.hidden = !show;
      if (show) shown += 1;
      list.appendChild(item);
    });
    var noun = items.length === 1 ? "publication" : "publications";
    var message = "Showing " + shown + " of " + items.length + " " + noun + ".";
    if (shown === 0) message += " Nothing matches these filters. Try fewer topics or clear the filters.";
    status.textContent = message;
    clearButton.disabled = !state.topics.length && state.type === "all" && !state.q;
  }

  function refresh() {
    showControls();
    update();
    writeAddress();
  }

  // ---------- Topic block: open on wide screens, folded on phones ----------

  var wide = window.matchMedia("(min-width: 48rem)");
  function fitTopics() {
    if (wide.matches) details.open = true;
    else details.open = state.topics.length > 0;
  }
  if (wide.addEventListener) wide.addEventListener("change", fitTopics);
  else if (wide.addListener) wide.addListener(fitTopics);
  // On wide screens the summary is hidden, so keep the block open.
  details.addEventListener("toggle", function () {
    if (wide.matches && !details.open) details.open = true;
  });

  // ---------- Events ----------

  topicGroup.addEventListener("click", function (event) {
    var button = event.target.closest(".filter-button[data-filter-value]");
    if (!button) return;
    var value = button.getAttribute("data-filter-value");
    var at = state.topics.indexOf(value);
    if (at === -1) state.topics.push(value);
    else state.topics.splice(at, 1);
    refresh();
  });

  search.addEventListener("input", function () {
    state.q = search.value.trim();
    update();
    writeAddress();
  });

  typeSelect.addEventListener("change", function () {
    state.type = typeSelect.value;
    refresh();
  });

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    refresh();
  });

  summaries.addEventListener("change", function () {
    state.summaries = summaries.checked;
    showControls();
    writeAddress();
  });

  clearButton.addEventListener("click", function () {
    state.topics = [];
    state.type = "all";
    state.q = "";
    search.value = "";
    refresh();
  });

  readAddress();
  controls.hidden = false;
  fitTopics();
  refresh();
})();
