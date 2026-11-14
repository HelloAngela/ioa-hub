// Videos: loading the YouTube player only on click (all pages),
// the filter buttons (Videos page) and the carousel arrows (home page).
(function () {
  // ---------- Swap the thumbnail for the YouTube player when it is clicked ----------

  document.addEventListener("click", function (event) {
    var link = event.target.closest("a[data-youtube-id]");
    if (!link) return;
    event.preventDefault();

    var frame = document.createElement("div");
    frame.className = "video-frame";
    var player = document.createElement("iframe");
    player.src = "https://www.youtube-nocookie.com/embed/" +
      encodeURIComponent(link.getAttribute("data-youtube-id")) + "?autoplay=1&rel=0";
    player.title = link.getAttribute("data-title");
    player.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    player.allowFullscreen = true;
    frame.appendChild(player);
    link.parentNode.replaceChild(frame, link);
    player.focus();
  });

  // ---------- Carousel selection (home page) ----------
  // The page lists every playlist video. Keep a random selection that changes
  // once a day (everyone sees the same videos on the same day) and remove the rest.
  // The number to keep is set by data-carousel-pick on the track.

  function pickForToday(track) {
    var keep = parseInt(track.getAttribute("data-carousel-pick"), 10);
    var cards = Array.prototype.slice.call(track.children);
    if (!keep || cards.length <= 1) return;

    var today = new Date();
    var seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    function random() {
      // Small repeatable random number generator (mulberry32), seeded by the date.
      seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    // Shuffle (Fisher–Yates), then keep the first ones.
    for (var i = cards.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var swap = cards[i]; cards[i] = cards[j]; cards[j] = swap;
    }
    cards.forEach(function (card, index) {
      if (index < keep) track.appendChild(card);
      else track.removeChild(card);
    });
  }

  // ---------- Carousel arrows (home page) ----------

  Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), function (carousel) {
    var track = carousel.querySelector(".carousel__track");
    var controls = carousel.querySelector(".carousel__controls");
    var previous = carousel.querySelector("[data-carousel-previous]");
    var next = carousel.querySelector("[data-carousel-next]");
    if (!track || !controls) return;

    pickForToday(track);

    function step() {
      var card = track.querySelector("li");
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
    }

    function refresh() {
      previous.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    }

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function move(direction) {
      track.scrollBy({ left: direction * step(), behavior: reduceMotion ? "auto" : "smooth" });
    }

    previous.addEventListener("click", function () { move(-1); });
    next.addEventListener("click", function () { move(1); });
    track.addEventListener("scroll", refresh);
    window.addEventListener("resize", refresh);
    controls.hidden = false;
    refresh();
  });

  // ---------- Filter buttons (Videos page) ----------

  var grid = document.getElementById("video-grid");
  var filters = document.getElementById("video-filters");
  if (!grid || !filters) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(".video-card"));
  var status = document.getElementById("video-status");
  var chosen = { audience: "all", topic: "all" };

  function matches(card) {
    var audience = card.getAttribute("data-audience");
    var topic = card.getAttribute("data-topic");
    // A video for "both" shows under Staff and under Students.
    var audienceOk = chosen.audience === "all" || audience === chosen.audience || audience === "both";
    var topicOk = chosen.topic === "all" || topic === chosen.topic;
    return audienceOk && topicOk;
  }

  function update() {
    var shown = 0;
    cards.forEach(function (card) {
      var show = matches(card);
      card.hidden = !show;
      if (show) shown += 1;
    });
    if (status) {
      status.textContent = "Showing " + shown + " of " + cards.length + " videos.";
    }
  }

  filters.hidden = false;
  filters.addEventListener("click", function (event) {
    var button = event.target.closest(".filter-button");
    if (!button) return;
    var group = button.closest("[data-filter-group]");
    chosen[group.getAttribute("data-filter-group")] = button.getAttribute("data-filter-value");
    Array.prototype.forEach.call(group.querySelectorAll(".filter-button"), function (other) {
      other.setAttribute("aria-pressed", other === button ? "true" : "false");
    });
    update();
  });
  update();
})();
