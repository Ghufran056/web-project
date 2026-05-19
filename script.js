/* =========================================================
   VELOUR MOTORS — Shared JavaScript
   All pages share this file; each feature checks for the
   presence of its target elements before binding.
   ========================================================= */

(function () {
  'use strict';

  /* ---------- 2. Navbar: shrink on scroll + hide on scroll down ---------- */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;

      // Shrink when scrolled past threshold.
      navbar.classList.toggle('scrolled', y > 40);

      // Hide on scroll down, show on scroll up (after the hero).
      if (y > 200 && y > lastY) {
        navbar.classList.add('hide');
      } else {
        navbar.classList.remove('hide');
      }
      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 3. Mobile Nav Toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    // Close mobile menu when a link is clicked.
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---------- 4. Smooth Scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- 5. Reveal on Scroll (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: just show them.
    revealEls.forEach((el) => el.classList.add('visible'));
  }

  /* ---------- 6. Animated Counters (homepage) ---------- */
  const counters = document.querySelectorAll('.counter-num');
  if (counters.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const duration = 1800;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // Ease-out cubic.
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(eased * target);
        el.textContent = value.toLocaleString() + (progress === 1 ? '+' : '');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach((c) => counterIO.observe(c));
  }

  /* ---------- 7. Car Filter (cars.html) ---------- */
  const carGrid    = document.getElementById('carGrid');
  const brandSel   = document.getElementById('brandFilter');
  const priceSel   = document.getElementById('priceFilter');
  const yearSel    = document.getElementById('yearFilter');
  const resetBtn   = document.getElementById('resetFilters');
  const countEl    = document.getElementById('resultsCount');
  const emptyState = document.getElementById('emptyState');

  if (carGrid && brandSel && priceSel && yearSel) {
    const cards = Array.from(carGrid.querySelectorAll('.car-card'));

    const applyFilters = () => {
      const brand = brandSel.value;
      const maxPrice = priceSel.value ? parseInt(priceSel.value, 10) : null;
      const year = yearSel.value;

      let visible = 0;
      cards.forEach((card) => {
        const cBrand = card.dataset.brand;
        const cPrice = parseInt(card.dataset.price, 10);
        const cYear  = card.dataset.year;

        const brandOk = !brand || cBrand === brand;
        const priceOk = !maxPrice || cPrice <= maxPrice;
        const yearOk  = !year || cYear === year;

        const show = brandOk && priceOk && yearOk;
        // Fade + collapse smoothly.
        card.style.display = show ? '' : 'none';
        if (show) {
          visible++;
          // Re-trigger reveal so they animate in.
          card.classList.remove('visible');
          requestAnimationFrame(() => card.classList.add('visible'));
        }
      });

      if (countEl) {
        countEl.textContent = visible === cards.length
          ? `Showing all ${cards.length} cars`
          : `Showing ${visible} of ${cards.length} cars`;
      }
      if (emptyState) emptyState.hidden = visible !== 0;
    };

    [brandSel, priceSel, yearSel].forEach((sel) => sel.addEventListener('change', applyFilters));

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        brandSel.value = '';
        priceSel.value = '';
        yearSel.value  = '';
        applyFilters();
      });
    }

    // Initial reveal so cards animate in on load.
    cards.forEach((c) => c.classList.add('reveal'));
  }

  /* ---------- 8. Image Gallery (car-detail.html) ---------- */
  const mainImage = document.getElementById('mainImage');
  const thumbs    = document.querySelectorAll('.thumb');
  if (mainImage && thumbs.length) {
    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const newSrc = thumb.dataset.src;
        if (!newSrc) return;
        // Brief fade for the swap.
        mainImage.style.opacity = '0';
        setTimeout(() => {
          mainImage.src = newSrc;
          mainImage.style.opacity = '1';
        }, 180);
        thumbs.forEach((t) => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  /* ---------- 9. Test-Drive Modal (car-detail.html) ---------- */
  const modal   = document.getElementById('testDriveModal');
  const bookBtn = document.getElementById('bookBtn');
  if (modal && bookBtn) {
    const openModal  = () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    bookBtn.addEventListener('click', openModal);

    // Anything with [data-close] inside the modal closes it.
    modal.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', closeModal);
    });

    // ESC to close.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    // Test-drive form validation.
    const tdForm    = document.getElementById('testDriveForm');
    const tdSuccess = document.getElementById('tdSuccess');
    if (tdForm) {
      tdForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fields = tdForm.querySelectorAll('input');
        let valid = true;
        fields.forEach((f) => {
          if (!f.value.trim()) {
            f.classList.add('error');
            valid = false;
          } else if (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)) {
            f.classList.add('error');
            valid = false;
          } else {
            f.classList.remove('error');
          }
        });
        if (valid) {
          tdSuccess.hidden = false;
          tdForm.reset();
          setTimeout(() => { tdSuccess.hidden = true; closeModal(); }, 2200);
        }
      });

      // Clear error on input.
      tdForm.querySelectorAll('input').forEach((f) => {
        f.addEventListener('input', () => f.classList.remove('error'));
      });
    }
  }

  /* ---------- 10. Contact Form Validation (contact.html) ---------- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const successEl = document.getElementById('formSuccess');

    const validators = {
      name:    (v) => v.trim().length >= 2,
      email:   (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()),
      phone:   (v) => v.trim().length >= 6,
      message: (v) => v.trim().length >= 10,
    };

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      Object.keys(validators).forEach((field) => {
        const el = contactForm.querySelector(`[name="${field}"]`);
        if (!el) return;
        if (!validators[field](el.value)) {
          el.classList.add('error');
          valid = false;
        } else {
          el.classList.remove('error');
        }
      });

      if (valid) {
        successEl.hidden = false;
        contactForm.reset();
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => { successEl.hidden = true; }, 5000);
      }
    });

    // Clear individual errors as the user types.
    contactForm.querySelectorAll('input, textarea').forEach((el) => {
      el.addEventListener('input', () => el.classList.remove('error'));
    });
  }

  /* ---------- 11. Set min date on test-drive picker ---------- */
  const dateInput = document.getElementById('td-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

})();
