/* ==========================================================================
   JODHPUR VOYAGE - MAIN UTILITIES & HIGH INTERACTIVITY LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------------
     1. SCROLL-TO-TOP & HEADER SCROLL LOGIC
     ------------------------------------------------------------------------ */
  const scrollTopBtn = document.querySelector('.scroll-to-top');
  const siteHeader = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    // Scroll to Top visibility
    if (scrollTopBtn) {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }

    // Dynamic Header Shadow & Compact Effect
    if (siteHeader) {
      if (window.scrollY > 50) {
        siteHeader.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.12)';
      } else {
        siteHeader.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
      }
    }
  });

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ------------------------------------------------------------------------
     2. GENERAL ACCORDIONS (For Infos Pratiques, FAQs & Itineraries)
     ------------------------------------------------------------------------ */
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const accordionItem = header.parentElement;
      const accordionBody = accordionItem.querySelector('.accordion-body');
      const isActive = accordionItem.classList.contains('active');

      const parentContainer = accordionItem.closest('.accordion-container');
      if (parentContainer) {
        const siblings = parentContainer.querySelectorAll('.accordion-item');
        siblings.forEach(sibling => {
          sibling.classList.remove('active');
          const body = sibling.querySelector('.accordion-body');
          if (body) body.style.maxHeight = null;
        });
      }

      if (!isActive) {
        accordionItem.classList.add('active');
        if (accordionBody) {
          accordionBody.style.maxHeight = accordionBody.scrollHeight + "px";
        }
      }
    });
  });

  /* ------------------------------------------------------------------------
     3. INTERACTIVE CATEGORY FILTER TABS
     ------------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const filterableCards = document.querySelectorAll('[data-category]');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        filterableCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filterValue === 'all' || category === filterValue || filterValue.includes(category)) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'none';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'none';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. INTERACTIVE IMAGE LIGHTBOX PREVIEW
     ------------------------------------------------------------------------ */
  const lightboxOverlay = document.createElement('div');
  lightboxOverlay.className = 'lightbox-overlay';
  lightboxOverlay.innerHTML = `
    <span class="lightbox-close">&times;</span>
    <img src="" alt="Preview" class="lightbox-content">
  `;
  document.body.appendChild(lightboxOverlay);

  const lightboxImg = lightboxOverlay.querySelector('.lightbox-content');
  const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');

  const clickableImages = document.querySelectorAll('.editorial-card img, .destination-card img, .gallery-img');
  clickableImages.forEach(img => {
    if (img.closest('a')) return; // Do not block navigation if image is inside a link
    img.style.cursor = 'default';
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
      lightboxOverlay.classList.remove('active');
    });
  }

  lightboxOverlay.addEventListener('click', (e) => {
    if (e.target === lightboxOverlay) {
      lightboxOverlay.classList.remove('active');
    }
  });

  /* ------------------------------------------------------------------------
     5. INTERSECTION OBSERVER FOR FADE-IN ANIMATIONS
     ------------------------------------------------------------------------ */
  const animateElements = document.querySelectorAll('.animate-fade-up, .tour-card, .destination-card, .editorial-card');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    animateElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

  /* ------------------------------------------------------------------------
     6. COMMENTAIRES PAGE FILTERING & INSTANT SEARCH
     ------------------------------------------------------------------------ */
  const reviewFilterChips = document.querySelectorAll('.review-filter-chip');
  const reviewCards = document.querySelectorAll('.review-card');
  const reviewSearchInput = document.getElementById('review-search-input');

  if (reviewFilterChips.length > 0 && reviewCards.length > 0) {
    let currentCategory = 'all';
    let currentQuery = '';

    const filterReviews = () => {
      reviewCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const textContent = card.textContent.toLowerCase();
        
        const matchesCategory = (currentCategory === 'all' || category === currentCategory);
        const matchesSearch = (!currentQuery || textContent.includes(currentQuery));

        if (matchesCategory && matchesSearch) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'none'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'none';
          setTimeout(() => { card.style.display = 'none'; }, 200);
        }
      });
    };

    reviewFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        reviewFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentCategory = chip.getAttribute('data-category');
        filterReviews();
      });
    });

    if (reviewSearchInput) {
      reviewSearchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value.toLowerCase().trim();
        filterReviews();
      });
    }
  }

  /* ------------------------------------------------------------------------
     4. HERO FROSTED GLASS SEARCH INTERACTION LOGIC
     ------------------------------------------------------------------------ */
  const heroSearchInputs = document.querySelectorAll('.hero-search-input');

  heroSearchInputs.forEach(input => {
    const container = input.closest('.hero-search-box-container');
    if (!container) return;

    const dropdown = container.querySelector('.hero-search-dropdown');
    const searchItems = dropdown ? dropdown.querySelectorAll('.search-item') : [];
    const searchBtn = container.querySelector('.hero-search-btn');

    // Execute search on Enter
    const executeSearch = () => {
      const query = input.value.trim().toLowerCase();
      const selectVal = container.querySelector('.field-select')?.value || 'all';

      if (selectVal === 'mesure') {
        window.location.href = 'voyage-sur-mesure.html';
        return;
      } else if (selectVal === 'circuits') {
        window.location.href = 'tours.html';
        return;
      } else if (selectVal === 'palais') {
        window.location.href = 'destination-rajasthan.html';
        return;
      } else if (selectVal === 'nepal') {
        window.location.href = 'tours.html';
        return;
      }

      if (query.includes('rajasthan') || query.includes('jaipur') || query.includes('jodhpur') || query.includes('udaipur')) {
        window.location.href = 'destination-rajasthan.html';
      } else if (query.includes('népal') || query.includes('nepal') || query.includes('trek') || query.includes('himalaya')) {
        window.location.href = 'tours.html';
      } else if (query.includes('mesure') || query.includes('sur mesure') || query.includes('devis')) {
        window.location.href = 'voyage-sur-mesure.html';
      } else if (query.includes('taj') || query.includes('agra') || query.includes('varanasi') || query.includes('bénarès')) {
        window.location.href = 'destinations.html';
      } else {
        window.location.href = `tours.html?q=${encodeURIComponent(query || 'all')}`;
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch();
      }
    });

    if (searchBtn) {
      searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        executeSearch();
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        container.classList.remove('active');
      }
    });
  });
});

