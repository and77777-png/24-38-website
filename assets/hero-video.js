/* 24/38 — silent hero playback with resilient iPhone/WebView fallback. */
(() => {
  'use strict';
  const video = document.getElementById('hero-background-video');
  const button = document.getElementById('hero-video-play');
  if (!video) return;

  // iOS and in-app browsers require these flags for inline, muted autoplay.
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let manualStart = false;
  let pending = false;

  function showManualPlay() {
    if (!button) return;
    if (video.paused) {
      button.hidden = false;
      button.setAttribute('aria-label', 'Запустить фоновое видео');
    }
  }
  function hideManualPlay() {
    if (button) button.hidden = true;
  }
  function playVideo(fromGesture) {
    if (fromGesture) manualStart = true;
    if (document.hidden) return;
    if (reduceMotion.matches && !manualStart) {
      video.pause();
      showManualPlay();
      return;
    }
    // A second automatic attempt must not interrupt an in-flight play().
    if (pending || !video.paused) return;
    video.muted = true;
    const result = video.play();
    if (result && typeof result.then === 'function') {
      pending = true;
      result.then(() => {
        pending = false;
        hideManualPlay();
      }).catch(() => {
        pending = false;
        // Low Power Mode, autoplay restrictions or data-saving may block play.
        showManualPlay();
      });
    } else if (video.paused) {
      showManualPlay();
    }
  }

  button?.addEventListener('click', () => {
    // Keep play() inside the real tap/click gesture for iOS.
    manualStart = true;
    pending = false;
    video.muted = true;
    try {
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(showManualPlay);
      }
    } catch (_) {
      showManualPlay();
    }
  });

  video.addEventListener('playing', hideManualPlay);
  video.addEventListener('pause', showManualPlay);
  video.addEventListener('error', showManualPlay);

  // Background tab throttling is fine, but no visibility observer that might
  // incorrectly pause an onscreen video on a phone.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else playVideo(false);
  });
  window.addEventListener('pageshow', () => playVideo(false));
  video.addEventListener('canplay', () => playVideo(false), { once: true });
  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', () => playVideo(false));
  } else if (typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(() => playVideo(false));
  }
  playVideo(false);
  window.setTimeout(() => {
    if (video.paused) showManualPlay();
  }, 1600);
})();
