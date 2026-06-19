(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var index = parseInt(dot.getAttribute('data-slide-dot'), 10);
        showSlide(index);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  });

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilters(root) {
    var input = root.querySelector('[data-filter-input]');
    var yearSelect = root.querySelector('[data-filter-year]');
    var regionSelect = root.querySelector('[data-filter-region]');
    var grid = root.querySelector('[data-filter-grid]');
    var empty = root.querySelector('[data-empty-state]');

    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function filterCards() {
      var query = normalize(input && input.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchesRegion = !region || normalize(card.getAttribute('data-region')) === region;
        var show = matchesQuery && matchesYear && matchesRegion;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        input.value = query;
      }
      input.addEventListener('input', filterCards);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', filterCards);
    }
    if (regionSelect) {
      regionSelect.addEventListener('change', filterCards);
    }

    filterCards();
  }

  applyFilters(document);

  function prepareVideo(video, stream) {
    if (!video || !stream || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', '1');
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var trigger = player.querySelector('[data-play-trigger]');
    var videoId = trigger ? trigger.getAttribute('data-video') : '';
    var video = videoId ? document.getElementById(videoId) : player.querySelector('video');
    var stream = trigger ? trigger.getAttribute('data-stream') : player.getAttribute('data-stream');

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      prepareVideo(video, stream);
      player.classList.add('is-playing');
      if (video) {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }
    }

    if (trigger) {
      trigger.addEventListener('click', start);
    }

    player.addEventListener('click', function (event) {
      if (player.classList.contains('is-playing')) {
        return;
      }
      start(event);
    });
  });
})();
