const ANNIVERSARY_DATE = new Date(2025, 4, 17);

const RAIN_CHARS = [
  'L','O','V','E','Y','O','U',
  'F','O','R','E','V','E','R',
  '1','4','3','<','3',
  '♡','♥','✦','★','∞','·',
  'M','A','P','U','S','K','I','N',
  'B','U','S','I','N','K','A',
  'A','L','W','A','Y','S',
  'T','O','G','E','T','H','E','R',
  'M','A','P','U','S','K','I','N',
];

const canvas = document.getElementById('rain-canvas');
const ctx    = canvas.getContext('2d');
const FS     = 13;

let cols, drops, rainInterval;

function initRain() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  cols  = Math.floor(canvas.width / FS);
  drops = Array.from({ length: cols }, () =>
    Math.random() < 0.55
      ? Math.floor(Math.random() * (canvas.height / FS))
      : -Math.floor(Math.random() * 40)
  );
}

function drawRain() {
  ctx.fillStyle = 'rgba(7, 7, 15, 0.075)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${FS}px monospace`;

  for (let i = 0; i < cols; i++) {
    const ch  = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
    const x   = i * FS;
    const y   = drops[i] * FS;
    const r   = Math.random();

    if (r < 0.05)      ctx.fillStyle = 'rgba(255, 240, 248, 0.88)';
    else if (r < 0.38) ctx.fillStyle = 'rgba(255, 107, 157, 0.72)';
    else               ctx.fillStyle = 'rgba(195, 48, 90, 0.44)';

    ctx.fillText(ch, x, y);

    if (y > canvas.height && Math.random() > 0.972) drops[i] = 0;
    drops[i] += 0.45;
  }
}

function startRain() {
  clearInterval(rainInterval);
  rainInterval = setInterval(drawRain, 50);
}

window.addEventListener('resize', initRain);

const introScreen      = document.getElementById('intro-screen');
const mainContent      = document.getElementById('main-content');
const introCountdown   = document.getElementById('intro-countdown');
const startSurpriseBtn = document.getElementById('start-surprise-btn');
const yesBtn           = document.getElementById('yes-btn');
const noBtn            = document.getElementById('no-btn');
const yesMessage       = document.getElementById('yes-message');

function startIntroCountdown() {
  let count = 3;
  introCountdown.textContent = count;

  const interval = setInterval(() => {
    count--;

    if (count > 0) {
      introCountdown.classList.remove('count-pop');
      void introCountdown.offsetWidth;
      introCountdown.textContent = count;
      introCountdown.classList.add('count-pop');
      return;
    }

    clearInterval(interval);
    introCountdown.classList.add('hidden-countdown');

    setTimeout(() => {
      startSurpriseBtn.classList.remove('hidden');
      startSurpriseBtn.classList.add('visible');
      startSurpriseBtn.focus({ preventScroll: true });
    }, 500);
  }, 1000);
}

startSurpriseBtn.addEventListener('click', () => {
  startSurpriseBtn.disabled = true;
  startSurpriseBtn.classList.add('pressed');
  setTimeout(startVideoPhase, 250);
}, { once: true });

function startVideoPhase() {
  const videoOverlay = document.getElementById('video-overlay');
  const introVideo   = document.getElementById('intro-video');
  const bgMusic      = document.getElementById('bg-music');
  const musicPrompt  = document.getElementById('music-prompt');
  const revealText   = document.getElementById('video-reveal-text');
  let   done         = false;

  introScreen.classList.add('fade-out');
  videoOverlay.classList.add('active');
  setTimeout(() => { introScreen.style.display = 'none'; }, 900);

  bgMusic.pause();
  bgMusic.currentTime = 0;
  bgMusic.volume = 0;
  bgMusic.load();

  const musicPlayPromise = bgMusic.play();

  if (musicPlayPromise !== undefined) {
    musicPlayPromise
      .then(() => {
        fadeInAudio(bgMusic, 0.78, 1800);
      })
      .catch(() => {
        musicPrompt.classList.remove('hidden');
      });
  }

  musicPrompt.addEventListener('click', () => {
    bgMusic.play().then(() => fadeInAudio(bgMusic, 0.78, 1200));
    musicPrompt.classList.add('fading');
    setTimeout(() => musicPrompt.classList.add('hidden'), 450);
  }, { once: true });

  function markVideoLoaded() {
    introVideo.classList.add('loaded');
  }

  if (introVideo.readyState >= 2) {
    markVideoLoaded();
  } else {
    introVideo.addEventListener('canplay',    markVideoLoaded, { once: true });
    introVideo.addEventListener('loadeddata', markVideoLoaded, { once: true });
  }

  introVideo.load();
  introVideo.play().catch(() => {
    afterVideo();
  });

  introVideo.addEventListener('ended', afterVideo, { once: true });
  introVideo.addEventListener('error', afterVideo, { once: true });

  const safetyTimer = setTimeout(afterVideo, 20000);

  function afterVideo() {
    if (done) return;
    done = true;
    clearTimeout(safetyTimer);

    introVideo.pause();
    introVideo.classList.add('fading');

    setTimeout(() => {
      revealText.classList.add('visible');

      setTimeout(() => {
        videoOverlay.classList.add('fade-out');
        canvas.style.opacity = '0.32';

        setTimeout(() => {
          videoOverlay.style.display = 'none';
          openMainContent();
        }, 900);
      }, 2000);
    }, 750);
  }
}

function openMainContent() {
  mainContent.classList.remove('hidden');
  void mainContent.offsetWidth;
  mainContent.classList.add('visible');

  startFloatingHearts();
  startTimer();
  setupScrollReveal();
}

function moveNoButton() {
  if (!noBtn) return;

  const safePadding = 18;
  const btnRect = noBtn.getBoundingClientRect();
  const maxX = Math.max(safePadding, window.innerWidth - btnRect.width - safePadding);
  const maxY = Math.max(safePadding, window.innerHeight - btnRect.height - safePadding);

  const x = Math.floor(Math.random() * (maxX - safePadding + 1)) + safePadding;
  const y = Math.floor(Math.random() * (maxY - safePadding + 1)) + safePadding;

  noBtn.classList.add('is-running');
  noBtn.style.position = 'fixed';
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.zIndex = '100';
}

function burstHearts(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
  const symbols = ['♡', '♥', '❤', '✦'];

  for (let i = 0; i < 34; i++) {
    const heart = document.createElement('span');
    heart.className = 'yes-burst-heart';
    heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    heart.setAttribute('aria-hidden', 'true');

    const angle    = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 190;
    const x        = Math.cos(angle) * distance;
    const y        = Math.sin(angle) * distance;

    heart.style.left = `${originX}px`;
    heart.style.top  = `${originY}px`;
    heart.style.setProperty('--burst-x', `${x}px`);
    heart.style.setProperty('--burst-y', `${y}px`);
    heart.style.fontSize = `${1 + Math.random() * 1.4}rem`;

    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1300);
  }
}

if (noBtn) {
  noBtn.addEventListener('mouseenter', moveNoButton);
  noBtn.addEventListener('pointerover', moveNoButton);
  noBtn.addEventListener('focus', moveNoButton);
  noBtn.addEventListener('click', (event) => {
    event.preventDefault();
    moveNoButton();
  });
}

if (yesBtn) {
  yesBtn.addEventListener('click', (event) => {
    const rect    = yesBtn.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top  + rect.height / 2;

    yesMessage.classList.add('visible');
    burstHearts(originX, originY);
  });
}

function fadeInAudio(audio, targetVolume, durationMs) {
  const steps    = 25;
  const stepTime = durationMs / steps;
  const stepVol  = targetVolume / steps;
  let   vol      = 0;
  const id = setInterval(() => {
    vol += stepVol;
    if (vol >= targetVolume) { audio.volume = targetVolume; clearInterval(id); }
    else                     { audio.volume = vol; }
  }, stepTime);
}

const heartsContainer = document.getElementById('floating-hearts');
const HEART_CHARS = ['♡', '♥', '❤', '✦', '✿', '·'];

function spawnHeart() {
  const el       = document.createElement('span');
  el.className   = 'float-heart';
  el.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
  el.setAttribute('aria-hidden', 'true');

  const size     = (Math.random() * 1.1 + 0.55).toFixed(2);
  const duration = (Math.random() * 9 + 9).toFixed(1);
  const left     = (Math.random() * 96 + 2).toFixed(1);
  const delay    = (Math.random() * 1.5).toFixed(1);

  el.style.cssText = `
    left: ${left}%;
    font-size: ${size}rem;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
  `;

  heartsContainer.appendChild(el);
  setTimeout(() => el.remove(),
    (parseFloat(duration) + parseFloat(delay)) * 1000 + 200);
}

function startFloatingHearts() {
  for (let i = 0; i < 10; i++) setTimeout(spawnHeart, i * 280);
  setInterval(spawnHeart, 1400);
}

function startTimer() {
  function tick() {
    const now  = new Date();
    const diff = now - ANNIVERSARY_DATE;

    if (diff < 0) {
      ['t-years','t-months','t-days','t-hours','t-minutes','t-seconds']
        .forEach(id => (document.getElementById(id).textContent = '00'));
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const secs     = totalSec % 60;
    const mins     = Math.floor(totalSec / 60) % 60;
    const hrs      = Math.floor(totalSec / 3600) % 24;

    const s = new Date(ANNIVERSARY_DATE);
    const e = new Date(now);

    let years  = e.getFullYear() - s.getFullYear();
    let months = e.getMonth()    - s.getMonth();
    if (months < 0) { years--; months += 12; }

    let days = e.getDate() - s.getDate();
    if (days < 0) {
      months--;
      if (months < 0) { years--; months += 12; }
      const prevEnd = new Date(e.getFullYear(), e.getMonth(), 0);
      days += prevEnd.getDate();
    }

    const pad = n => String(n).padStart(2, '0');

    document.getElementById('t-years').textContent   = years;
    document.getElementById('t-months').textContent  = months;
    document.getElementById('t-days').textContent    = pad(days);
    document.getElementById('t-hours').textContent   = pad(hrs);
    document.getElementById('t-minutes').textContent = pad(mins);
    document.getElementById('t-seconds').textContent = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
}

function setupScrollReveal() {
  const cards = document.querySelectorAll('.reveal-card');

  if (!('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const parent  = entry.target.parentElement;
      const pending = [...parent.querySelectorAll('.reveal-card:not(.visible)')];
      const idx     = pending.indexOf(entry.target);
      const delay   = Math.max(0, idx) * 85;

      setTimeout(() => entry.target.classList.add('visible'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  cards.forEach(c => observer.observe(c));
}

document.querySelectorAll('.photo-wrap img').forEach(img => {
  img.addEventListener('error', function () {
    this.style.display = 'none';
  });
});

initRain();
startRain();
startIntroCountdown();
