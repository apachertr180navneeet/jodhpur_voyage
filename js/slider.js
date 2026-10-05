/* ==========================================================================
   JODHPUR VOYAGE - SLIDER INTERACTIVITY
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ------------------------------------------------------------------------
     1. HERO SLIDER LOGIC
     ------------------------------------------------------------------------ */
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');

  if (slides.length > 0) {
    let currentSlide = 0;
    let slideInterval;

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      if (dots[currentSlide]) dots[currentSlide].classList.remove('active');

      currentSlide = (index + slides.length) % slides.length;

      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      slideInterval = setInterval(nextSlide, 6000);
    }

    function stopAutoPlay() {
      if (slideInterval) clearInterval(slideInterval);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startAutoPlay();
      });
    });

    const heroSection = document.querySelector('.hero-slider-section');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', stopAutoPlay);
      heroSection.addEventListener('mouseleave', startAutoPlay);

      // Touch Swipe Support for Mobile
      let touchStartX = 0;
      let touchEndX = 0;

      heroSection.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      heroSection.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) {
          nextSlide();
          startAutoPlay();
        } else if (touchEndX > touchStartX + 50) {
          prevSlide();
          startAutoPlay();
        }
      }, { passive: true });
    }

    // Initialize auto play
    startAutoPlay();
  }

  /* ------------------------------------------------------------------------
     2. DESTINATION CAROUSEL LOGIC
     ------------------------------------------------------------------------ */
  const carouselContainer = document.querySelector('.destinations-carousel-container');
  const carouselPrev = document.querySelector('.carousel-prev');
  const carouselNext = document.querySelector('.carousel-next');

  if (carouselContainer && (carouselPrev || carouselNext)) {
    const getScrollStep = () => {
      const card = carouselContainer.querySelector('.destination-card');
      if (!card) return 200;
      const gap = 12; // 0.75rem gap
      return Math.round(card.getBoundingClientRect().width + gap); // Exactly 1 image width + gap
    };

    const scrollNext = () => {
      const maxScroll = carouselContainer.scrollWidth - carouselContainer.clientWidth;
      if (carouselContainer.scrollLeft >= maxScroll - 10) {
        carouselContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        carouselContainer.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      }
    };

    const scrollPrev = () => {
      if (carouselContainer.scrollLeft <= 10) {
        const maxScroll = carouselContainer.scrollWidth - carouselContainer.clientWidth;
        carouselContainer.scrollTo({ left: maxScroll, behavior: 'smooth' });
      } else {
        carouselContainer.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      }
    };

    if (carouselNext) {
      carouselNext.addEventListener('click', () => {
        scrollNext();
        resetCarouselAutoPlay();
      });
    }

    if (carouselPrev) {
      carouselPrev.addEventListener('click', () => {
        scrollPrev();
        resetCarouselAutoPlay();
      });
    }

    // Auto-slide 1 image at a time every 3.5 seconds
    let carouselAutoInterval;
    const startCarouselAutoPlay = () => {
      stopCarouselAutoPlay();
      carouselAutoInterval = setInterval(scrollNext, 3500);
    };
    const stopCarouselAutoPlay = () => {
      if (carouselAutoInterval) clearInterval(carouselAutoInterval);
    };
    const resetCarouselAutoPlay = () => {
      startCarouselAutoPlay();
    };

    const destSection = document.querySelector('.destinations-section');
    if (destSection) {
      destSection.addEventListener('mouseenter', stopCarouselAutoPlay);
      destSection.addEventListener('mouseleave', startCarouselAutoPlay);
      destSection.addEventListener('touchstart', stopCarouselAutoPlay, { passive: true });
    }

    startCarouselAutoPlay();
  }

  /* ------------------------------------------------------------------------
     3. TESTIMONIAL SLIDER LOGIC
     ------------------------------------------------------------------------ */
  const testimonialItems = document.querySelectorAll('.testimonial-item');
  const testimonialPrev = document.querySelector('.testimonial-prev');
  const testimonialNext = document.querySelector('.testimonial-next');

  if (testimonialItems.length > 0) {
    let currentTestimonial = 0;
    let testimonialTimer;

    function showTestimonial(index) {
      testimonialItems[currentTestimonial].classList.remove('active');
      currentTestimonial = (index + testimonialItems.length) % testimonialItems.length;
      testimonialItems[currentTestimonial].classList.add('active');
    }

    function autoTestimonial() {
      showTestimonial(currentTestimonial + 1);
    }

    if (testimonialNext) {
      testimonialNext.addEventListener('click', () => {
        showTestimonial(currentTestimonial + 1);
        resetTestimonialTimer();
      });
    }

    if (testimonialPrev) {
      testimonialPrev.addEventListener('click', () => {
        showTestimonial(currentTestimonial - 1);
        resetTestimonialTimer();
      });
    }

    function resetTestimonialTimer() {
      if (testimonialTimer) clearInterval(testimonialTimer);
      testimonialTimer = setInterval(autoTestimonial, 7000);
    }

    resetTestimonialTimer();
  }
});
