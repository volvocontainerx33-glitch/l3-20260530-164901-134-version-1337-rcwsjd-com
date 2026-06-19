(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mainNav = document.querySelector('[data-main-nav]');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mainNav.classList.contains('is-open'));
    });
  }

  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      img.classList.add('media-missing');
      img.removeAttribute('src');
    });
  });

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === activeIndex);
    });
    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    showSlide(0);
    setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  var heroSearch = document.querySelector('[data-hero-search]');
  if (heroSearch) {
    heroSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = heroSearch.querySelector('input');
      var keyword = input ? input.value.trim() : '';
      window.location.href = './movies.html' + (keyword ? '?keyword=' + encodeURIComponent(keyword) : '');
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var filters = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var currentFilter = 'all';

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyListFilters() {
    if (!cards.length) {
      return;
    }
    var keyword = normalize(searchInput ? searchInput.value : '');
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.textContent
      ].join(' '));
      var filterText = normalize([
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year')
      ].join(' '));
      var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      var filterMatch = currentFilter === 'all' || filterText.indexOf(normalize(currentFilter)) !== -1;
      var show = keywordMatch && filterMatch;
      card.style.display = show ? '' : 'none';
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('keyword');
    if (initialKeyword) {
      searchInput.value = initialKeyword;
    }
    searchInput.addEventListener('input', applyListFilters);
  }

  filters.forEach(function (filter) {
    filter.addEventListener('click', function () {
      currentFilter = filter.getAttribute('data-filter') || 'all';
      filters.forEach(function (item) {
        item.classList.toggle('is-active', item === filter);
      });
      applyListFilters();
    });
  });

  applyListFilters();
})();
