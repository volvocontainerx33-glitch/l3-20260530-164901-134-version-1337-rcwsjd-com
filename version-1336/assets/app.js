(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobile = document.querySelector("[data-mobile-nav]");
        if (toggle && mobile) {
            toggle.addEventListener("click", function () {
                mobile.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function startHero() {
            if (slides.length <= 1) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            startHero();
        }

        if (slides.length) {
            showSlide(0);
            startHero();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                restartHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                restartHero();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var nextIndex = Number(dot.getAttribute("data-hero-dot"));
                showSlide(nextIndex);
                restartHero();
            });
        });

        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        var filterInput = document.querySelector("[data-filter-input]");
        var filterSelect = document.querySelector("[data-filter-select]");
        var filterCards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));

        if (filterInput && initialQuery) {
            filterInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(filterInput ? filterInput.value : "");
            var selected = normalize(filterSelect ? filterSelect.value : "");
            filterCards.forEach(function (card) {
                var text = normalize(card.textContent + " " + Object.keys(card.dataset).map(function (key) {
                    return card.dataset[key];
                }).join(" "));
                var okQuery = !query || text.indexOf(query) !== -1;
                var okSelect = !selected || text.indexOf(selected) !== -1;
                card.classList.toggle("hidden-card", !(okQuery && okSelect));
            });
        }

        if (filterInput) {
            filterInput.addEventListener("input", applyFilter);
        }

        if (filterSelect) {
            filterSelect.addEventListener("change", applyFilter);
        }

        applyFilter();
    });
})();

function initPlayer(source) {
    var shell = document.querySelector("[data-player]");
    if (!shell) {
        return;
    }

    var video = shell.querySelector("video");
    var button = shell.querySelector("[data-play-button]");
    var hls = null;
    var attached = false;

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function attach() {
        if (attached) {
            return;
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            return;
        }

        video.src = source;
        playVideo();
    }

    function start() {
        shell.classList.add("is-playing");
        attach();
        playVideo();
    }

    if (button) {
        button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
        if (!attached) {
            start();
        }
    });

    video.addEventListener("play", function () {
        shell.classList.add("is-playing");
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
