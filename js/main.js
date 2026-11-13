/**
 * Oasis Pain and Palliative Care Unit - GEC Idukki
 * Accessible, Responsive Frontend Functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. Initialize Lucide Icons
  // --------------------------------------------------------------------------
  if (window.lucide) {
    lucide.createIcons();
  }

  // --------------------------------------------------------------------------
  // 2. Focus Trap Helper for Accessible Modals & Drawers
  // --------------------------------------------------------------------------
  function createFocusTrap(element, onEscape) {
    const focusableSelectors = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    
    function handleKeyDown(e) {
      if (e.key === 'Escape' && typeof onEscape === 'function') {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key === 'Tab') {
        const focusables = Array.from(element.querySelectorAll(focusableSelectors))
          .filter(el => el.offsetParent !== null);
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    element.addEventListener('keydown', handleKeyDown);
    return () => element.removeEventListener('keydown', handleKeyDown);
  }

  // --------------------------------------------------------------------------
  // 3. Mobile Navigation Drawer
  // --------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileDrawerBackdrop = document.getElementById('mobile-drawer-backdrop');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  let releaseDrawerTrap = null;
  let lastActiveElementBeforeDrawer = null;

  function openMobileMenu() {
    if (!mobileDrawer) return;
    lastActiveElementBeforeDrawer = document.activeElement;
    mobileDrawer.classList.remove('translate-x-full');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (mobileMenuBtn) {
      mobileMenuBtn.setAttribute('aria-expanded', 'true');
    }
    releaseDrawerTrap = createFocusTrap(mobileDrawer, closeMobileMenu);
    
    // Focus first link in drawer
    const firstLink = mobileDrawer.querySelector('a, button');
    if (firstLink) firstLink.focus();
  }

  function closeMobileMenu() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('translate-x-full');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (mobileMenuBtn) {
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
    }
    if (releaseDrawerTrap) {
      releaseDrawerTrap();
      releaseDrawerTrap = null;
    }
    if (lastActiveElementBeforeDrawer) {
      lastActiveElementBeforeDrawer.focus();
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobileMenu);
  if (mobileDrawerBackdrop) mobileDrawerBackdrop.addEventListener('click', closeMobileMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // --------------------------------------------------------------------------
  // 4. Header Background On Scroll & Scrollspy
  // --------------------------------------------------------------------------
  const header = document.getElementById('navbar');
  const sections = document.querySelectorAll('section[id], footer[id="contact"]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-link');
  const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

  function updateHeaderAndScrollspy() {
    const scrollY = window.scrollY;

    // Header styling on scroll
    if (header) {
      if (scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Scroll to Top visibility
    if (scrollToTopBtn) {
      if (scrollY > 350) {
        scrollToTopBtn.classList.remove('opacity-0', 'translate-y-8', 'pointer-events-none');
        scrollToTopBtn.classList.add('opacity-100', 'translate-y-0', 'pointer-events-auto');
      } else {
        scrollToTopBtn.classList.remove('opacity-100', 'translate-y-0', 'pointer-events-auto');
        scrollToTopBtn.classList.add('opacity-0', 'translate-y-8', 'pointer-events-none');
      }
    }

    // Scrollspy active section highlighting
    let currentSectionId = '';
    const scrollThreshold = scrollY + 140;

    sections.forEach(sec => {
      const secTop = sec.offsetTop;
      const secHeight = sec.offsetHeight;
      if (scrollThreshold >= secTop && scrollThreshold < secTop + secHeight) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('nav-active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('nav-active');
          link.removeAttribute('aria-current');
        }
      });
    }
  }

  window.addEventListener('scroll', updateHeaderAndScrollspy, { passive: true });
  updateHeaderAndScrollspy();

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --------------------------------------------------------------------------
  // 5. Impact Metrics Counter Animation (Respecting prefers-reduced-motion)
  // --------------------------------------------------------------------------
  const counterElements = document.querySelectorAll('.counter-value');
  const impactSection = document.getElementById('impact');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let countersAnimated = false;

  function animateCounters() {
    if (prefersReducedMotion) {
      // In reduced motion mode, show targets immediately with '+'
      counterElements.forEach(counter => {
        const target = counter.getAttribute('data-target');
        counter.textContent = `${target}+`;
      });
      return;
    }

    counterElements.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
      const duration = 1600;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out quad
        const easeProgress = 1 - (1 - progress) * (1 - progress);
        const currentVal = Math.round(easeProgress * target);

        counter.textContent = `${currentVal}+`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = `${target}+`;
        }
      }

      requestAnimationFrame(update);
    });
  }

  if (impactSection) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !countersAnimated) {
            countersAnimated = true;
            animateCounters();
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });
      observer.observe(impactSection);
    } else {
      animateCounters();
    }
  }

  // --------------------------------------------------------------------------
  // 6. Initiatives Modal (Accessible Keyboard Navigation & Scroll Lock)
  // --------------------------------------------------------------------------
  const initiativeData = {
    harsham: {
      title: "Harsham Palliative Fest",
      subtitle: "Flagship Annual Student Palliative Festival at GEC Idukki",
      image: "images/harsham-fest.webp",
      tag: "Flagship Fest",
      dateLine: "", // Empty: date line is hidden when not specified
      description: "Harsham is the landmark annual palliative awareness festival organized by Oasis at Government Engineering College Idukki. It brings together engineering students, faculty, medical professionals, and local palliative care workers to spread awareness and empathy across the community.",
      highlights: [
        "Interactive seminars and compassionate care sessions led by palliative care clinicians.",
        "Cultural street plays and art presentations highlighting dignity in palliative care.",
        "Equipment pooling drives collecting wheelchair, waterbed, and care funds.",
        "Student volunteer mobilization across all engineering departments."
      ]
    },
    outreach: {
      title: "Old Age Home Outreach",
      subtitle: "Companion Care & Elder Fellowship Across Painavu",
      image: "images/outreach-care.webp",
      tag: "Community Visits",
      dateLine: "",
      description: "Regular student visits to elderly homes and palliative patients in Idukki. Student volunteers provide companion care, warm conversations, life-story listening, and patient comfort kits.",
      highlights: [
        "Fortnightly companion visits providing emotional support and friendship.",
        "Distribution of daily hygiene supplies, adult diapers, and comfort kits.",
        "Assisting local government palliative nurses during routine health checks.",
        "Fostering generational connection between young engineers and elders."
      ]
    },
    festive: {
      title: "Festive Care Drives",
      subtitle: "Bringing Festival Cheer to Homebound Bedridden Patients",
      image: "images/festive-care.webp",
      tag: "Festive Joy",
      dateLine: "",
      description: "Ensuring no patient feels isolated during festive seasons. Student teams prepare and hand-deliver customized Onam feast kits and Christmas gifts directly to homebound patients in remote hill tracts.",
      highlights: [
        "Hand-delivery of Onam Sadya kits, groceries, and traditional wear to bedridden families.",
        "Christmas cake distribution and fellowship visits across remote hill communities.",
        "Musical visits and shared moments with family caregivers.",
        "Restoring smiles and festive celebration to isolated households."
      ]
    }
  };

  const initModal = document.getElementById('initiative-modal');
  const initModalImg = document.getElementById('init-modal-img');
  const initModalTag = document.getElementById('init-modal-tag');
  const initModalDate = document.getElementById('init-modal-date');
  const initModalTitle = document.getElementById('init-modal-title');
  const initModalSubtitle = document.getElementById('init-modal-subtitle');
  const initModalDesc = document.getElementById('init-modal-description');
  const initModalHighlights = document.getElementById('init-modal-highlights');
  const initModalCloseBtn = document.getElementById('init-modal-close-btn');
  const initModalCloseFooter = document.getElementById('init-modal-close-footer');
  let releaseInitTrap = null;
  let lastInitiativeTrigger = null;

  function openInitiativeModal(key, triggerBtn) {
    const data = initiativeData[key];
    if (!data || !initModal) return;

    lastInitiativeTrigger = triggerBtn;

    if (initModalImg) {
      initModalImg.src = data.image;
      initModalImg.alt = data.title;
    }
    if (initModalTag) initModalTag.textContent = data.tag;
    
    // Optional date line: hide if empty
    if (initModalDate) {
      if (data.dateLine && data.dateLine.trim() !== "") {
        initModalDate.textContent = data.dateLine;
        initModalDate.classList.remove('hidden');
      } else {
        initModalDate.classList.add('hidden');
      }
    }

    if (initModalTitle) initModalTitle.textContent = data.title;
    if (initModalSubtitle) initModalSubtitle.textContent = data.subtitle;
    if (initModalDesc) initModalDesc.textContent = data.description;

    if (initModalHighlights) {
      initModalHighlights.innerHTML = data.highlights
        .map(h => `<li class="flex items-start gap-2.5 text-sm font-medium text-[#132D46]">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-[#30AFFF] mt-0.5 shrink-0" aria-hidden="true"></i>
          <span>${h}</span>
        </li>`)
        .join('');
    }

    if (window.lucide) lucide.createIcons();

    initModal.classList.add('active');
    initModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    releaseInitTrap = createFocusTrap(initModal, closeInitiativeModal);
    if (initModalCloseBtn) initModalCloseBtn.focus();
  }

  function closeInitiativeModal() {
    if (!initModal) return;
    initModal.classList.remove('active');
    initModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (releaseInitTrap) {
      releaseInitTrap();
      releaseInitTrap = null;
    }
    if (lastInitiativeTrigger) {
      lastInitiativeTrigger.focus();
    }
  }

  document.querySelectorAll('.open-initiative-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.currentTarget.getAttribute('data-initiative');
      openInitiativeModal(key, e.currentTarget);
    });
  });

  if (initModalCloseBtn) initModalCloseBtn.addEventListener('click', closeInitiativeModal);
  if (initModalCloseFooter) initModalCloseFooter.addEventListener('click', closeInitiativeModal);
  if (initModal) {
    initModal.addEventListener('click', (e) => {
      if (e.target === initModal) closeInitiativeModal();
    });
  }

  // --------------------------------------------------------------------------
  // 7. Gallery Data Array & Accessible Lightbox
  // --------------------------------------------------------------------------
  /**
   * Single array of gallery photos (does not duplicate images used in Initiatives).
   * Thumbnails use WebP with explicit width & height. Full images loaded in lightbox.
   */
  const galleryPhotos = [
    {
      id: 1,
      thumb: 'images/hero-slide-1.webp',
      full: 'images/hero-slide-1.webp',
      title: 'Hrudayathil Ennum - Farewell & Gratitude',
      category: 'Fest',
      alt: 'Oasis team gathering celebrating palliative service at GEC Idukki',
      caption: 'Celebrating lifelong fellowship, empathy, and service with our student volunteers.'
    },
    {
      id: 2,
      thumb: 'images/hero-slide-2.webp',
      full: 'images/hero-slide-2.webp',
      title: 'Volunteer Fellowship Gathering',
      category: 'Fest',
      alt: 'Student volunteers celebrating community impact at GEC Idukki',
      caption: 'Student volunteers unite to celebrate teamwork and collective palliative outreach.'
    },
    {
      id: 3,
      thumb: 'images/hero-palliative.webp',
      full: 'images/hero-palliative.webp',
      title: 'Palliative Companion Home Visit',
      category: 'Visits',
      alt: 'Student volunteer offering gentle companion support during home care visit',
      caption: 'Offering quiet companionship, active listening, and warmth to homebound patients in Idukki.'
    }
  ];

  const galleryGrid = document.getElementById('gallery-grid');
  const galleryFiltersContainer = document.getElementById('gallery-filters');
  const lightboxModal = document.getElementById('gallery-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxTag = document.getElementById('lightbox-tag');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  let currentLightboxIndex = 0;
  let activeCategory = 'All';
  let filteredPhotos = [...galleryPhotos];
  let releaseLightboxTrap = null;
  let lastGalleryTrigger = null;

  // Extract unique categories from array
  const availableCategories = Array.from(new Set(galleryPhotos.map(p => p.category)));

  // Render Category Filter Buttons (hide if only one category exists)
  if (galleryFiltersContainer) {
    if (availableCategories.length > 1) {
      const allCategories = ['All', ...availableCategories];
      galleryFiltersContainer.innerHTML = allCategories.map(cat => `
        <button type="button" class="gallery-filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">
          ${cat}
        </button>
      `).join('');

      galleryFiltersContainer.querySelectorAll('.gallery-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          galleryFiltersContainer.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeCategory = btn.getAttribute('data-category');
          renderGalleryGrid();
        });
      });
    } else {
      galleryFiltersContainer.classList.add('hidden');
    }
  }

  // Render Grid Cards
  function renderGalleryGrid() {
    if (!galleryGrid) return;

    filteredPhotos = activeCategory === 'All'
      ? galleryPhotos
      : galleryPhotos.filter(p => p.category === activeCategory);

    galleryGrid.innerHTML = filteredPhotos.map((photo, index) => `
      <article class="gallery-card group reveal revealed" data-gallery-index="${index}" tabindex="0" role="button" aria-label="View photo: ${photo.title}">
        <div class="gallery-thumb-wrapper">
          <img src="${photo.thumb}" alt="${photo.alt}" width="800" height="533" loading="lazy" class="group-hover:scale-105 transition-transform duration-500">
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#0B3C5D] text-xs font-bold shadow-sm border border-[#E5EBF0]">
            ${photo.category}
          </span>
          <div class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/95 text-[#0B3C5D] flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
            <i data-lucide="maximize-2" class="w-4 h-4" aria-hidden="true"></i>
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between">
          <h3 class="font-heading text-lg font-bold text-[#0B3C5D] leading-snug group-hover:text-[#30AFFF] transition-colors">
            ${photo.title}
          </h3>
          <p class="text-xs text-[#4B637A] mt-2 line-clamp-2 leading-relaxed">
            ${photo.caption}
          </p>
        </div>
      </article>
    `).join('');

    if (window.lucide) lucide.createIcons();

    // Attach click and enter/space key listeners
    galleryGrid.querySelectorAll('.gallery-card').forEach((card, idx) => {
      card.addEventListener('click', () => openLightbox(idx, card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx, card);
        }
      });
    });
  }

  renderGalleryGrid();

  function updateLightboxContent(idx) {
    if (idx < 0 || idx >= filteredPhotos.length) return;
    currentLightboxIndex = idx;
    const photo = filteredPhotos[idx];

    if (lightboxImg) {
      lightboxImg.src = photo.full;
      lightboxImg.alt = photo.alt;
    }
    if (lightboxTitle) lightboxTitle.textContent = photo.title;
    if (lightboxTag) lightboxTag.textContent = photo.category;
    if (lightboxCaption) lightboxCaption.textContent = photo.caption;
  }

  function openLightbox(index, triggerElement) {
    if (!lightboxModal) return;
    lastGalleryTrigger = triggerElement;
    updateLightboxContent(index);

    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    releaseLightboxTrap = createFocusTrap(lightboxModal, closeLightbox);
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (releaseLightboxTrap) {
      releaseLightboxTrap();
      releaseLightboxTrap = null;
    }
    if (lastGalleryTrigger) {
      lastGalleryTrigger.focus();
    }
  }

  function nextLightbox() {
    if (filteredPhotos.length <= 1) return;
    const nextIdx = (currentLightboxIndex + 1) % filteredPhotos.length;
    updateLightboxContent(nextIdx);
  }

  function prevLightbox() {
    if (filteredPhotos.length <= 1) return;
    const prevIdx = (currentLightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    updateLightboxContent(prevIdx);
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', nextLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', prevLightbox);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });

    // Arrow keys navigation
    document.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('active')) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevLightbox();
      }
    });

    // Touch Swipe on mobile
    let touchStartX = 0;
    let touchEndX = 0;
    lightboxModal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchStartX - touchEndX;
      if (Math.abs(swipeDistance) > 45) {
        if (swipeDistance > 0) {
          nextLightbox(); // Swiped left -> next
        } else {
          prevLightbox(); // Swiped right -> prev
        }
      }
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 8. Subtle Scroll Reveal (Respecting prefers-reduced-motion)
  // --------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealElements.forEach(el => el.classList.add('revealed'));
  } else if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // --------------------------------------------------------------------------
  // 9. Hero Background Video (self-hosted) — pause under reduced motion
  // --------------------------------------------------------------------------
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo && prefersReducedMotion) {
    heroVideo.pause();
    heroVideo.removeAttribute('autoplay');
  }
});
