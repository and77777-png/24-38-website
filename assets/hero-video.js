/* 24/38: Safari-friendly background video.
   One video element, no JS-driven pausing, no competing blurred-video decoder.
   Autoplay is native; play() only retries if initially paused. */
(() => {
  'use strict';
  const video = document.getElementById('hero-background-video');
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute('muted','');
  video.setAttribute('playsinline','');
  video.setAttribute('webkit-playsinline','');

  let pending = false;
  function start() {
    if (!video.paused || pending) return;
    try {
      const attempt = video.play();
      if (attempt && typeof attempt.then === 'function') {
        pending = true;
        attempt.then(() => { pending = false; }, () => { pending = false; });
      }
    } catch (_) {
      pending = false;
    }
  }

  // No need for a "play video" button. On iOS, a first normal touch can
  // provide a gesture if its WebView rejects initial muted autoplay.
  video.addEventListener('loadeddata', start, { once: true });
  window.addEventListener('pageshow', start);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  document.addEventListener('touchstart', start, { passive: true });
  document.addEventListener('pointerdown', start, { passive: true });
  start();
})();
