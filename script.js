// ── Loader ──
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.classList.add('hide');
        setTimeout(() => { loader.style.display = 'none'; }, 600);
    }, 2400);
});

// ── Nav scroll ──
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
    navEl.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Typing effect ──
const phrases = ['Frontend Developer.', 'UI/UX Enthusiast.', 'Full-Stack Builder.', 'Creative Coder.'];
let pi = 0, ci = 0, del = false;
const tel = document.getElementById('typed-text');

function type() {
    const p = phrases[pi];
    if (!del) {
        tel.textContent = p.slice(0, ++ci);
        if (ci === p.length) {
            setTimeout(() => { del = true; }, 1700);
            setTimeout(type, 100);
            return;
        }
    } else {
        tel.textContent = p.slice(0, --ci);
        if (ci === 0) {
            del = false;
            pi = (pi + 1) % phrases.length;
        }
    }
    setTimeout(type, del ? 50 : 105);
}
type();

// ── Hamburger menu ──
const hbg = document.getElementById('hbg');
hbg.addEventListener('click', () => {
    navEl.classList.toggle('mobile-open');
    hbg.textContent = navEl.classList.contains('mobile-open') ? '✕' : '☰';
});

// Close menu when a nav link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navEl.classList.remove('mobile-open');
        hbg.textContent = '☰';
    });
});


// ── Hero Photo — 3D Tilt + Auto Idle ──
const ph = document.getElementById('photoInner');
const photoWrap = document.querySelector('.hero-photo-wrap');

let mouseHasMoved = false;
let idleAngle = 0;
let idleRaf = null;

function idleLoop() {
    idleAngle += 0.012;
    const rx = Math.sin(idleAngle * 0.7) * 6;
    const ry = Math.cos(idleAngle) * 8;
    ph.style.transition = 'none';
    ph.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    idleRaf = requestAnimationFrame(idleLoop);
}

idleRaf = requestAnimationFrame(idleLoop);

photoWrap.addEventListener('mousemove', e => {
    if (!mouseHasMoved) {
        mouseHasMoved = true;
        cancelAnimationFrame(idleRaf);
    }

    const bounds = photoWrap.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    const cx = bounds.width / 2;
    const cy = bounds.height / 2;
    const nx = (x - cx) / cx;
    const ny = (y - cy) / cy;
    const MAX = 22;

    ph.style.transition = 'none';
    ph.style.transform = `rotateX(${-ny * MAX}deg) rotateY(${nx * MAX}deg) scale3d(1.04, 1.04, 1.04)`;
});

photoWrap.addEventListener('mouseleave', () => {
    mouseHasMoved = false;
    ph.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
    ph.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';

    setTimeout(() => {
        ph.style.transition = 'none';
        idleRaf = requestAnimationFrame(idleLoop);
    }, 850);
});


// ── Scroll reveal ──
const obs = new IntersectionObserver(es => {
    es.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('on');
            obs.unobserve(e.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ── Skill bars ──
const bobs = new IntersectionObserver(es => {
    es.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.bar-fill').forEach(b => {
                b.style.width = b.dataset.w + '%';
            });
            bobs.unobserve(e.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.about-right').forEach(el => bobs.observe(el));

// Scroll Indicator JS
(function () {
    const indicator = document.getElementById('scroll-indicator');
    let idleTimer = null;
    let hideTimer = null;
    const IDLE_DELAY = 3500;   // ms before it appears
    const SHOW_DURATION = 10000; // ms it stays visible

    function showIndicator() {
      clearTimeout(hideTimer);
      indicator.classList.add('visible');
      hideTimer = setTimeout(() => {
        indicator.classList.remove('visible');
      }, SHOW_DURATION);
    }

    function scheduleShow() {
      clearTimeout(idleTimer);
      clearTimeout(hideTimer);
      indicator.classList.remove('visible');
      idleTimer = setTimeout(showIndicator, IDLE_DELAY);
    }

    // Only show when near the top (not when user already scrolled far)
function handleScroll() {
  const contact = document.querySelector('contact');
  const contactTop = contact ? contact.getBoundingClientRect().top : Infinity;

  // Hide permanently once footer is visible on screen
  if (contactTop <= window.innerHeight) {
    clearTimeout(idleTimer);
    clearTimeout(hideTimer);
    indicator.classList.remove('visible');
    return;
  }

  if (window.scrollY < window.innerHeight * 0.6) {
    scheduleShow();
  } else {
    clearTimeout(idleTimer);
    clearTimeout(hideTimer);
    indicator.classList.remove('visible');
  }
}

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', scheduleShow, { passive: true });
    window.addEventListener('keydown', scheduleShow, { passive: true });
    window.addEventListener('touchstart', scheduleShow, { passive: true });

    // Kick off on page load
    scheduleShow();
  })();

 // ── Floating Music Player ──
const musicPlayer = document.getElementById('musicPlayer');
const bgMusic = document.getElementById('bgMusic');
const toggleBtn = document.getElementById('toggleMusic');
const closeBtn = document.getElementById('closeMusic');
const musicTitle = document.getElementById('musicTitle');

const musicList = [{ title: 'Chill', src: 'musicplayer/lofi-music.mp3' }];
const musicName = ['✦ Lo-Fi Beats'];

let currentSong = 0;
let isPlaying = false;
let userInteracted = false;

function loadMusic(index) {
    bgMusic.src = musicList[index].src;
    musicTitle.textContent = musicName[index];
}

function playMusic() {
    const promise = bgMusic.play();
    toggleBtn.textContent = '⏸';
    isPlaying = true;
    document.getElementById('musicBars').classList.remove('paused'); // add this
    return promise;
}

function pauseMusic() {
    bgMusic.pause();
    toggleBtn.textContent = '▶';
    isPlaying = false;
    document.getElementById('musicBars').classList.add('paused'); // add this
}

// Load and start muted immediately
loadMusic(currentSong);
bgMusic.muted = true;
bgMusic.play().catch(() => {});
toggleBtn.textContent = '▶'; // still show ▶ since muted doesn't count

// On first click ANYWHERE on the page, unmute and play properly
function handleFirstInteraction() {
    if (userInteracted) return;
    userInteracted = true;
    bgMusic.muted = false;
    bgMusic.currentTime = 0;
    playMusic();
    document.removeEventListener('click', handleFirstInteraction);
}

document.addEventListener('click', handleFirstInteraction);

// Manual toggle
toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent double-firing with above
    if (!userInteracted) {
        userInteracted = true;
        bgMusic.muted = false;
        bgMusic.currentTime = 0;
        document.removeEventListener('click', handleFirstInteraction);
    }
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
});

bgMusic.addEventListener('ended', () => {
    currentSong = (currentSong + 1) % musicList.length;
    loadMusic(currentSong);
    playMusic();
});

closeBtn.addEventListener('click', () => {
    bgMusic.pause();
    musicPlayer.style.display = 'none';
});

const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');

// Volume change
volumeSlider.addEventListener('input', () => {
    bgMusic.volume = volumeSlider.value;
    if (volumeSlider.value == 0) {
        volumeIcon.textContent = '🔇';
    } else if (volumeSlider.value < 0.5) {
        volumeIcon.textContent = '🔉';
    } else {
        volumeIcon.textContent = '🔊';
    }
});

// Click icon to mute/unmute
volumeIcon.addEventListener('click', () => {
    if (bgMusic.volume > 0) {
        bgMusic.volume = 0;
        volumeSlider.value = 0;
        volumeIcon.textContent = '🔇';
    } else {
        bgMusic.volume = 1;
        volumeSlider.value = 1;
        volumeIcon.textContent = '🔊';
    }
});

//Canvas 

const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

// size to hero section, not window
const hero = document.getElementById("hero");
canvas.width = hero.offsetWidth;
canvas.height = hero.offsetHeight;

const gridSize = 24;
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

let snake = [{ x: 10, y: 10 }];
let dir = { x: 1, y: 0 };

function glowColor(i) {
    const colors = ["#4f8cff", "#7c4dff", "#6ee7ff"];
    return colors[i % colors.length];
}

function step() {
    const head = snake[snake.length - 1];
    let next = {
        x: (head.x + dir.x + cols) % cols,
        y: (head.y + dir.y + rows) % rows
    };
    snake.push(next);
    if (snake.length > 18) snake.shift();
}

function drawGrid() {
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
    }
}

function drawSnake() {
    snake.forEach((p, i) => {
        const x = p.x * gridSize;
        const y = p.y * gridSize;
        ctx.fillStyle = glowColor(i);
        ctx.shadowBlur = 12;          // reduced from 20
        ctx.shadowColor = glowColor(i);
        ctx.globalAlpha = 0.5;        // extra dimming per segment
        ctx.fillRect(x, y, gridSize, gridSize);
    });
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    step();
    drawSnake();
    requestAnimationFrame(animate);
}

setInterval(() => {
    const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];
    dir = dirs[Math.floor(Math.random() * dirs.length)];
}, 500);

animate();