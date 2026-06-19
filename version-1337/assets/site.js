document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-main-nav]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.style.opacity = '0';
    });
  });

  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-slide-dot]'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    showSlide(0);
    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var q = input ? input.value.trim() : '';
      location.href = 'search.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  });

  var filterInput = document.querySelector('[data-card-filter]');
  var filterSelect = document.querySelector('[data-year-filter]');
  var noResults = document.querySelector('[data-no-results]');

  function filterCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!cards.length) return;
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = filterSelect ? filterSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
      var yearOk = !year || card.getAttribute('data-year') === year;
      var keyOk = !keyword || text.indexOf(keyword) !== -1;
      var show = yearOk && keyOk;
      card.classList.toggle('hidden-card', !show);
      if (show) visible += 1;
    });

    if (noResults) {
      noResults.classList.toggle('is-visible', visible === 0);
    }
  }

  if (filterInput) {
    var params = new URLSearchParams(location.search);
    var q = params.get('q');
    if (q) filterInput.value = q;
    filterInput.addEventListener('input', filterCards);
    filterCards();
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', filterCards);
  }

  document.querySelectorAll('[data-player]').forEach(function (wrap) {
    var video = wrap.querySelector('video');
    var button = wrap.querySelector('[data-play-button]');
    var stream = wrap.getAttribute('data-stream');
    var ready = false;

    function attach() {
      if (!video || !stream || ready) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        ready = true;
      } else {
        video.src = stream;
        ready = true;
      }
    }

    function play() {
      attach();
      if (button) button.classList.add('is-hidden');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) play();
      });
    }
  });
});
