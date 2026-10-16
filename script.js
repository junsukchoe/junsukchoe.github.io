(function () {
  function setupCollapsible(list, toggle, count) {
    var items = Array.prototype.slice.call(list.children);
    var expanded = false;

    function render() {
      items.forEach(function (item, index) {
        item.hidden = !expanded && index >= count;
      });
      var remaining = items.length - count;
      toggle.hidden = remaining <= 0;
      if (remaining > 0) {
        toggle.textContent = expanded ? "Show fewer" : "Show all (" + remaining + " more)";
        toggle.setAttribute("aria-expanded", String(expanded));
      }
    }

    toggle.addEventListener("click", function () {
      expanded = !expanded;
      render();
    });

    render();
  }

  // The counts and the year are also written into the HTML so they survive with
  // JS off; these keep them from drifting as the roster and the calendar move on.
  Array.prototype.forEach.call(
    document.querySelectorAll(".people-group"),
    function (group) {
      var tally = group.querySelector(".group-heading span");
      var people = group.querySelectorAll(".roster-list > li");
      if (tally) tally.textContent = String(people.length);
    }
  );

  // On narrow screens the nav scrolls sideways with its scrollbar hidden;
  // mark which edges still hide links so the CSS can fade them.
  var nav = document.querySelector(".nav");
  if (nav) {
    var updateNavEdges = function () {
      var hiddenLeft = nav.scrollLeft > 1;
      var hiddenRight = nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 1;
      var more = hiddenLeft && hiddenRight ? "both" : hiddenLeft ? "left" : hiddenRight ? "right" : "";
      if (more) nav.dataset.more = more;
      else delete nav.dataset.more;
    };
    nav.addEventListener("scroll", updateNavEdges, { passive: true });
    window.addEventListener("resize", updateNavEdges);
    updateNavEdges();
  }

  Array.prototype.forEach.call(
    document.querySelectorAll(".roster-subhead"),
    function (subhead) {
      var tally = subhead.querySelector("span");
      var list = subhead.nextElementSibling;
      if (tally && list) tally.textContent = String(list.children.length);
    }
  );

  var footerYear = document.getElementById("footer-year");
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  var newsList = document.getElementById("news-timeline");
  var newsToggle = document.getElementById("news-toggle");
  if (newsList && newsToggle) {
    setupCollapsible(newsList, newsToggle, 8);
  }

  // A safety net only: the two-column block holds a dozen hosts before any of
  // the older ones need to fold away.
  var visitList = document.getElementById("visit-list");
  var visitToggle = document.getElementById("visit-toggle");
  if (visitList && visitToggle) {
    setupCollapsible(visitList, visitToggle, 12);
  }

  // Each host keeps its people on one line so the two-column rows stay the
  // same height; a host whose people would wrap gets the full width instead.
  if (visitList) {
    var fitVisits = function () {
      var hosts = Array.prototype.slice.call(visitList.children);
      hosts.forEach(function (host) { host.classList.remove("visit-wide"); });
      if (getComputedStyle(visitList).gridTemplateColumns.split(" ").length < 2) return;
      hosts.forEach(function (host) {
        var people = host.querySelectorAll(".visit-people > li");
        var last = people[people.length - 1];
        if (last && last.offsetTop > people[0].offsetTop) host.classList.add("visit-wide");
      });
    };
    fitVisits();
    window.addEventListener("resize", fitVisits);
    if (document.fonts) document.fonts.ready.then(fitVisits);
  }

  var pubList = document.getElementById("publication-list");
  var pubToggle = document.getElementById("pub-toggle");
  var pubFilters = document.getElementById("pub-filters");

  if (pubList && pubToggle && pubFilters) {
    // Opens on "Selected": the eight most recent conference and journal papers
    // where the PI is a corresponding author, so the pick follows a rule rather
    // than a judgment. The list is newest first, so DOM order is recency. A
    // "^" marks co-corresponding authors; with no "^" on the paper, the last
    // author is taken as the sole corresponding author.
    var SELECTED_COUNT = 8;
    var pubItems = Array.prototype.slice.call(pubList.children);
    var filterButtons = Array.prototype.slice.call(pubFilters.querySelectorAll("[data-filter]"));
    var activeType = "selected";

    function piIsCorresponding(item) {
      var pi = item.querySelector(".pi");
      if (!pi) return false;
      var piName = pi.textContent.trim();
      if (/\^$/.test(piName)) return true;
      var authors = pi.parentNode.textContent.split(",").map(function (name) {
        return name.trim();
      });
      var anyCaret = authors.some(function (name) { return /\^$/.test(name); });
      return !anyCaret && authors[authors.length - 1] === piName;
    }

    var selectedSoFar = 0;
    pubItems.forEach(function (item) {
      var code = item.querySelector("span").textContent.match(/^[A-Za-z]+/);
      item.dataset.type = code ? code[0] : "";
      var eligible = (item.dataset.type === "C" || item.dataset.type === "J") && piIsCorresponding(item);
      if (eligible && selectedSoFar < SELECTED_COUNT) {
        item.dataset.selected = "";
        selectedSoFar++;
      }
    });

    function render() {
      pubItems.forEach(function (item) {
        var matches =
          activeType === "selected" ? item.hasAttribute("data-selected") :
          activeType === "all" || item.dataset.type === activeType;
        item.hidden = !matches;
      });

      pubToggle.hidden = activeType !== "selected";
      pubToggle.textContent = "Show all publications (" + pubItems.length + ")";

      filterButtons.forEach(function (btn) {
        var isActive = btn.dataset.filter === activeType;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", String(isActive));
      });
    }

    pubFilters.addEventListener("click", function (event) {
      var button = event.target.closest("[data-filter]");
      if (!button) return;
      activeType = button.dataset.filter;
      render();
    });

    pubToggle.addEventListener("click", function () {
      activeType = "all";
      render();
    });

    render();
  }
})();
