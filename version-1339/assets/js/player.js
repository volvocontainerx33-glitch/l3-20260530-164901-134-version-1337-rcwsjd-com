(function () {
  var wrap = document.querySelector('[data-player]');
  if (!wrap) {
    return;
  }

  var video = wrap.querySelector('video');
  var overlay = wrap.querySelector('[data-player-overlay]');
  var buttons = wrap.querySelectorAll('[data-play]');
  var hlsInstance = null;

  function attachSource() {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }

    var stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }

    video.setAttribute('data-ready', '1');
  }

  function startPlayback() {
    attachSource();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    if (video) {
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      startPlayback();
    });
  });

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
})();
