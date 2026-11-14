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
  // 1.1 HTML Sanitizer Helper for Safe DOM Injection
  // --------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
      image: "images/harsham-fest-new.jpg",
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
      image: "images/outreach-care-new.jpg",
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
      image: "images/festive-care-new.jpg",
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
          <span>${escapeHtml(h)}</span>
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
    const initModalContactLink = initModal.querySelector('a[href="#contact"]');
    if (initModalContactLink) {
      initModalContactLink.addEventListener('click', closeInitiativeModal);
    }
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
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/kaithangu.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587517217',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/kaithangu.jpg?tr=f-auto&updatedAt=1794587517217',
      title: 'Hrudayathil Ennum - Farewell & Gratitude',
      category: 'Fest',
      alt: 'Oasis team gathering celebrating palliative service at GEC Idukki',
      caption: 'Celebrating lifelong fellowship, empathy, and service with our student volunteers.'
    },
    {
      id: 2,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/isha.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587517237',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/isha.jpg?tr=f-auto&updatedAt=1794587517237',
      title: 'Isha – Palliative Awareness Programme',
      category: 'Outreach',
      alt: 'Oasis GEC Idukki Isha palliative awareness programme',
      caption: 'Reaching out to the community with warmth and compassionate palliative awareness.'
    },
    {
      id: 3,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/odyssy.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587517278',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/odyssy.jpg?tr=f-auto&updatedAt=1794587517278',
      title: 'Odyssey – Annual Cultural Fest',
      category: 'Fest',
      alt: 'Oasis GEC Idukki students at Odyssey annual cultural festival',
      caption: 'Oasis volunteers bringing hope and care to the stage at the annual college fest.'
    },
    {
      id: 4,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/manjadi.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587517159',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/manjadi.jpg?tr=f-auto&updatedAt=1794587517159',
      title: 'Manjadi – Cultural Outreach Activity',
      category: 'Outreach',
      alt: 'Oasis GEC Idukki Manjadi cultural outreach activity',
      caption: 'Connecting tradition and compassion through student-led community engagement.'
    },
    {
      id: 5,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/harsham-fest.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587517096',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/harsham-fest.jpg?tr=f-auto&updatedAt=1794587517096',
      title: 'Harsham – Joy & Service Celebration',
      category: 'Fest',
      alt: 'Oasis GEC Idukki Harsham fest celebration',
      caption: 'A joyful gathering that celebrates the spirit of service, unity, and palliative compassion.'
    },
    {
      id: 6,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/swantanam.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587517119',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/swantanam.jpg?tr=f-auto&updatedAt=1794587517119',
      title: 'Swantanam – Companion Care Visit',
      category: 'Visits',
      alt: 'Oasis GEC Idukki Swantanam companion care home visit',
      caption: 'Offering comfort, presence, and heartfelt support to patients and their families.'
    },
    {
      id: 7,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_826989422_18116601710590464_2339232382542875650_n_1080.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587517161',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_826989422_18116601710590464_2339232382542875650_n_1080.jpg?tr=f-auto&updatedAt=1794587517161',
      title: 'Oasis in Action – Community Programme',
      category: 'Events',
      alt: 'Oasis GEC Idukki volunteers at a community programme',
      caption: 'Students from Oasis GEC Idukki engaged in meaningful community service and palliative outreach.'
    },
    {
      id: 8,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_684430466_18095795492590464_1684878151952308457_n_1080.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587516926',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_684430466_18095795492590464_1684878151952308457_n_1080.jpg?tr=f-auto&updatedAt=1794587516926',
      title: 'Volunteer Moments – Palliative Outreach',
      category: 'Outreach',
      alt: 'Oasis GEC Idukki student volunteers during palliative outreach',
      caption: 'Every visit, every gesture of care—our volunteers make a lasting difference in lives.'
    },
    {
      id: 9,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_684777165_18095795504590464_8845942030792633549_n_1080.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587516916',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_684777165_18095795504590464_8845942030792633549_n_1080.jpg?tr=f-auto&updatedAt=1794587516916',
      title: 'Oasis Outreach – Compassionate Service',
      category: 'Outreach',
      alt: 'Oasis GEC Idukki compassionate service programme',
      caption: 'Reaching hearts and homes—Oasis volunteers dedicated to spreading palliative care awareness.'
    },
    {
      id: 10,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_591155320_18077129666590464_3636558550757354006_n.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587517016',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_591155320_18077129666590464_3636558550757354006_n.jpg?tr=f-auto&updatedAt=1794587517016',
      title: 'Student Volunteers – Care in Community',
      category: 'Events',
      alt: 'Oasis GEC Idukki student volunteers in community care programme',
      caption: 'Building bonds of empathy and care one visit and programme at a time.'
    },
    {
      id: 11,
      thumb: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_570598195_18072626093590464_6508552308412545166_n.jpg?tr=w-600,h-400,fo-auto&updatedAt=1794587516926',
      full: 'https://ik.imagekit.io/qf5fl2l1e/gallery/SaveVid.Net_570598195_18072626093590464_6508552308412545166_n.jpg?tr=f-auto&updatedAt=1794587516926',
      title: 'Together in Care – Oasis Community',
      category: 'Events',
      alt: 'Oasis GEC Idukki community gathering and palliative care activity',
      caption: 'United in purpose—Oasis volunteers fostering hope, compassion, and community well-being.'
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
        <button type="button" class="gallery-filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
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
      <article class="gallery-card group reveal revealed" data-gallery-index="${index}" tabindex="0" role="button" aria-label="View photo: ${escapeHtml(photo.title)}">
        <div class="gallery-thumb-wrapper">
          <img src="${escapeHtml(photo.thumb)}" alt="${escapeHtml(photo.alt)}" width="800" height="533" loading="lazy" class="group-hover:scale-105 transition-transform duration-500">
          <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[#0B3C5D] text-xs font-bold shadow-sm border border-[#E5EBF0]">
            ${escapeHtml(photo.category)}
          </span>
          <div class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/95 text-[#0B3C5D] flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
            <i data-lucide="maximize-2" class="w-4 h-4" aria-hidden="true"></i>
          </div>
        </div>
        <div class="p-5 flex-1 flex flex-col justify-between">
          <h3 class="font-heading text-lg font-bold text-[#0B3C5D] leading-snug group-hover:text-[#30AFFF] transition-colors">
            ${escapeHtml(photo.title)}
          </h3>
          <p class="text-xs text-[#4B637A] mt-2 line-clamp-2 leading-relaxed">
            ${escapeHtml(photo.caption)}
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

  // --------------------------------------------------------------------------
  // 10. Committee Members Horizontal Carousel (5 Cards Desktop, Loop, Touch)
  // --------------------------------------------------------------------------
  const committeeViewport = document.getElementById('committee-carousel-viewport');
  const committeeTrack = document.getElementById('committee-track');
  const committeePrevBtn = document.getElementById('committee-prev');
  const committeeNextBtn = document.getElementById('committee-next');

  if (committeeViewport && committeeTrack) {
    const cards = Array.from(committeeTrack.children);
    let currentIndex = 0;
    let autoplayTimer = null;
    const AUTOPLAY_INTERVAL = 4000;

    function getVisibleCount() {
      const width = window.innerWidth;
      if (width >= 1280) return 5;
      if (width >= 1024) return 4;
      if (width >= 768) return 3;
      if (width >= 480) return 2;
      return 1;
    }

    function getMaxIndex() {
      return Math.max(0, cards.length - getVisibleCount());
    }

    function getStep() {
      if (cards.length > 1) {
        return cards[1].offsetLeft - cards[0].offsetLeft;
      }
      return cards[0] ? cards[0].offsetWidth : 0;
    }

    function updateCarousel(smooth = true) {
      if (!committeeTrack || !cards.length) return;
      committeeTrack.style.transition =
        smooth && !prefersReducedMotion
          ? 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
          : 'none';

      const maxIndex = getMaxIndex();
      currentIndex = Math.min(Math.max(0, currentIndex), maxIndex);
      const step = getStep();
      const offset = currentIndex * step;
      committeeTrack.style.transform = `translateX(-${offset}px)`;
    }

    function nextMember() {
      const maxIndex = getMaxIndex();
      if (currentIndex >= maxIndex) {
        currentIndex = 0; // Loop continuously back to first member
      } else {
        currentIndex++;
      }
      updateCarousel(true);
    }

    function prevMember() {
      const maxIndex = getMaxIndex();
      if (currentIndex <= 0) {
        currentIndex = maxIndex; // Loop continuously to last set of members
      } else {
        currentIndex--;
      }
      updateCarousel(true);
    }

    // Autoplay logic (~4s interval)
    function startAutoplay() {
      stopAutoplay();
      if (!prefersReducedMotion) {
        autoplayTimer = setInterval(nextMember, AUTOPLAY_INTERVAL);
      }
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    // Arrow button listeners
    if (committeePrevBtn) {
      committeePrevBtn.addEventListener('click', () => {
        prevMember();
        startAutoplay();
      });
      committeePrevBtn.addEventListener('mouseenter', stopAutoplay);
      committeePrevBtn.addEventListener('mouseleave', startAutoplay);
      committeePrevBtn.addEventListener('focusin', stopAutoplay);
      committeePrevBtn.addEventListener('focusout', startAutoplay);
    }

    if (committeeNextBtn) {
      committeeNextBtn.addEventListener('click', () => {
        nextMember();
        startAutoplay();
      });
      committeeNextBtn.addEventListener('mouseenter', stopAutoplay);
      committeeNextBtn.addEventListener('mouseleave', startAutoplay);
      committeeNextBtn.addEventListener('focusin', stopAutoplay);
      committeeNextBtn.addEventListener('focusout', startAutoplay);
    }

    // Pause on hover & focus
    committeeViewport.addEventListener('mouseenter', stopAutoplay);
    committeeViewport.addEventListener('mouseleave', startAutoplay);
    committeeViewport.addEventListener('focusin', stopAutoplay);
    committeeViewport.addEventListener('focusout', startAutoplay);

    // Keyboard navigation (ArrowLeft & ArrowRight)
    committeeViewport.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevMember();
        startAutoplay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextMember();
        startAutoplay();
      }
    });

    // Touch & Swipe gestures with 1:1 finger tracking
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDeltaX = 0;
    let isTouchSwiping = false;
    let isHorizontalGesture = null;

    committeeViewport.addEventListener(
      'touchstart',
      (e) => {
        stopAutoplay();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchDeltaX = 0;
        isTouchSwiping = true;
        isHorizontalGesture = null;
      },
      { passive: true }
    );

    committeeViewport.addEventListener(
      'touchmove',
      (e) => {
        if (!isTouchSwiping) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        touchDeltaX = currentX - touchStartX;
        const deltaY = currentY - touchStartY;

        if (isHorizontalGesture === null) {
          if (Math.abs(touchDeltaX) > 6 || Math.abs(deltaY) > 6) {
            isHorizontalGesture = Math.abs(touchDeltaX) > Math.abs(deltaY);
          }
        }

        if (isHorizontalGesture) {
          if (e.cancelable) e.preventDefault();
          const step = getStep();
          const baseOffset = currentIndex * step;
          const targetOffset = baseOffset - touchDeltaX;
          committeeTrack.style.transition = 'none';
          committeeTrack.style.transform = `translateX(-${targetOffset}px)`;
        }
      },
      { passive: false }
    );

    committeeViewport.addEventListener('touchend', () => {
      if (!isTouchSwiping) return;
      isTouchSwiping = false;
      const step = getStep();
      const threshold = Math.min(50, step * 0.25);
      if (touchDeltaX < -threshold) {
        nextMember();
      } else if (touchDeltaX > threshold) {
        prevMember();
      } else {
        updateCarousel(true);
      }
      startAutoplay();
    });

    // Trackpad horizontal sliding (two-finger swipe) & Shift + Wheel
    let wheelAccumulator = 0;
    let wheelTimeout = null;

    committeeViewport.addEventListener(
      'wheel',
      (e) => {
        const deltaX = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
        if (Math.abs(deltaX) > 4) {
          e.preventDefault();
          stopAutoplay();
          wheelAccumulator += deltaX;

          const step = getStep();
          const threshold = Math.min(60, step * 0.3);

          if (wheelAccumulator > threshold) {
            nextMember();
            wheelAccumulator = 0;
          } else if (wheelAccumulator < -threshold) {
            prevMember();
            wheelAccumulator = 0;
          }

          clearTimeout(wheelTimeout);
          wheelTimeout = setTimeout(() => {
            wheelAccumulator = 0;
            startAutoplay();
          }, 350);
        }
      },
      { passive: false }
    );

    // Mouse drag support for desktop
    let isMouseDown = false;
    let mouseStartX = 0;
    let mouseDeltaX = 0;

    committeeViewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isMouseDown = true;
      mouseStartX = e.clientX;
      mouseDeltaX = 0;
      stopAutoplay();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDown) return;
      mouseDeltaX = e.clientX - mouseStartX;
      const step = getStep();
      const baseOffset = currentIndex * step;
      const targetOffset = baseOffset - mouseDeltaX;
      committeeTrack.style.transition = 'none';
      committeeTrack.style.transform = `translateX(-${targetOffset}px)`;
    });

    window.addEventListener('mouseup', () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      const step = getStep();
      const threshold = Math.min(50, step * 0.25);
      if (mouseDeltaX < -threshold) {
        nextMember();
      } else if (mouseDeltaX > threshold) {
        prevMember();
      } else {
        updateCarousel(true);
      }
      startAutoplay();
    });

    // Window resize handler
    window.addEventListener('resize', () => {
      updateCarousel(false);
    });

    // Initial setup
    updateCarousel(false);
    startAutoplay();
  }
});
