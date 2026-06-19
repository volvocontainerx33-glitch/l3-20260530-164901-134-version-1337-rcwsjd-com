(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                show(itemIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
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

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(text) {
        return (text || "").toString().toLowerCase().trim();
    }

    function setupCards() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        if (!cards.length) {
            return;
        }
        var search = document.querySelector("[data-card-search]");
        var year = document.querySelector("[data-year-filter]");
        var region = document.querySelector("[data-region-filter]");
        var category = document.querySelector("[data-category-filter]");
        var empty = document.querySelector("[data-empty-message]");

        function valueOf(select) {
            return select ? normalize(select.value) : "";
        }

        function filter() {
            var keyword = search ? normalize(search.value) : "";
            var selectedYear = valueOf(year);
            var selectedRegion = valueOf(region);
            var selectedCategory = valueOf(category);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category")
                ].join(" "));
                var ok = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (selectedYear && normalize(card.getAttribute("data-year")) !== selectedYear) {
                    ok = false;
                }
                if (selectedRegion && normalize(card.getAttribute("data-region")) !== selectedRegion) {
                    ok = false;
                }
                if (selectedCategory && normalize(card.getAttribute("data-category")) !== selectedCategory) {
                    ok = false;
                }

                card.classList.toggle("hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        [search, year, region, category].forEach(function (item) {
            if (item) {
                item.addEventListener("input", filter);
                item.addEventListener("change", filter);
            }
        });

        filter();
    }

    function bindPlayer(videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }
        var overlay = document.querySelector('[data-player-button="' + videoId + '"]');
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add("hidden");
            }
            video.controls = true;
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (!prepared || video.paused) {
                play();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupCards();
    });

    window.MovieSite = {
        initPlayer: bindPlayer
    };
})();
