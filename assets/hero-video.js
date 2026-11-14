/* 24/38 hero V3 — automatic muted inline background video; no controls or prompts.
   Single decoder on phones; lazy ambient second layer only on wide desktops. */
(() => {
  'use strict';
  const video = document.getElementById('hero-background-video');
  if (!video) return;
  const ambient = document.getElementById('hero-video-ambient');
  const desktop = window.matchMedia('(min-width: 921px) and (prefers-reduced-motion: no-preference)');
  const dataSaver = Boolean(navigator.connection && navigator.connection.saveData);
  const source = video.querySelector('source')?.getAttribute('src') || 'assets/studio-worktime.mp4';

  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.playsInline = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  function autoplay() {
    if (document.hidden || !video.paused) return;
    try {
      const attempt = video.play();
      // Some iPhones reject unattended play. Leave the poster visible instead
      // of inserting an unwanted button or blocking page interaction.
      if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
    } catch (_) {}
  }

  function stopAmbient() {
    if (!ambient) return;
    ambient.pause();
    if (ambient.hasAttribute('src')) {
      ambient.removeAttribute('src');
      ambient.load();
    }
  }

  function syncAmbient() {
    if (!ambient || document.hidden || !desktop.matches || dataSaver) {
      stopAmbient();
      return;
    }
    if (video.paused || video.readyState < 2) return;
    ambient.muted = true;
    ambient.defaultMuted = true;
    ambient.playsInline = true;
    ambient.setAttribute('muted', '');
    ambient.setAttribute('playsinline', '');
    if (!ambient.getAttribute('src')) {
      ambient.src = source;
      ambient.loop = true;
      ambient.preload = 'metadata';
    }
    function align() {
      if (Math.abs(ambient.currentTime - video.currentTime) > .35) {
        try { ambient.currentTime = video.currentTime; } catch (_) {}
      }
      if (ambient.paused) {
        try {
          const attempt = ambient.play();
          if (attempt && typeof attempt.catch === 'function') attempt.catch(() => {});
        } catch (_) {}
      }
    }
    if (ambient.readyState >= 2) align();
    else ambient.addEventListener('canplay', align, { once:true });
  }

  video.addEventListener('playing', syncAmbient);
  video.addEventListener('pause', () => ambient?.pause());
  video.addEventListener('loadeddata', autoplay, { once:true });
  video.addEventListener('canplay', autoplay, { once:true });
  video.addEventListener('error', () => stopAmbient());

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      video.pause();
      ambient?.pause();
    } else {
      autoplay();
      syncAmbient();
    }
  });
  window.addEventListener('pageshow', autoplay);
  if (typeof desktop.addEventListener === 'function') {
    desktop.addEventListener('change', syncAmbient);
  } else if (typeof desktop.addListener === 'function') {
    desktop.addListener(syncAmbient);
  }
  autoplay();
})();