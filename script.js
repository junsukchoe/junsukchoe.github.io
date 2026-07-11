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

  var newsList = document.getElementById("news-timeline");
  var newsToggle = document.getElementById("news-toggle");
  if (newsList && newsToggle) {
    setupCollapsible(newsList, newsToggle, 6);
  }

  var pubList = document.getElementById("publication-list");
  var pubToggle = document.getElementById("pub-toggle");
  var pubFilters = document.getElementById("pub-filters");

  if (pubList && pubToggle) {
    var pubItems = Array.prototype.slice.call(pubList.children);
    var COLLAPSE_COUNT = 12;
    var expanded = false;
    var activeType = "all";

    pubItems.forEach(function (item) {
      var code = item.querySelector("span").textContent.match(/^[A-Za-z]+/);
      item.dataset.type = code ? code[0] : "";
    });

    function render() {
      var shown = 0;
      var matching = 0;
      pubItems.forEach(function (item) {
        var matches = activeType === "all" || item.dataset.type === activeType;
        if (!matches) {
          item.hidden = true;
          return;
        }
        matching++;
        var visible = expanded || activeType !== "all" || shown < COLLAPSE_COUNT;
        item.hidden = !visible;
        if (visible) shown++;
      });

      var showToggle = activeType === "all" && matching > COLLAPSE_COUNT;
      pubToggle.hidden = !showToggle;
      if (showToggle) {
        pubToggle.textContent = expanded
          ? "Show fewer"
          : "Show all publications (" + (matching - COLLAPSE_COUNT) + " more)";
        pubToggle.setAttribute("aria-expanded", String(expanded));
      }
    }

    pubToggle.addEventListener("click", function () {
      expanded = !expanded;
      render();
    });

    if (pubFilters) {
      pubFilters.addEventListener("click", function (event) {
        var button = event.target.closest("[data-filter]");
        if (!button) return;
        activeType = button.dataset.filter;
        expanded = false;
        Array.prototype.slice.call(pubFilters.children).forEach(function (btn) {
          var isActive = btn === button;
          btn.classList.toggle("is-active", isActive);
          btn.setAttribute("aria-selected", String(isActive));
        });
        render();
      });
    }

    render();
  }
})();
