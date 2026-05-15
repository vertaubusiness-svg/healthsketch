/* ============================================================
   Health Sketch — main.js
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Header scroll ---------- */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Hamburger / Mobile nav ---------- */
  const hamburger = document.getElementById('hamburger');
  const nav       = document.getElementById('site-nav');
  const overlay   = document.getElementById('nav-overlay');

  function openNav() {
    hamburger.classList.add('is-open');
    nav.classList.add('is-open');
    overlay.classList.add('is-visible');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', '메뉴 닫기');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    hamburger.classList.remove('is-open');
    nav.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', '메뉴 열기');
    document.body.style.overflow = '';
  }

  if (hamburger && nav && overlay) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.contains('is-open') ? closeNav() : openNav();
    });
    overlay.addEventListener('click', closeNav);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeNav);
    });
  }

  /* ---------- Active nav link ---------- */
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  /* ---------- Fade-in on scroll (IntersectionObserver) ---------- */
  const fadeEls = document.querySelectorAll(
    '.category-card, .why-card, .service-item, .section-header,' +
    '.product-card, .package-card, .delivery-card, .transit-card, .info-card'
  );

  if ('IntersectionObserver' in window && fadeEls.length) {
    fadeEls.forEach(el => el.classList.add('fade-in'));

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10 });

    fadeEls.forEach(el => io.observe(el));
  }

  /* ---------- Service nav active on scroll ---------- */
  const serviceNavLinks = document.querySelectorAll('.service-nav-link');
  if (serviceNavLinks.length) {
    const sections = Array.from(serviceNavLinks).map(link => {
      const id = link.getAttribute('href').replace('#', '');
      return document.getElementById(id);
    }).filter(Boolean);

    const onServiceScroll = () => {
      const scrollY = window.scrollY + 160;
      let current = sections[0];
      sections.forEach(sec => {
        if (sec && sec.offsetTop <= scrollY) current = sec;
      });
      serviceNavLinks.forEach(link => {
        link.classList.toggle('active',
          link.getAttribute('href') === '#' + (current ? current.id : ''));
      });
    };
    window.addEventListener('scroll', onServiceScroll, { passive: true });
    onServiceScroll();
  }

  /* ---------- Product filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  const productCount = document.getElementById('product-count');
  const noResult = document.getElementById('no-result');

  if (filterBtns.length && productCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;

        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        let visible = 0;
        productCards.forEach(card => {
          const match = filter === 'all' || card.dataset.category === filter;
          if (match) {
            card.classList.remove('is-hidden');
            visible++;
            requestAnimationFrame(() => card.classList.remove('is-fading'));
          } else {
            card.classList.add('is-fading');
            card.addEventListener('transitionend', () => {
              if (card.classList.contains('is-fading')) {
                card.classList.add('is-hidden');
              }
            }, { once: true });
          }
        });

        if (productCount) {
          const label = filter === 'all' ? '전체' : btn.textContent.trim();
          productCount.innerHTML = `${label} <strong>${visible}</strong>개 제품`;
        }
        if (noResult) noResult.hidden = visible > 0;
      });
    });
  }

  /* ---------- Contact form ---------- */
  const GAS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzsWH8B7a5lC4tMNY-uGXoTMn7R0a7VD9V1EAHVjnyI41IVAJx48VxrFhcY4KoPQCisRQ/exec';

  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formResetBtn = document.getElementById('form-reset-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const fields = [
        { id: 'name',         errId: 'name-error',    msg: '이름을 입력해 주세요.' },
        { id: 'phone',        errId: 'phone-error',   msg: '연락처를 입력해 주세요.' },
        { id: 'inquiry-type', errId: 'type-error',    msg: '문의 유형을 선택해 주세요.' },
        { id: 'message',      errId: 'message-error', msg: '문의 내용을 입력해 주세요.' },
      ];

      fields.forEach(({ id, errId, msg }) => {
        const el = document.getElementById(id);
        const err = document.getElementById(errId);
        if (!el || !err) return;
        const empty = !el.value.trim();
        el.classList.toggle('is-error', empty);
        err.textContent = empty ? msg : '';
        err.classList.toggle('is-visible', empty);
        if (empty) valid = false;
      });

      const privacy = document.getElementById('privacy');
      const privacyErr = document.getElementById('privacy-error');
      if (privacy && !privacy.checked) {
        privacyErr.textContent = '개인정보 수집·이용에 동의해 주세요.';
        privacyErr.classList.add('is-visible');
        valid = false;
      } else if (privacyErr) {
        privacyErr.classList.remove('is-visible');
      }

      if (!valid) return;

      const submitBtn = document.getElementById('form-submit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '전송 중…'; }

      const payload = {
        name:    document.getElementById('name').value.trim(),
        phone:   document.getElementById('phone').value.trim(),
        email:   (document.getElementById('email') || {}).value?.trim() || '',
        type:    document.getElementById('inquiry-type').value,
        message: document.getElementById('message').value.trim(),
      };

      fetch(GAS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(() => {
          contactForm.style.display = 'none';
          if (formSuccess) {
            formSuccess.removeAttribute('hidden');
            formSuccess.style.display = 'flex';
          }
        })
        .catch(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '문의 전송하기';
          }
          if (formSuccess) {
            formSuccess.setAttribute('hidden', '');
            formSuccess.style.display = 'none';
          }
          alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요.');
        });
    });
  }

  if (formResetBtn && contactForm && formSuccess) {
    formResetBtn.addEventListener('click', () => {
      contactForm.reset();
      contactForm.style.display = '';
      formSuccess.setAttribute('hidden', '');
      formSuccess.style.display = 'none';
      const submitBtn = document.getElementById('form-submit');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">
            <path d="M3.105 2.289a.75.75 0 0 0-.826.95l1.414 4.925A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.896 28.896 0 0 0 15.293-7.154.75.75 0 0 0 0-1.115A28.897 28.897 0 0 0 3.105 2.289z"/>
          </svg>
          문의 전송하기`;
      }
      document.querySelectorAll('.form-error').forEach(e => e.classList.remove('is-visible'));
      document.querySelectorAll('.is-error').forEach(e => e.classList.remove('is-error'));
    });
  }

  /* ---------- Contact form: URL 파라미터로 문의 유형 자동 선택 ---------- */
  const typeSelect = document.getElementById('inquiry-type');
  if (typeSelect) {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    if (typeParam) {
      const option = typeSelect.querySelector(`option[value="${typeParam}"]`);
      if (option) typeSelect.value = typeParam;
    }
  }

})();
