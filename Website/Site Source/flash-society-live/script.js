/* =============================================
   FLASH SOCIETY EVENTS — SCRIPTS 2026
   ============================================= */

// ── Navbar scroll ──────────────────────────────
const navbar  = document.getElementById('navbar');
const onScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
};
window.addEventListener('scroll', onScroll, { passive: true });

// ── Active nav link ─────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

function updateActiveLink() {
  const y = window.scrollY + 140;
  sections.forEach(sec => {
    if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id);
      });
    }
  });
}

// ── Mobile nav toggle ───────────────────────────
const navToggle  = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
const spans      = navToggle.querySelectorAll('span');

function openNav() {
  navLinksEl.classList.add('open');
  document.body.style.overflow = 'hidden';
  spans[0].style.transform  = 'rotate(45deg) translate(4.5px, 4.5px)';
  spans[1].style.opacity    = '0';
  spans[1].style.transform  = 'scaleX(0)';
  spans[2].style.transform  = 'rotate(-45deg) translate(4.5px, -4.5px)';
}

function closeNav() {
  navLinksEl.classList.remove('open');
  document.body.style.overflow = '';
  spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}

navToggle.addEventListener('click', () =>
  navLinksEl.classList.contains('open') ? closeNav() : openNav()
);

navLinksEl.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

document.addEventListener('click', e => {
  if (navLinksEl.classList.contains('open') && !navbar.contains(e.target)) closeNav();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinksEl.classList.contains('open')) closeNav();
});

// ── Scroll reveal ───────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

// Elements to reveal — queried after DOM ready
const revealSelectors = [
  '.exp-text', '.exp-img-wrap',
  '.pkg-card',
  '.g-item',
  '.strip-text', '.strip-img-wrap',
  '.proof-panel',
  '.booking-text', '.booking-form',
  '.contact-grid > div',
  '.section-header',
  '.trust-bar',
  '.proof-rating',
  '.gallery-cta',
];

revealSelectors.forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    if (i === 1) el.classList.add('reveal-d1');
    if (i === 2) el.classList.add('reveal-d2');
    if (i === 3) el.classList.add('reveal-d3');
    revealObs.observe(el);
  });
});

// ── Gallery lightbox ────────────────────────────
document.querySelectorAll('.g-item').forEach(item => {
  item.addEventListener('click', () => {
    const img     = item.querySelector('img');
    const caption = item.querySelector('.g-overlay span')?.textContent || '';
    if (!img || !img.src) return;

    const lb = document.createElement('div');
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', caption || 'Gallery image');
    lb.style.cssText = `
      position:fixed; inset:0; z-index:9999;
      background:rgba(0,0,0,0.96);
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      padding:24px; cursor:zoom-out;
    `;

    const picture = document.createElement('img');
    picture.src = img.src;
    picture.style.cssText = `
      max-width:90vw; max-height:80vh;
      object-fit:contain; border-radius:8px;
      box-shadow:0 24px 80px rgba(0,0,0,0.9);
      pointer-events:none;
    `;

    const cap = document.createElement('p');
    cap.textContent = caption;
    cap.style.cssText = `
      font-family:'Cormorant Garamond',serif;
      font-size:1.1rem; font-style:italic;
      color:#c9a84c; margin-top:20px; letter-spacing:0.04em;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.style.cssText = `
      position:absolute; top:20px; right:28px;
      background:none; border:none; color:#a09890;
      font-size:2.8rem; cursor:pointer; line-height:1;
      transition:color .2s;
    `;
    closeBtn.onmouseenter = () => closeBtn.style.color = '#c9a84c';
    closeBtn.onmouseleave = () => closeBtn.style.color = '#a09890';

    lb.append(closeBtn, picture);
    if (caption) lb.append(cap);
    document.body.append(lb);
    document.body.style.overflow = 'hidden';

    const close = () => { lb.remove(); document.body.style.overflow = ''; };
    lb.addEventListener('click', close);
    closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });

    const esc = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);

    // animate in
    lb.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, fill: 'forwards' });
    picture.animate([{ transform: 'scale(0.92)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
      { duration: 280, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' });
  });
});

// ── Booking form ────────────────────────────────
const form = document.getElementById('bookingForm');
form?.addEventListener('submit', async e => {
  e.preventDefault();

  const btn = form.querySelector('button[type="submit"]');
  const note = form.querySelector('.form-note');
  const response = form.querySelector('.form-response');
  const orig = btn.textContent;
  const formData = new FormData(form);

  btn.textContent = 'Sending...';
  btn.disabled = true;
  btn.style.opacity = '0.7';
  response.textContent = 'Submitting your inquiry...';

  try {
    const result = await fetch(form.action, {
      method: form.method,
      body: formData,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!result.ok) throw new Error('Form submission failed');

    form.reset();
    btn.textContent = 'Inquiry Sent';
    btn.style.opacity = '1';
    note.textContent = 'Thank you. Your inquiry was sent successfully.';
    note.style.color = '#7aaa7a';
    note.style.opacity = '1';
    response.textContent = 'Success. We received your message and will follow up within 24 hours.';
  } catch (error) {
    btn.disabled = false;
    btn.textContent = orig;
    btn.style.opacity = '1';
    note.textContent = '🔒 Your info stays private. We never spam.';
    note.style.cssText = '';
    response.textContent = 'There was a problem sending your inquiry. Please try again or call us directly.';
    return;
  }

  setTimeout(() => {
    btn.textContent = orig;
    btn.disabled = false;
    btn.style.cssText = '';
    note.textContent = '🔒 Your info stays private. We never spam.';
    note.style.cssText = '';
    response.textContent = 'We typically respond within 24 hours.';
  }, 6000);
});

// ── Photo Strip Carousel ────────────────────────
const carouselSlides     = document.querySelectorAll('.carousel-slide');
const carouselIndicators = document.querySelectorAll('.indicator');
const stripPrevBtn       = document.getElementById('stripPrev');
const stripNextBtn       = document.getElementById('stripNext');
let stripSlideIndex      = 0;

function showStripSlide(index) {
  // Wrap around
  if (index >= carouselSlides.length) stripSlideIndex = 0;
  if (index < 0) stripSlideIndex = carouselSlides.length - 1;

  // Update slides
  carouselSlides.forEach((slide, i) => {
    slide.classList.toggle('active', i === stripSlideIndex);
  });

  // Update indicators
  carouselIndicators.forEach((indicator, i) => {
    indicator.classList.toggle('active', i === stripSlideIndex);
  });
}

// Initialize first slide
showStripSlide(stripSlideIndex);

// Navigation buttons
stripPrevBtn?.addEventListener('click', () => {
  stripSlideIndex--;
  showStripSlide(stripSlideIndex);
});

stripNextBtn?.addEventListener('click', () => {
  stripSlideIndex++;
  showStripSlide(stripSlideIndex);
});

// Indicator dots
carouselIndicators.forEach((indicator, i) => {
  indicator.addEventListener('click', () => {
    stripSlideIndex = i;
    showStripSlide(stripSlideIndex);
  });
});

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!document.getElementById('photo-strip')?.contains(document.activeElement)) return;
  if (e.key === 'ArrowLeft') stripPrevBtn?.click();
  if (e.key === 'ArrowRight') stripNextBtn?.click();
});

// ── Strip card hover tilt (desktop) ─────────────
const stripCard = document.querySelector('.strip-card');
if (stripCard && window.matchMedia('(min-width:1024px)').matches) {
  stripCard.closest('.strip-img-wrap')?.addEventListener('mousemove', e => {
    const rect  = stripCard.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const rotX  = ((e.clientY - cy) / rect.height) * -8;
    const rotY  = ((e.clientX - cx) / rect.width)  *  8;
    stripCard.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
  });
  stripCard.closest('.strip-img-wrap')?.addEventListener('mouseleave', () => {
    stripCard.style.transform = '';
  });
}

// ── Inject lightbox animation keyframe ──────────
document.head.insertAdjacentHTML('beforeend', '<style>@keyframes lbIn{from{opacity:0}to{opacity:1}}</style>');
