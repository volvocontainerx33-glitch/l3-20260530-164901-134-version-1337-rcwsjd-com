(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    document.querySelectorAll("[data-nav-toggle]").forEach(function (button) {
      button.addEventListener("click", function () {
        var menu = document.querySelector("[data-mobile-menu]");
        if (menu) {
          menu.classList.toggle("is-open");
        }
      });
    });

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.style.opacity = "0";
      }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var featureTitle = document.querySelector("[data-hero-title]");
    var featureDesc = document.querySelector("[data-hero-desc]");
    var featureLink = document.querySelector("[data-hero-link]");
    var featureMeta = document.querySelector("[data-hero-meta]");
    var active = 0;

    function showHero(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
      var slide = slides[active];
      if (featureTitle) {
        featureTitle.textContent = slide.getAttribute("data-title") || "";
      }
      if (featureDesc) {
        featureDesc.textContent = slide.getAttribute("data-desc") || "";
      }
      if (featureMeta) {
        featureMeta.textContent = slide.getAttribute("data-meta") || "";
      }
      if (featureLink) {
        featureLink.setAttribute("href", slide.getAttribute("data-link") || "#");
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showHero(index);
      });
    });

    if (slides.length) {
      showHero(0);
      setInterval(function () {
        showHero(active + 1);
      }, 5600);
    }

    var searchInput = document.querySelector("[data-card-search]");
    var categoryButtons = Array.prototype.slice.call(document.querySelectorAll("[data-category-filter]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    var currentCategory = "all";

    function applyFilters() {
      var term = normalize(searchInput ? searchInput.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var category = card.getAttribute("data-category") || "";
        var matchText = !term || title.indexOf(term) !== -1;
        var matchCategory = currentCategory === "all" || category === currentCategory;
        var shouldShow = matchText && matchCategory;
        card.style.display = shouldShow ? "" : "none";
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    categoryButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        categoryButtons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        currentCategory = button.getAttribute("data-category-filter") || "all";
        applyFilters();
      });
    });
  });

  window.initPlayer = function (options) {
    ready(function () {
      var video = document.getElementById(options.videoId);
      var button = document.getElementById(options.playButtonId);
      var overlay = document.getElementById(options.overlayId);
      var src = options.source;
      var hlsInstance = null;

      if (!video || !src) {
        return;
      }

      function attachSource() {
        if (video.getAttribute("data-ready") === "1") {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            var promise = video.play();
            if (promise && promise.catch) {
              promise.catch(function () {});
            }
          });
        } else {
          video.src = src;
        }
        video.setAttribute("data-ready", "1");
      }

      function start() {
        attachSource();
        video.setAttribute("controls", "controls");
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          start();
        });
      }
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.getAttribute("data-ready") !== "1") {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
