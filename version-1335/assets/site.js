(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMenu() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector(".menu-toggle");
    if (!header || !button) {
      return;
    }
    button.addEventListener("click", function () {
      header.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var previous = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function renderSearchResults(panel, query) {
    var movies = window.movieIndex || [];
    var q = normalize(query);
    if (!q) {
      panel.classList.remove("open");
      panel.innerHTML = "";
      return;
    }
    var results = movies.filter(function (movie) {
      return normalize(movie.title + " " + movie.region + " " + movie.year + " " + movie.type + " " + movie.genre + " " + movie.tags + " " + movie.oneLine).indexOf(q) !== -1;
    }).slice(0, 8);
    if (!results.length) {
      panel.innerHTML = "<div class="search-result"><div></div><div><strong>暂无匹配影片</strong><span>换个关键词试试</span></div></div>";
      panel.classList.add("open");
      return;
    }
    panel.innerHTML = results.map(function (movie) {
      return "<a class="search-result" href="" + movie.url + ""><img src="" + movie.cover + "" alt="" + movie.title.replace(/"/g, "&quot;") + ""><div><strong>" + movie.title + "</strong><span>" + movie.region + " · " + movie.year + " · " + movie.type + "</span></div></a>";
    }).join("");
    panel.classList.add("open");
  }

  function initGlobalSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".top-search, .mobile-search"));
    forms.forEach(function (form) {
      var input = form.querySelector("input");
      var panel = form.querySelector(".search-panel");
      if (!input || !panel) {
        return;
      }
      input.addEventListener("input", function () {
        renderSearchResults(panel, input.value);
      });
      input.addEventListener("focus", function () {
        renderSearchResults(panel, input.value);
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var first = panel.querySelector("a");
        if (first) {
          window.location.href = first.href;
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          panel.classList.remove("open");
        }
      });
    });
  }

  function initPageFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll(".page-filter"));
    forms.forEach(function (form) {
      var scope = form.closest("section") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .wide-card"));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .wide-card"));
      }
      var search = form.querySelector(".page-search-input");
      var region = form.querySelector(".page-region-filter");
      var year = form.querySelector(".page-year-filter");
      var type = form.querySelector(".page-type-filter");
      var empty = scope.querySelector(".filter-empty") || document.querySelector(".filter-empty");

      function apply() {
        var q = normalize(search && search.value);
        var r = normalize(region && region.value);
        var y = normalize(year && year.value);
        var t = normalize(type && type.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize(card.dataset.title + " " + card.dataset.region + " " + card.dataset.year + " " + card.dataset.type + " " + card.dataset.tags);
          var ok = true;
          if (q && text.indexOf(q) === -1) {
            ok = false;
          }
          if (r && normalize(card.dataset.region) !== r) {
            ok = false;
          }
          if (y && normalize(card.dataset.year) !== y) {
            ok = false;
          }
          if (t && normalize(card.dataset.type) !== t) {
            ok = false;
          }
          card.classList.toggle("hidden-by-filter", !ok);
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.style.display = visible ? "none" : "block";
        }
      }

      [search, region, year, type].forEach(function (element) {
        if (element) {
          element.addEventListener("input", apply);
          element.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  function attachVideo(video, source) {
    if (video.dataset.ready === "true") {
      return;
    }
    video.dataset.ready = "true";
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    video.src = source;
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector(".video-cover");
      var source = player.getAttribute("data-src");
      if (!video || !source) {
        return;
      }
      function play() {
        attachVideo(video, source);
        player.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initGlobalSearch();
    initPageFilters();
    initPlayers();
  });
})();
