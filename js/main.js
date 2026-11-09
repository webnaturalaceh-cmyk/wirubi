/**
 * WIRUBI (Wirausaha Unggul Bersama Indonesia)
 * Main Interactive Script — Vanilla JavaScript (ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileNavigation();
  initScrollSpy();
  initCatalogFilter();
  initGalleryLightbox();
  initContactForm();
});

/**
 * 1. Sticky Header Visual State
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const updateHeaderState = () => {
    header.classList.toggle('is-stuck', window.scrollY > 12);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

/**
 * 2. Mobile Hamburger Toggle, Dropdown Menu & Smooth-Scroll Auto-Close
 */
function initMobileNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const navPanel = document.getElementById('nav-panel');
  const navLinks = document.querySelectorAll(
    '.nav-menu a.nav-link, .nav-dropdown__item'
  );
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  if (!navToggle || !navPanel) return;

  const closeAllDropdowns = () => {
    dropdowns.forEach((dd) => {
      dd.classList.remove('is-open');
      const toggle = dd.querySelector('.nav-dropdown__toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  };

  const setMenuOpen = (isOpen) => {
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute(
      'aria-label',
      isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'
    );
    navPanel.classList.toggle('is-open', isOpen);
    if (!isOpen) closeAllDropdowns();
  };

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isExpanded);
  });

  // Dropdown toggle click support (desktop & mobile)
  dropdowns.forEach((dd) => {
    const toggle = dd.querySelector('.nav-dropdown__toggle');
    if (!toggle) return;

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = !dd.classList.contains('is-open');
      closeAllDropdowns();
      dd.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  });

  // Auto-close dropdown and mobile menu when any navigation link is clicked
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeAllDropdowns();
      if (navToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
      }
    });
  });

  // Close dropdown/menu when Escape key is pressed
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAllDropdowns();
      if (navToggle.getAttribute('aria-expanded') === 'true') {
        setMenuOpen(false);
        navToggle.focus();
      }
    }
  });

  // Close dropdown/menu when clicking outside
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-dropdown')) {
      closeAllDropdowns();
    }
    if (
      navToggle.getAttribute('aria-expanded') === 'true' &&
      !navPanel.contains(event.target) &&
      !navToggle.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });
}

/**
 * 3. ScrollSpy Navigation State & Smooth Scroll Enhancement
 */
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-menu a.nav-link');
  const catalogToggle = document.querySelector('.nav-dropdown__toggle');
  const sections = document.querySelectorAll('main section[id], footer[id]');

  if (!navLinks.length || !sections.length) return;

  // Preserve active state on dedicated catalog pages
  const isDedicatedCatalogPage = catalogToggle?.dataset.activePage === 'true';

  const setActiveLink = (activeId) => {
    const isCatalogSection =
      isDedicatedCatalogPage ||
      activeId === 'produk-umkm' ||
      activeId === 'sewa-barang' ||
      activeId === 'katalog';

    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const isMatch = href === `#${activeId}`;
      link.classList.toggle(':target-current', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (catalogToggle) {
      const keepCatalogActive = isCatalogSection && activeId !== 'kontak';
      catalogToggle.classList.toggle(':target-current', keepCatalogActive);
      if (keepCatalogActive) {
        catalogToggle.setAttribute('aria-current', 'true');
      } else {
        catalogToggle.removeAttribute('aria-current');
      }
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0
    }
  );

  sections.forEach((section) => observer.observe(section));
}

/**
 * 4. Katalog Category Filter (Produk UMKM & Sewa Barang)
 */
function initCatalogFilter() {
  const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
  const productCards = document.querySelectorAll('.product-card[data-category]');
  const statusEl = document.getElementById('catalog-status');

  if (!filterButtons.length || !productCards.length) return;

  const isRentalPage = statusEl?.dataset.catalogType === 'sewa';

  const categoryLabels = {
    all: 'Semua Kategori',
    kuliner: 'Kuliner',
    kerajinan: 'Kerajinan',
    fashion: 'Fashion',
    kemasan: 'Mesin Kemasan',
    produksi: 'Alat Produksi',
    pendingin: 'Pendingin & Display'
  };

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.filter || 'all';

      // Update button aria-pressed states
      filterButtons.forEach((b) => {
        b.setAttribute('aria-pressed', String(b === btn));
      });

      // Filter product cards
      let visibleCount = 0;
      productCards.forEach((card) => {
        const category = card.dataset.category;
        const shouldShow = selected === 'all' || category === selected;
        card.hidden = !shouldShow;
        if (shouldShow) visibleCount++;
      });

      // Announce result count in polite live region
      if (statusEl) {
        const label = categoryLabels[selected] || selected;
        if (isRentalPage) {
          statusEl.textContent =
            selected === 'all'
              ? `Menampilkan seluruh ${visibleCount} peralatan & layanan sewa barang UMKM WIRUBI.`
              : `Menampilkan ${visibleCount} peralatan sewa pada kategori ${label}.`;
        } else {
          statusEl.textContent =
            selected === 'all'
              ? `Menampilkan seluruh ${visibleCount} produk unggulan UMKM binaan WIRUBI.`
              : `Menampilkan ${visibleCount} produk unggulan pada kategori ${label}.`;
        }
      }
    });
  });
}

/**
 * 5. Galeri Lightbox Preview with Native <dialog>
 */
function initGalleryLightbox() {
  const dialog = document.getElementById('gallery-lightbox');
  const dialogImg = document.getElementById('lightbox-img');
  const dialogTitle = document.getElementById('lightbox-title');
  const closeBtn = document.getElementById('lightbox-close');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!dialog || !dialogImg || !dialogTitle || !galleryItems.length) return;

  const openLightbox = (item) => {
    const img = item.querySelector('img');
    const title = item.querySelector('.gallery-item__title');
    if (!img) return;

    dialogImg.src = img.src;
    dialogImg.alt = img.alt;
    dialogTitle.textContent = title ? title.textContent : img.alt;
    dialog.showModal();
  };

  galleryItems.forEach((item) => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(item);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => dialog.close());
  }

  // Light-dismiss when clicking backdrop outside dialog content
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    const clickedInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!clickedInDialog) {
      dialog.close();
    }
  });
}

/**
 * 6. Accessible Contact Form Validation & WhatsApp Integration
 */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusBox = document.getElementById('form-status');
  if (!form) return;

  const syncAriaInvalid = (input) => {
    if (!input || typeof input.checkValidity !== 'function') return;
    const isInvalid = !input.checkValidity();
    input.setAttribute('aria-invalid', String(isInvalid));
    input.classList.toggle('user-invalid-fallback', isInvalid);
    input.classList.toggle('user-valid-fallback', !isInvalid);
  };

  // Validate after user leaves field (blur), and clear immediately on input
  form.addEventListener(
    'blur',
    (event) => {
      if (event.target.classList?.contains('form-control')) {
        syncAriaInvalid(event.target);
      }
    },
    true
  );

  form.addEventListener('input', (event) => {
    if (
      event.target.classList?.contains('form-control') &&
      event.target.hasAttribute('aria-invalid')
    ) {
      syncAriaInvalid(event.target);
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const controls = form.querySelectorAll('.form-control');
    let firstInvalid = null;

    controls.forEach((control) => {
      syncAriaInvalid(control);
      if (!control.checkValidity() && !firstInvalid) {
        firstInvalid = control;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const formData = new FormData(form);
    const name = String(formData.get('nama') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('telepon') || '').trim();
    const topic = String(formData.get('topik') || 'Konsultasi Program WIRUBI').trim();
    const message = String(formData.get('pesan') || '').trim();

    const waText = [
      `Halo Tim *WIRUBI (Wirausaha Unggul Bersama Indonesia)*,`,
      ``,
      `Saya ingin menghubungi WIRUBI melalui website:`,
      `• *Nama:* ${name}`,
      `• *Email:* ${email}`,
      phone ? `• *No. WhatsApp:* ${phone}` : null,
      `• *Topik Layanan:* ${topic}`,
      `• *Pesan:* ${message}`
    ]
      .filter(Boolean)
      .join('\n');

    const waUrl = `https://wa.me/6285314377449?text=${encodeURIComponent(waText)}`;

    if (statusBox) {
      statusBox.hidden = false;
      statusBox.textContent =
        'Terima kasih! Pesan Anda siap dikirim. Membuka WhatsApp resmi WIRUBI...';
    }

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    form.reset();
    controls.forEach((control) => {
      control.removeAttribute('aria-invalid');
      control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
    });
  });
}
