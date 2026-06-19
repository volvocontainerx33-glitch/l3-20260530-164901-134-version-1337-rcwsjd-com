(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var links = document.querySelector('[data-nav-links]');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        play();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        play();
      });
    });

    show(0);
    play();
  }

  var globalForm = document.querySelector('[data-global-search]');
  if (globalForm) {
    globalForm.addEventListener('submit', function (event) {
      var input = globalForm.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        input && input.focus();
      }
    });
  }

  var searchInput = document.getElementById('page-search');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
  var empty = document.querySelector('[data-empty-state]');

  function applyFilter(value) {
    var query = (value || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card) {
      var blob = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
      var matched = !query || blob.indexOf(query) !== -1;
      card.classList.toggle('is-hidden-card', !matched);
      if (matched) visible += 1;
    });
    if (empty) {
      empty.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get('q') || '';
    if (preset) {
      searchInput.value = preset;
    }
    searchInput.addEventListener('input', function () {
      applyFilter(searchInput.value);
    });
    applyFilter(searchInput.value);
  }
})();
