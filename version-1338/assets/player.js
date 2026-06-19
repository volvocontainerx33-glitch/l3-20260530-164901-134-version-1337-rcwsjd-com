(function () {
  var video = document.getElementById('movie-video');
  var button = document.getElementById('play-button');
  var ready = false;
  var hlsInstance = null;

  if (!video || typeof videoUrl !== 'string' || !videoUrl) {
    return;
  }

  function attachVideo() {
    if (ready) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoUrl;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(videoUrl);
      hlsInstance.attachMedia(video);
      ready = true;
      return;
    }

    video.src = videoUrl;
    ready = true;
  }

  function startPlay() {
    attachVideo();
    if (button) {
      button.classList.add('is-hidden');
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', startPlay);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlay();
    }
  });

  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
