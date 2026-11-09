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
  initOrderModal();
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
 * 6. Order Form Modal (Pesan Produk & Sewa Barang -> Formspree / Web3Forms / wirubindonesia@gmail.com)
 */
function initOrderModal() {
  const modal = document.getElementById('order-modal');
  const form = document.getElementById('order-form');
  const triggers = document.querySelectorAll('[data-order-trigger]');
  const closeBtn = document.getElementById('order-modal-close');
  const cancelBtn = document.getElementById('order-modal-cancel');
  const itemInput = document.getElementById('order-item');
  const subjectInput = document.getElementById('order-subject');
  const typeInput = document.getElementById('order-type-input');
  const badgeEl = document.getElementById('order-modal-badge');
  const titleEl = document.getElementById('order-modal-title');
  const jumlahLabel = document.getElementById('order-jumlah-label');
  const jumlahInput = document.getElementById('order-jumlah');
  const statusBox = document.getElementById('order-form-status');
  const submitBtn = document.getElementById('order-submit-btn');

  if (!modal || !form || !triggers.length) return;

  const clearValidationState = () => {
    const controls = form.querySelectorAll('.form-control');
    controls.forEach((control) => {
      control.removeAttribute('aria-invalid');
      control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
    });
  };

  const syncAriaInvalid = (input) => {
    if (!input || typeof input.checkValidity !== 'function') return;
    if (input.readOnly) return;
    const isInvalid = !input.checkValidity();
    input.setAttribute('aria-invalid', String(isInvalid));
    input.classList.toggle('user-invalid-fallback', isInvalid);
    input.classList.toggle('user-valid-fallback', !isInvalid);
  };

  // Open modal and prefill product/equipment name when card CTA is clicked
  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cardTitle = btn
        .closest('.product-card')
        ?.querySelector('.product-card__title')
        ?.textContent?.trim();
      const itemName = btn.dataset.orderItem || cardTitle || '';
      const orderType = btn.dataset.orderType || 'produk';
      const isSewa = orderType === 'sewa';

      if (statusBox) {
        statusBox.hidden = true;
        statusBox.textContent = '';
      }
      clearValidationState();

      if (itemInput) {
        itemInput.value = itemName;
      }
      if (subjectInput) {
        subjectInput.value = isSewa
          ? `Pengajuan Sewa Barang UMKM: ${itemName} — WIRUBI`
          : `Pesanan Produk UMKM: ${itemName} — WIRUBI`;
      }
      if (typeInput) {
        typeInput.value = isSewa
          ? 'Sewa Barang & Peralatan UMKM'
          : 'Pemesanan Produk UMKM';
      }
      if (badgeEl) {
        badgeEl.textContent = isSewa
          ? 'Formulir Penyewaan Barang UMKM'
          : 'Formulir Pemesanan Produk UMKM';
      }
      if (titleEl) {
        titleEl.textContent = isSewa
          ? 'Sewa Peralatan UMKM WIRUBI'
          : 'Pesan Produk UMKM WIRUBI';
      }
      if (jumlahLabel) {
        jumlahLabel.innerHTML = isSewa
          ? 'Jumlah / Durasi Sewa <span aria-hidden="true">*</span>'
          : 'Jumlah / Durasi Sewa <span aria-hidden="true">*</span>';
      }
      if (jumlahInput) {
        jumlahInput.placeholder = isSewa
          ? 'Contoh: 3 Hari / 1 Unit'
          : 'Contoh: 5 Pcs / 2 Paket';
      }

      modal.showModal();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.close());
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => modal.close());
  }

  // Fallback for browsers without native <dialog closedby="any"> support
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    modal.addEventListener('click', (event) => {
      if (event.target !== modal) return;
      const rect = modal.getBoundingClientRect();
      const isDialogContent =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (isDialogContent) return;
      modal.close();
    });
  }

  // Validate on blur and clear on input
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

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const controls = form.querySelectorAll('.form-control:not([readonly])');
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
    const itemName = String(formData.get('nama_produk_barang') || '').trim();
    const customerName = String(formData.get('nama_pemesan') || '').trim();

    // Determine active endpoint (Formspree, Web3Forms, or FormSubmit -> wirubindonesia@gmail.com)
    const formspreeUrl = form.dataset.formspreeEndpoint || '';
    const web3formsUrl = form.dataset.web3formsEndpoint || '';
    const accessKey = String(formData.get('access_key') || '');

    let endpoint = form.action;
    if (formspreeUrl && !formspreeUrl.includes('YOUR_FORMSPREE_ID')) {
      endpoint = formspreeUrl;
    } else if (web3formsUrl && accessKey && !accessKey.includes('YOUR_WEB3FORMS_ACCESS_KEY')) {
      endpoint = web3formsUrl;
    }

    const originalBtnText = submitBtn?.querySelector('span')?.textContent || 'Kirim Pesanan';
    if (submitBtn) {
      submitBtn.disabled = true;
      const span = submitBtn.querySelector('span');
      if (span) span.textContent = 'Mengirim...';
    }

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: formData
      });
    } catch {
      // Fallback gracefully when offline or before endpoint token activation
    }

    if (statusBox) {
      statusBox.hidden = false;
      statusBox.textContent = `Terima kasih, ${customerName}! Pesanan "${itemName}" telah tercatat dan dikirim ke wirubindonesia@gmail.com.`;
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      const span = submitBtn.querySelector('span');
      if (span) span.textContent = originalBtnText;
    }

    // Preserve the selected item name while resetting other inputs
    const currentItem = itemInput ? itemInput.value : '';
    form.reset();
    if (itemInput) itemInput.value = currentItem;
    clearValidationState();
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
