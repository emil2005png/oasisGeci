/**
 * Oasis Pain and Palliative Care Unit - GEC Idukki
 * Main Frontend Interactivity Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // --- 1. Mobile Navigation Drawer ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const closeMobileMenuBtn = document.getElementById('close-mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileMenu() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeMobileMenu() {
    if (mobileDrawer) {
      mobileDrawer.classList.add('translate-x-full');
      document.body.style.overflow = '';
    }
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileMenu);
  if (closeMobileMenuBtn) closeMobileMenuBtn.addEventListener('click', closeMobileMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // --- 2. Sticky Navbar Background on Scroll ---
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('shadow-lg');
    } else {
      navbar?.classList.remove('shadow-lg');
    }
  });

  // --- 3. Impact Metrics Counter Animation ---
  const counterElements = document.querySelectorAll('.counter-value');
  let animated = false;

  function animateCounters() {
    counterElements.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const duration = 2000; // 2 seconds
      const stepTime = 20;
      const steps = duration / stepTime;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = target + '+';
          clearInterval(timer);
        } else {
          counter.textContent = Math.ceil(current) + '+';
        }
      }, stepTime);
    });
  }

  const impactSection = document.getElementById('impact');
  if (impactSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCounters();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(impactSection);
  }

  // --- 4. Interactive Initiatives Modal ---
  const initiativeData = {
    harsham: {
      title: "Harsham - Annual Palliative Fest & Awareness Drive",
      subtitle: "GEC Idukki's Flagship Student Palliative Event",
      image: "assets/harsham-fest.jpg",
      tag: "Annual Flagship Event",
      description: `Harsham is the landmark annual palliative care awareness festival organized by Oasis GEC Idukki. It brings together engineering students, faculty, medical professionals, and local palliative care workers in Painavu to spread empathy and break taboos surrounding palliative care.`,
      highlights: [
        "Interactive seminars and compassionate care workshops led by palliative care doctors.",
        "Cultural competitions, street plays (Nukkad Natak), and floral art exhibitions celebrating human resilience.",
        "Fundraising drives for essential medical equipment and home-care patient support kits.",
        "Inter-college youth convention on palliative volunteering in Kerala."
      ]
    },
    outreach: {
      title: "Old Age Home Outreach & Home Visits",
      subtitle: "Companion Care & Compassionate Support in Idukki",
      image: "assets/outreach-care.jpg",
      tag: "Weekly Outreach",
      description: `Our dedicated student volunteers regularly visit elder care homes and bedridden palliative patients across Painavu and surrounding Panchayaths in Idukki. Beyond medical supplies, we focus on emotional companionship and active listening.`,
      highlights: [
        "Bi-weekly weekend visits to elderly care homes for companionship and recreational activities.",
        "Material pooling drives collecting bedsheets, hygiene products, adult diapers, and nutritious food.",
        "Assisting local palliative nurses during home-care medical rounds.",
        "Recording patient stories and offering compassionate presence to reduce loneliness."
      ]
    },
    festive: {
      title: "Festive Care (Oasis Onam & Christmas Drives)",
      subtitle: "Bringing Festival Warmth to Every Homebound Patient",
      image: "assets/festive-care.jpg",
      tag: "Seasonal Initiative",
      description: `No patient should feel isolated during Kerala's grand celebrations. Through Oasis Festive Care, our student teams prepare and hand-deliver customized festival kits, Onam Sadya treats, and Christmas gifts to homebound patients.`,
      highlights: [
        "Oasis Onam Kit Supply: Essential grocery kits, banana chips, and traditional new clothes (Kasavu/Dhoti).",
        "Cultural performances with family members of bedridden patients in their homes.",
        "Christmas cake distribution and caroling in remote hill-tract homes of Idukki.",
        "Spreading festive joy, smiles, and community solidarity."
      ]
    }
  };

  const modal = document.getElementById('initiative-modal');
  const modalImage = document.getElementById('modal-img');
  const modalTag = document.getElementById('modal-tag');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalDescription = document.getElementById('modal-description');
  const modalHighlights = document.getElementById('modal-highlights');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const closeModalFooterBtn = document.getElementById('close-modal-footer-btn');

  function openModal(key) {
    const data = initiativeData[key];
    if (!data || !modal) return;

    if (modalImage) modalImage.src = data.image;
    if (modalTag) modalTag.textContent = data.tag;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalSubtitle) modalSubtitle.textContent = data.subtitle;
    if (modalDescription) modalDescription.textContent = data.description;

    if (modalHighlights) {
      modalHighlights.innerHTML = data.highlights
        .map(h => `<li class="flex items-start gap-2 text-sm text-[#031b33] font-medium">
          <i data-lucide="check-circle-2" class="w-4 h-4 text-[#031b33] mt-0.5 shrink-0"></i>
          <span>${h}</span>
        </li>`)
        .join('');
    }

    if (window.lucide) lucide.createIcons();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.open-initiative-modal').forEach(button => {
    button.addEventListener('click', (e) => {
      const key = e.currentTarget.getAttribute('data-initiative');
      openModal(key);
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (closeModalFooterBtn) closeModalFooterBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // --- 5. Volunteer Form Photo Upload Preview ---
  const photoInput = document.getElementById('photo-input');
  const photoPreview = document.getElementById('photo-preview');
  const photoPlaceholder = document.getElementById('photo-placeholder');

  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
          if (photoPreview) {
            photoPreview.style.backgroundImage = `url('${event.target.result}')`;
            photoPreview.classList.remove('hidden');
          }
          if (photoPlaceholder) photoPlaceholder.classList.add('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // --- 6. Volunteer Form Submission & Toast ---
  const volunteerForm = document.getElementById('volunteer-form');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  function showToast(message, isSuccess = true) {
    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;
    
    toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 border-2 ${
      isSuccess ? 'bg-[#D8FFC5] text-[#031b33] border-[#C4F7CA]' : 'bg-rose-500 text-white border-rose-700'
    }`;

    setTimeout(() => {
      toast.classList.add('translate-y-12', 'opacity-0');
    }, 4500);
  }

  if (volunteerForm) {
    volunteerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('vol-name')?.value.trim();
      const dept = document.getElementById('vol-dept')?.value;
      const year = document.getElementById('vol-year')?.value;
      const phone = document.getElementById('vol-phone')?.value.trim();

      if (!name || !dept || !year || !phone) {
        showToast("Please complete all required fields.", false);
        return;
      }

      // Successful registration simulate
      showToast(`Welcome to Oasis, ${name}! Your volunteer application has been submitted successfully.`);
      volunteerForm.reset();
      
      if (photoPreview) photoPreview.classList.add('hidden');
      if (photoPlaceholder) photoPlaceholder.classList.remove('hidden');
    });
  }
});
