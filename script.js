(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Year
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav
  const burger = $('[data-burger]');
  const mobileNav = $('[data-mobile-nav]');
  if (burger && mobileNav) {
    const toggle = () => mobileNav.classList.toggle('is-open');
    burger.addEventListener('click', toggle);
    mobileNav.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) mobileNav.classList.remove('is-open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') mobileNav.classList.remove('is-open');
    });
  }

  // Animated counters (elements had data-counter/data-target but nothing was driving them)
  const counterEls = $$('[data-counter]');
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    if (Number.isNaN(target)) return;
    const isDecimal = String(el.dataset.target).includes('.');
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = target * eased;
      el.textContent = isDecimal ? value.toFixed(1) : Math.round(value).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString('en-US');
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counterEls.length) {
    const counterIo = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) {
            animateCounter(ent.target);
            counterIo.unobserve(ent.target);
          }
        }
      },
      { threshold: 0.4 }
    );
    counterEls.forEach((el) => counterIo.observe(el));
  } else {
    counterEls.forEach((el) => { el.textContent = el.dataset.target; });
  }

  // Reveal animations
  const revealEls = $$('[data-animate]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) {
            ent.target.classList.add('is-visible');
            io.unobserve(ent.target);
          }
        }
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // WhatsApp deep links (replace number here)
  const WHATSAPP_NUMBER = '213779411291';

  const makeWaHref = (text) => {
    const msg = text ? encodeURIComponent(text) : '';
    return `https://wa.me/${WHATSAPP_NUMBER}${msg ? `?text=${msg}` : ''}`;
  };

  const waButtons = [$('#whatsappBtn'), $('#whatsappBtn2'), $('#footerWhatsApp')].filter(Boolean);
  waButtons.forEach((btn) => {
    const preset = btn.id === 'whatsappBtn2'
      ? 'Hi Adpowers Digital — I want a free strategy call.'
      : 'Hi Adpowers Digital — I need help scaling my business.';
    btn.href = makeWaHref(preset);
  });

  // Lead form (front-end only; posts to Formspree/Netlify if configured)
  const form = $('#leadForm');
  const status = form ? $('.form__status', form) : null;

  const setStatus = (msg, ok = true) => {
    if (!status) return;
    status.textContent = msg;
    status.style.color = ok ? 'rgba(34,197,94,.95)' : 'rgba(251,113,133,.95)';
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());

      // If Netlify Forms is used, it just needs `name` attr and proper endpoint.
      // Otherwise, we still provide a good UX and a fallback to WhatsApp.
      try {
        setStatus('Sending…', true);

        // If user has set up a real endpoint, they can set data-endpoint on the form.
        const endpoint = form.dataset.endpoint;
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Request failed');
        }

        // Thank you UX
        setStatus('Request received. We'll contact you shortly.', true);
        form.reset();

        // Optional: open WhatsApp with prefilled message after submit.
        // Comment out if you want form-only behavior.
        const waText = `Hi Adpowers Digital —\n\nName: ${data.name}\nWhatsApp: ${data.whatsapp}\nGoal: ${data.goal}\nBudget: ${data.budget || '—'}\n\nMessage: ${data.message}`;
        const waUrl = makeWaHref(waText);
        window.open(waUrl, '_blank', 'noopener');
      } catch (err) {
        console.error(err);
        setStatus('Could not send automatically. Opening WhatsApp instead…', false);
        const waText = `Hi Adpowers Digital —\n\nName: ${data.name}\nWhatsApp: ${data.whatsapp}\nGoal: ${data.goal}\n\nMessage: ${data.message}`;
        window.open(makeWaHref(waText), '_blank', 'noopener');
      }
    });
  }

  // Smooth anchor offset (sticky header)
  const header = $('[data-header]');
  const headerHeight = () => (header ? header.getBoundingClientRect().height : 0);

  $$('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    a.addEventListener('click', (e) => {
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - headerHeight() - 14;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();