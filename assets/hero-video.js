/* 24/38: keep decorative background video quiet, efficient and accessible. */
(() => {
  const video = document.getElementById('hero-background-video');
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const saveData = navigator.connection && navigator.connection.saveData;
  let onScreen = true;

  function syncPlayback() {
    const shouldPlay = !reduceMotion.matches && !saveData && !document.hidden && onScreen;
    if (!shouldPlay) {
      video.pause();
      return;
    }
    const playing = video.play();
    if (playing && typeof playing.catch === 'function') {
      playing.catch(() => {
        /* Autoplay is optional. Poster remains visible when blocked. */
      });
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      onScreen = entries.some(entry => entry.isIntersecting);
      syncPlayback();
    }, { threshold: 0.05 });
    observer.observe(video);
  }
  document.addEventListener('visibilitychange', syncPlayback);
  if (typeof reduceMotion.addEventListener === 'function') {
    reduceMotion.addEventListener('change', syncPlayback);
  } else if (typeof reduceMotion.addListener === 'function') {
    reduceMotion.addListener(syncPlayback);
  }
  syncPlayback();
})();
