/* 24/38 — background film. Muted autoplay where permitted, explicit iOS play fallback. */
(() => {
  'use strict';
  const video = document.getElementById('hero-background-video');
  const control = document.getElementById('hero-video-control');
  if (!video || !control) return;
  const layer = video.closest('.hero-video-layer');
  const icon = control.querySelector('.hero-video-control-icon');
  const label = control.querySelector('.hero-video-control-text');
  const status = document.getElementById('hero-video-status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dataSaver = Boolean(navigator.connection && navigator.connection.saveData);
  let onScreen = true;
  let manualOverride = false;
  let manuallyPaused = false;
  let actuallyPlaying = false;

  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  control.hidden = false;

  function message(text) {
    if (status) status.textContent = text;
  }

  function setPlaying(playing) {
    actuallyPlaying = playing;
    layer?.classList.toggle('is-playing', playing);
    control.classList.toggle('is-playing', playing);
    control.setAttribute('aria-pressed', String(playing));
    control.setAttribute('aria-label', playing ? 'Поставить видео на паузу' : 'Запустить фоновое видео');
    if (icon) icon.textContent = playing ? 'Ⅱ' : '▶';
    if (label) label.textContent = playing ? 'Пауза видео' : 'Смотреть видео';
  }

  function mayAutoPlay() {
    return !document.hidden && onScreen && !manuallyPaused &&
      (!reduceMotion.matches && !dataSaver || manualOverride);
  }

  function tryPlay(userInitiated = false) {
    if (userInitiated) {
      manualOverride = true;
      manuallyPaused = false;
      message('');
    } else if (!mayAutoPlay()) {
      video.pause();
      return;
    }
    video.muted = true;
    // Keep play() in the synchronous click handler: required by several iOS webviews.
    let attempted;
    try {
      attempted = video.play();
    } catch (_err) {
      setPlaying(false);
      if (userInitiated) message('Не удалось запустить видео в этом браузере.');
      return;
    }
    if (attempted && typeof attempted.then === 'function') {
      attempted.then(() => {
        if (!video.paused && video.readyState >= 2) setPlaying(true);
      }).catch(() => {
        setPlaying(false);
        if (userInitiated) {
          message('Браузер ограничил воспроизведение. Попробуйте открыть сайт в Safari.');
        }
      });
    }
  }

  control.addEventListener('click', () => {
    if (actuallyPlaying && !video.paused) {
      manuallyPaused = true;
      video.pause();
      message('Видео остановлено.');
    } else {
      tryPlay(true);
    }
  });

  video.addEventListener('playing', () => {
    setPlaying(true);
    message('');
  });
  video.addEventListener('pause', () => setPlaying(false));
  video.addEventListener('error', () => {
    setPlaying(false);
    message('Не удалось загрузить видео. Можно открыть сайт в Safari.');
  });
  video.addEventListener('ended', () => setPlaying(false));

  function syncPlayback() {
    if (mayAutoPlay()) {
      tryPlay(false);
    } else {
      video.pause();
    }
  }

  if ('IntersectionObserver' in window && layer) {
    const observer = new IntersectionObserver(entries => {
      onScreen = entries.some(entry => entry.isIntersecting);
      syncPlayback();
    }, {threshold:0.01});
    observer.observe(layer);
  }
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pageshow', syncPlayback);
  window.addEventListener('pagehide', () => video.pause());
  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', syncPlayback);
  } else if (typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(syncPlayback);
  }

  setPlaying(!video.paused && !video.ended && video.readyState >= 2);
  tryPlay(false);
})();
