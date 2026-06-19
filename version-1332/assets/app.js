function ready(callback) {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback);
  }
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function safeText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function bindNavigation() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  if (!header || !toggle) {
    return;
  }
  toggle.addEventListener("click", function () {
    header.classList.toggle("nav-open");
  });
}

function bindHeroSlider() {
  const slider = document.querySelector("[data-hero-slider]");
  if (!slider) {
    return;
  }
  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dots = Array.from(slider.querySelectorAll(".hero-dot"));
  if (!slides.length) {
    return;
  }
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("active", slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      show(index);
      start();
    });
  });

  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);
  show(0);
  start();
}

function bindLocalFilters() {
  document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
    const input = scope.querySelector(".local-filter-input");
    const select = scope.querySelector(".local-year-filter");
    const reset = scope.querySelector(".local-filter-reset");
    const grid = document.querySelector(scope.getAttribute("data-filter-scope"));
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));
    const empty = document.querySelector(scope.getAttribute("data-empty-target") || "");

    function apply() {
      const query = normalizeText(input ? input.value : "");
      const year = select ? select.value : "";
      let visible = 0;
      cards.forEach(function (card) {
        const haystack = normalizeText([
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" "));
        const yearMatch = !year || card.getAttribute("data-year") === year;
        const queryMatch = !query || haystack.includes(query);
        const show = yearMatch && queryMatch;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (select) {
      select.addEventListener("change", apply);
    }
    if (reset) {
      reset.addEventListener("click", function () {
        if (input) {
          input.value = "";
        }
        if (select) {
          select.value = "";
        }
        apply();
      });
    }
    apply();
  });
}

function movieCardTemplate(movie) {
  const tags = (movie.tags || []).slice(0, 4).map(function (tag) {
    return "<span>" + safeText(tag) + "</span>";
  }).join("");
  return "<article class=\"movie-card\" data-movie-card>" +
    "<a class=\"movie-poster\" href=\"" + safeText(movie.url) + "\">" +
    "<img src=\"./" + safeText(movie.cover) + ".jpg\" alt=\"" + safeText(movie.title) + "\" loading=\"lazy\">" +
    "<span class=\"poster-shade\"></span><span class=\"watch-badge\">立即观看</span></a>" +
    "<div class=\"movie-body\"><div class=\"movie-meta\"><span>" + safeText(movie.year) + "</span><span>" + safeText(movie.region) + "</span><span>" + safeText(movie.type) + "</span></div>" +
    "<h3><a href=\"" + safeText(movie.url) + "\">" + safeText(movie.title) + "</a></h3>" +
    "<p>" + safeText(movie.one_line) + "</p><div class=\"tag-row\">" + tags + "</div></div></article>";
}

function bindSearchPage() {
  const results = document.querySelector("#search-results");
  const input = document.querySelector("#search-input");
  const form = document.querySelector("#search-form");
  if (!results || !input || !window.SEARCH_MOVIES) {
    return;
  }
  const params = new URLSearchParams(window.location.search);
  input.value = params.get("q") || "";

  function render() {
    const query = normalizeText(input.value);
    const matched = window.SEARCH_MOVIES.filter(function (movie) {
      const haystack = normalizeText([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        (movie.tags || []).join(" "),
        movie.one_line
      ].join(" "));
      return !query || haystack.includes(query);
    }).slice(0, 120);
    results.innerHTML = matched.map(movieCardTemplate).join("");
    const empty = document.querySelector("#search-empty");
    if (empty) {
      empty.style.display = matched.length ? "none" : "block";
    }
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const url = new URL(window.location.href);
      if (input.value.trim()) {
        url.searchParams.set("q", input.value.trim());
      } else {
        url.searchParams.delete("q");
      }
      window.history.replaceState(null, "", url.toString());
      render();
    });
  }
  input.addEventListener("input", render);
  render();
}

function setupMoviePlayer(videoId, source, overlayId) {
  const video = document.getElementById(videoId);
  const overlay = document.getElementById(overlayId);
  if (!video) {
    return;
  }
  let attached = false;

  function attachSource() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    video.src = source;
  }

  function playVideo() {
    attachSource();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
}

ready(function () {
  bindNavigation();
  bindHeroSlider();
  bindLocalFilters();
  bindSearchPage();
});
