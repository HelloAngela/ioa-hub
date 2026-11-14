// Resources page: topic, audience and source filters, search and sorting.
// The list itself is built by _includes/resource-list.html; this script only
// shows, hides and reorders the items. Without JavaScript every resource shows,
// newest first, and the controls stay hidden.
//
// The chosen filters are kept in the page address, for example
//   /resources/?topic=logistics,moderation&audience=staff
// so a filtered view can be linked from emails and slides.
// Address options: topic (comma-separated slugs), audience (staff / students),
// source (doi / shared), q (search words), sort (oldest / title).

(function () {
  "use strict";

  var list = document.getElementById("resource-list");
  var controls = document.getElementById("resource-filters");
  if (!list || !controls) return;

  var items = Array.prototype.slice.call(list.querySelectorAll("li[data-source]"));
  items.forEach(function (item, index) { item.setAttribute("data-order", index); });

  var status = document.getElementById("resource-status");
  var search = document.getElementById("resource-search");
  var sortSelect = document.getElementById("resource-sort");
  var clearButton = document.getElementById("resource-clear");
  var details = document.getElementById("resource-topic-details");
  var topicCount = document.getElementById("resource-topic-count");
  var groups = {
    audience: controls.querySelector('[data-filter-group="audience"]'),
    source: controls.querySelector('[data-filter-group="source"]'),
    topic: controls.querySelector('[data-filter-group="topic"]')
  };

  var SORTS = ["newest", "oldest", "title"];
  var state = { topics: [], audience: "all", source: "all", q: "", sort: "newest" };

  function topicsOf(item) {
    var value = item.getAttribute("data-topics") || "";
    return value ? value.split(" ") : [];
  }

  function buttonsIn(group) {
    return Array.prototype.slice.call(group.querySelectorAll(".filter-button"));
  }

  // ---------- Topic buttons: add counts, hide topics with no resources ----------

  var knownTopics = [];
  buttonsIn(groups.topic).forEach(function (button) {
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

  // ---------- Read and write the page address ----------

  function readAddress() {
    var params = new URLSearchParams(window.location.search);
    state.topics = (params.get("topic") || "").split(",").filter(function (slug) {
      return knownTopics.indexOf(slug) !== -1;
    });
    var audience = params.get("audience");
    state.audience = audience === "staff" || audience === "students" ? audience : "all";
    var source = params.get("source");
    state.source = source === "doi" || source === "shared" ? source : "all";
    state.q = (params.get("q") || "").trim();
    var sort = params.get("sort");
    state.sort = SORTS.indexOf(sort) !== -1 ? sort : "newest";
  }

  function writeAddress() {
    var params = new URLSearchParams(window.location.search);
    ["topic", "audience", "source", "q", "sort"].forEach(function (key) { params.delete(key); });
    if (state.topics.length) params.set("topic", state.topics.join(","));
    if (state.audience !== "all") params.set("audience", state.audience);
    if (state.source !== "all") params.set("source", state.source);
    if (state.q) params.set("q", state.q);
    if (state.sort !== "newest") params.set("sort", state.sort);
    // Keep commas readable in the address.
    var query = params.toString().replace(/%2C/gi, ",");
    var address = window.location.pathname + (query ? "?" + query : "") + window.location.hash;
    try { window.history.replaceState(null, "", address); } catch (e) { /* ignore */ }
  }

  // ---------- Show the current state in the controls ----------

  function showControls() {
    buttonsIn(groups.audience).forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-filter-value") === state.audience ? "true" : "false");
    });
    buttonsIn(groups.source).forEach(function (button) {
      button.setAttribute("aria-pressed", button.getAttribute("data-filter-value") === state.source ? "true" : "false");
    });
    buttonsIn(groups.topic).forEach(function (button) {
      var on = state.topics.indexOf(button.getAttribute("data-filter-value")) !== -1;
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    topicCount.textContent = state.topics.length ? "(" + state.topics.length + " selected)" : "";
    if (search.value.trim() !== state.q) search.value = state.q;
    sortSelect.value = state.sort;
  }

  // ---------- Filter and sort ----------

  function matches(item) {
    var audience = item.getAttribute("data-audience");
    // A resource for "both" shows under Staff and under Students.
    if (state.audience !== "all" && audience !== state.audience && audience !== "both") return false;
    if (state.source !== "all" && item.getAttribute("data-source") !== state.source) return false;
    if (state.topics.length) {
      var topics = topicsOf(item);
      var any = state.topics.some(function (slug) { return topics.indexOf(slug) !== -1; });
      if (!any) return false;
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
    var noun = items.length === 1 ? "resource" : "resources";
    var message = "Showing " + shown + " of " + items.length + " " + noun + ".";
    if (shown === 0) message += " No resources match these filters. Try fewer topics or clear the filters.";
    status.textContent = message;
    clearButton.disabled = !state.topics.length && state.audience === "all" && state.source === "all" && !state.q;
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

  controls.addEventListener("click", function (event) {
    var button = event.target.closest(".filter-button[data-filter-value]");
    if (!button) return;
    var group = button.closest("[data-filter-group]").getAttribute("data-filter-group");
    var value = button.getAttribute("data-filter-value");
    if (group === "topic") {
      var at = state.topics.indexOf(value);
      if (at === -1) state.topics.push(value);
      else state.topics.splice(at, 1);
    } else {
      state[group] = value;
    }
    refresh();
  });

  search.addEventListener("input", function () {
    state.q = search.value.trim();
    update();
    writeAddress();
  });

  sortSelect.addEventListener("change", function () {
    state.sort = sortSelect.value;
    refresh();
  });

  clearButton.addEventListener("click", function () {
    state.topics = [];
    state.audience = "all";
    state.source = "all";
    state.q = "";
    search.value = "";
    refresh();
  });

  readAddress();
  controls.hidden = false;
  fitTopics();
  refresh();
})();
