/* ============================================
   ServeFlow — Pricing Page JS
   ============================================ */

/* ---- BILLING TOGGLE ---- */
let isAnnual = false;

const toggleBtn   = document.getElementById('toggleBilling');
const toggleThumb = document.getElementById('toggleThumb');
const lblMonthly  = document.getElementById('lblMonthly');
const lblAnnual   = document.getElementById('lblAnnual');

const prices = {
  starter:    { monthly: 10,  annual: 8  },
  growth:     { monthly: 25,  annual: 20 },
  enterprise: { monthly: 50,  annual: 40 },
};

const annualNotes = {
  starter:    'Billed $96/year · Save $24',
  growth:     'Billed $240/year · Save $60',
  enterprise: 'Billed $480+/year · Save $120+',
};

function updatePrices() {
  document.querySelectorAll('.plan-amount').forEach(el => {
    const key = el.closest('.plan-card')?.id?.replace('card-', '');
    if (!key || !prices[key]) return;
    const val = isAnnual ? prices[key].annual : prices[key].monthly;
    el.textContent = val;
  });

  ['starter', 'growth', 'enterprise'].forEach(key => {
    const noteEl = document.getElementById('note-' + key);
    if (!noteEl) return;
    if (isAnnual) {
      noteEl.textContent = annualNotes[key];
      noteEl.classList.add('visible');
    } else {
      noteEl.classList.remove('visible');
    }
  });

  // Update CTA button hrefs dynamically
  ['starter', 'growth', 'enterprise'].forEach(key => {
    const billingCycle = isAnnual ? 'annual' : 'monthly';
    const cardCta = document.getElementById('cta-' + key);
    const tableCta = document.getElementById('compare-cta-' + key);
    if (cardCta) {
      cardCta.href = `checkout.html?plan=${key}&billing=${billingCycle}`;
    }
    if (tableCta) {
      tableCta.href = `checkout.html?plan=${key}&billing=${billingCycle}`;
    }
  });

  lblMonthly.classList.toggle('active', !isAnnual);
  lblAnnual.classList.toggle('active', isAnnual);
  toggleBtn.classList.toggle('toggled', isAnnual);
}

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    updatePrices();
  });
}

// Init
updatePrices();


/* ---- FAQ ACCORDION ---- */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    // open clicked if it was closed
    if (!isOpen) item.classList.add('open');
  });
});


/* ---- TOOLTIPS ---- */
const tooltip = document.getElementById('featTooltip');

document.querySelectorAll('.feat-tip').forEach(tip => {
  tip.addEventListener('mouseenter', e => {
    tooltip.textContent = tip.dataset.tip;
    tooltip.classList.add('visible');
    positionTooltip(e);
  });

  tip.addEventListener('mousemove', e => positionTooltip(e));

  tip.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });
});

function positionTooltip(e) {
  const x = e.clientX + 12;
  const y = e.clientY - 36;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}


/* ---- NAV SCROLL EFFECT ---- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.style.background = 'rgba(7,8,15,0.97)';
  } else {
    nav.style.background = 'rgba(7,8,15,0.85)';
  }
}, { passive: true });


/* ---- MOBILE MENU ---- */
const mobileToggle = document.getElementById('mobileToggle');
const mobileMenu   = document.getElementById('mobileMenu');

if (mobileToggle && mobileMenu) {
  mobileToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  // close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}


/* ---- ANIMATE ON SCROLL ---- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.plan-card, .all-plan-item, .testimonial-card, .faq-item, .compare-wrap, .guarantee-box'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});


/* ---- PLAN CTA HIGHLIGHT on HOVER ---- */
document.querySelectorAll('.plan-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    document.querySelectorAll('.plan-card').forEach(c => {
      if (c !== card) c.style.opacity = '0.75';
    });
  });
  card.addEventListener('mouseleave', () => {
    document.querySelectorAll('.plan-card').forEach(c => c.style.opacity = '1');
  });
});
