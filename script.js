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

// ── Photo tilt on mouse move ──
const ph = document.getElementById('photoInner');
document.addEventListener('mousemove', e => {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
    ph.style.transform = `translate(${dx * 10}px,${dy * 8}px) rotateX(${-dy * 5}deg) rotateY(${dx * 5}deg)`;
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