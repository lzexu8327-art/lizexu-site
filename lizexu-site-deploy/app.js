// LI ZEXU Personal Site — minimal interactions

(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== 1. Scroll reveal =====
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${idx * 60}ms`;
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-in'));
  }

  // ===== 2. Nav scroll border =====
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ===== 3. Folder stack parallax (mouse) =====
  const folderStack = document.querySelector('.folder-stack');
  if (folderStack && !reduced) {
    let raf = null;
    const folders = folderStack.querySelectorAll('.folder');
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 30;
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        folders.forEach(f => {
          f.style.setProperty('--f-px', `${x}px`);
          f.style.setProperty('--f-py', `${y}px`);
        });
        raf = null;
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', () => {
      folders.forEach(f => {
        f.style.setProperty('--f-px', '0px');
        f.style.setProperty('--f-py', '0px');
      });
    });
  }

  // ===== 4. Nav section highlight =====
  const sections = document.querySelectorAll('#about, #projects, #experience, #contact');
  const navLinks = document.querySelectorAll('.nav__links a');
  const linkMap = new Map();
  navLinks.forEach(a => linkMap.set(a.dataset.nav, a));

  if ('IntersectionObserver' in window && sections.length) {
    const activate = (id) => {
      navLinks.forEach(a => a.classList.remove('is-active'));
      const link = linkMap.get(id);
      if (link) link.classList.add('is-active');
    };
    const navIo = new IntersectionObserver((entries) => {
      // pick the entry whose section top is closest to our observation line
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible.length) {
        activate(visible[0].target.id);
      }
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });
    sections.forEach(s => navIo.observe(s));
  }

  // ===== 5. Smooth scroll on anchor clicks (native behavior, plus focus) =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (target) {
        // let browser handle smooth scroll via CSS; just update focus
        setTimeout(() => target.setAttribute('tabindex', '-1'), 600);
      }
    });
  });

  // ===== 6. Project detail modal =====
  const modal = document.getElementById('project-modal');
  const modalContent = document.getElementById('modal-content');
  let lastFocused = null;

  const openModal = (key, trigger) => {
    if (!modal || !modalContent) return;
    const tpl = document.querySelector(`template[data-modal="${key}"]`);
    if (!tpl) return;
    lastFocused = trigger || document.activeElement;
    modalContent.replaceChildren(tpl.content.cloneNode(true));
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    // focus the close button for keyboard users
    requestAnimationFrame(() => {
      const closeBtn = modal.querySelector('.modal__close');
      closeBtn && closeBtn.focus();
    });
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalContent && modalContent.replaceChildren();
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
      lastFocused = null;
    }
  };

  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.getAttribute('data-modal-open'), btn);
    });
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-modal-close')) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
