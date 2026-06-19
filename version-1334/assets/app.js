(function () {
    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    function setupHero() {
        var slides = all('.hero-slide');
        if (slides.length <= 1) {
            return;
        }
        var dots = all('.hero-dot');
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        all('[data-hero-next]').forEach(function (button) {
            button.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        });

        all('[data-hero-prev]').forEach(function (button) {
            button.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        });

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var cards = all('[data-title]');
        var empty = document.querySelector('[data-filter-empty]');
        if (!input || cards.length === 0) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        var activeChip = '全部';
        if (query) {
            input.value = query;
        }

        function applyFilter() {
            var value = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type')
                ].join(' ').toLowerCase();
                var chipOk = activeChip === '全部' || text.indexOf(activeChip.toLowerCase()) !== -1;
                var searchOk = !value || text.indexOf(value) !== -1;
                var show = chipOk && searchOk;
                card.style.display = show ? '' : 'none';
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        input.addEventListener('input', applyFilter);
        all('[data-filter-chip]').forEach(function (button) {
            button.addEventListener('click', function () {
                activeChip = button.getAttribute('data-filter-chip') || '全部';
                all('[data-filter-chip]').forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilter();
            });
            if (button.getAttribute('data-filter-chip') === activeChip) {
                button.classList.add('active');
            }
        });
        applyFilter();
    }

    function setupPlayers() {
        all('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('video[data-video]');
            var button = shell.querySelector('[data-play-video]');
            if (!video) {
                return;
            }
            var hlsInstance;

            function attach() {
                if (video.getAttribute('data-ready') === '1') {
                    return;
                }
                var src = video.getAttribute('data-video');
                if (!src) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else {
                    video.src = src;
                }
                video.setAttribute('data-ready', '1');
            }

            function play() {
                attach();
                shell.classList.add('is-playing');
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    play();
                });
            }
            shell.addEventListener('click', function (event) {
                if (event.target === video || event.target.closest('button')) {
                    return;
                }
                play();
            });
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    shell.classList.remove('is-playing');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
