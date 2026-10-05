/* ==========================================================================
   JODHPUR VOYAGE - FORMS & ANTI-SPAM LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Anti-Spam Dynamic Math Captcha Generator
  function setupAntiSpamCaptcha(num1Id, num2Id) {
    const num1El = document.getElementById(num1Id);
    const num2El = document.getElementById(num2Id);
    if (!num1El || !num2El) return null;

    const n1 = Math.floor(Math.random() * 8) + 2; // 2..9
    const n2 = Math.floor(Math.random() * 7) + 1; // 1..7
    num1El.textContent = n1;
    num2El.textContent = n2;
    return n1 + n2;
  }

  let contactExpectedSum = setupAntiSpamCaptcha('math-num1', 'math-num2');
  let mesureExpectedSum = setupAntiSpamCaptcha('math-num1-mesure', 'math-num2-mesure');
  let modalExpectedSum = setupAntiSpamCaptcha('math-num1-modal', 'math-num2-modal');

  // Dynamic Travelers Count Total Calculator
  document.querySelectorAll('.select-travelers-calc').forEach(select => {
    select.addEventListener('change', (e) => {
      const form = e.target.closest('form');
      if (!form) return;
      const adults = parseInt(form.querySelector('[name="adults_count"]')?.value || '0', 10);
      const children = parseInt(form.querySelector('[name="children_count"]')?.value || '0', 10);
      const babies = parseInt(form.querySelector('[name="babies_count"]')?.value || '0', 10);
      const totalInput = form.querySelector('[name="travelers_total"]');
      if (totalInput) {
        totalInput.value = adults + children + babies;
      }
    });
  });


  /* ------------------------------------------------------------------------
     1. PACKAGE BOOKING POPUP MODAL LOGIC
     ------------------------------------------------------------------------ */
  const bookingModal = document.getElementById('packageBookingModal');
  const closeModalBtn = document.getElementById('closeBookingModal');
  const openModalBtns = document.querySelectorAll('.btn-open-booking-modal');
  const modalTourNameEl = document.getElementById('modalTourName');
  const hiddenTourTitleInput = document.getElementById('hiddenTourTitle');
  const hiddenTourDurationInput = document.getElementById('hiddenTourDuration');
  const packageBookingForm = document.getElementById('package-booking-form');

  function openBookingModal(tourTitle, tourDuration) {
    if (!bookingModal) return;

    const title = tourTitle || 'Circuit sur Mesure';
    const duration = tourDuration || '';

    if (modalTourNameEl) {
      modalTourNameEl.textContent = duration ? `${title} (${duration})` : title;
    }
    if (hiddenTourTitleInput) hiddenTourTitleInput.value = title;
    if (hiddenTourDurationInput) hiddenTourDurationInput.value = duration;

    // Refresh captcha
    modalExpectedSum = setupAntiSpamCaptcha('math-num1-modal', 'math-num2-modal');

    bookingModal.classList.add('active');
    bookingModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    if (!bookingModal) return;
    bookingModal.classList.remove('active');
    bookingModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tourTitle = btn.getAttribute('data-tour-title') || btn.closest('.tour-card')?.querySelector('.tour-card-title')?.textContent?.trim();
      const tourDuration = btn.getAttribute('data-tour-duration') || btn.closest('.tour-card')?.querySelector('.tour-card-duration')?.textContent?.trim();
      openBookingModal(tourTitle, tourDuration);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeBookingModal);
  }

  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeBookingModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
        closeBookingModal();
      }
    });
  }

  // Handle Package Modal Form Submission
  if (packageBookingForm) {
    packageBookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // 1. Honeypot check
      const hpField = packageBookingForm.querySelector('[name="website_url_check"]');
      if (hpField && hpField.value.trim() !== '') {
        console.warn('Spam detected by honeypot.');
        packageBookingForm.reset();
        return;
      }

      // 2. Mandatory Phone Check
      const phoneInput = packageBookingForm.querySelector('[name="phone"]');
      if (phoneInput && (!phoneInput.value || phoneInput.value.trim().length < 5)) {
        alert('Veuillez entrer un numéro de téléphone / WhatsApp valide.');
        phoneInput.focus();
        return;
      }

      // 3. Captcha Check
      const captchaInput = document.getElementById('captcha-answer-modal');
      if (captchaInput && modalExpectedSum !== null) {
        const userAns = parseInt(captchaInput.value.trim(), 10);
        if (userAns !== modalExpectedSum) {
          alert('Vérification anti-spam incorrecte. Veuillez vérifier votre résultat.');
          captchaInput.focus();
          return;
        }
      }

      const modalBody = bookingModal.querySelector('.booking-modal-body');
      const tourTitleVal = hiddenTourTitleInput ? hiddenTourTitleInput.value : 'votre circuit';

      if (modalBody) {
        modalBody.innerHTML = `
          <div style="text-align: center; padding: 2.5rem 1rem;">
            <div style="width: 75px; height: 75px; background-color: var(--color-primary-light); color: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin: 0 auto 1.2rem auto;">
              <i class="fas fa-check"></i>
            </div>
            <h3 style="font-family: var(--font-heading); margin-bottom: 0.8rem; color: var(--color-dark);">Demande de réservation reçue !</h3>
            <p style="font-size: 1rem; color: var(--color-text-muted); max-width: 520px; margin: 0 auto 1.5rem auto; line-height: 1.6;">
              Namasté ! Nous vous remercions pour votre demande concernant <strong>${tourTitleVal}</strong>. Notre équipe locale d'experts en voyage étudie votre dossier et vous contactera sous 24h par email ou WhatsApp.
            </p>
            <button class="btn btn-primary" onclick="document.getElementById('closeBookingModal').click()">Fermer cette fenêtre</button>
          </div>
        `;
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. SIDEBAR BOOKING FORM LOGIC (tour-rajasthan.html)
     ------------------------------------------------------------------------ */
  const sidebarForm = document.getElementById('sidebar-booking-form');
  if (sidebarForm) {
    sidebarForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const phoneInput = sidebarForm.querySelector('[name="phone"]');
      if (phoneInput && (!phoneInput.value || phoneInput.value.trim().length < 5)) {
        alert('Veuillez entrer un numéro de téléphone / WhatsApp valide.');
        phoneInput.focus();
        return;
      }

      const captchaInput = sidebarForm.querySelector('#captcha-answer');
      if (captchaInput && contactExpectedSum !== null) {
        const userAns = parseInt(captchaInput.value.trim(), 10);
        if (userAns !== contactExpectedSum) {
          alert('Vérification anti-spam incorrecte. Veuillez vérifier votre calcul.');
          captchaInput.focus();
          return;
        }
      }

      const widgetCard = sidebarForm.closest('.booking-widget-card');
      if (widgetCard) {
        widgetCard.innerHTML = `
          <div style="text-align: center; padding: 1.5rem 0.5rem;">
            <div style="width: 55px; height: 55px; background: rgba(29, 116, 122, 0.15); color: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 1rem auto;">
              <i class="fas fa-check"></i>
            </div>
            <h4 style="font-family: var(--font-heading); color: var(--color-dark); margin-bottom: 0.5rem;">Demande Envoyée !</h4>
            <p style="font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.5;">
              Merci pour votre demande. Notre conseiller francophone va étudier vos dates et vous répondre sous 24h.
            </p>
          </div>
        `;
      }
    });
  }

  /* ------------------------------------------------------------------------
     3. MULTI-STEP "VOYAGE SUR MESURE" FORM
     ------------------------------------------------------------------------ */
  const multiStepForm = document.getElementById('custom-trip-form');

  if (multiStepForm) {
    const steps = multiStepForm.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const prevBtn = multiStepForm.querySelector('.btn-prev-step');
    const nextBtn = multiStepForm.querySelector('.btn-next-step');
    const submitBtn = multiStepForm.querySelector('.btn-submit-step');
    let currentStep = 0;

    function updateFormSteps() {
      steps.forEach((step, index) => {
        step.style.display = index === currentStep ? 'block' : 'none';
      });

      stepIndicators.forEach((indicator, index) => {
        if (index <= currentStep) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });

      if (prevBtn) prevBtn.style.display = currentStep === 0 ? 'none' : 'inline-flex';
      if (nextBtn) nextBtn.style.display = currentStep === steps.length - 1 ? 'none' : 'inline-flex';
      if (submitBtn) submitBtn.style.display = currentStep === steps.length - 1 ? 'inline-flex' : 'none';
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep < steps.length - 1) {
          currentStep++;
          updateFormSteps();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentStep > 0) {
          currentStep--;
          updateFormSteps();
        }
      });
    }

    multiStepForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // 1. Honeypot Anti-Spam Check
      const hpField = multiStepForm.querySelector('[name="website_url_check"]');
      if (hpField && hpField.value.trim() !== '') {
        console.warn('Spam submission detected by honeypot.');
        multiStepForm.reset();
        return;
      }

      // 2. Mandatory Phone Check
      const phoneInput = multiStepForm.querySelector('[name="your_phone"]');
      if (phoneInput && (!phoneInput.value || phoneInput.value.trim().length < 5)) {
        alert('Veuillez entrer un numéro de téléphone / WhatsApp valide.');
        phoneInput.focus();
        return;
      }

      // 3. Captcha Math Check
      const captchaInput = document.getElementById('captcha-answer-mesure');
      if (captchaInput && mesureExpectedSum !== null) {
        const userAns = parseInt(captchaInput.value.trim(), 10);
        if (userAns !== mesureExpectedSum) {
          alert('Vérification anti-spam incorrecte. Veuillez vérifier votre calcul mathématique.');
          captchaInput.focus();
          return;
        }
      }

      const formContainer = document.querySelector('.form-card-container');
      if (formContainer) {
        formContainer.innerHTML = `
          <div style="text-align: center; padding: 3rem 1rem;">
            <div style="width: 80px; height: 80px; background-color: var(--color-primary-light); color: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; margin: 0 auto 1.5rem auto;">
              <i class="fas fa-check"></i>
            </div>
            <h2 style="font-family: var(--font-heading); margin-bottom: 1rem; color: var(--color-dark);">Demande reçue avec succès !</h2>
            <p style="font-size: 1.1rem; color: var(--color-text-muted); max-width: 600px; margin: 0 auto 2rem auto;">
              Namasté ! Nous vous remercions pour votre demande de voyage sur mesure. Notre équipe d'experts en voyages en Inde et Népal étudie votre projet et vous recontactera sous 24h.
            </p>
            <a href="index.html" class="btn btn-primary">Retour à l'accueil</a>
          </div>
        `;
      }
    });

    updateFormSteps();
  }

  /* ------------------------------------------------------------------------
     4. STANDARD CONTACT FORM & ANTI-SPAM NOTIFICATION
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // 1. Honeypot Check
      const hpField = contactForm.querySelector('[name="website_url_check"]');
      if (hpField && hpField.value.trim() !== '') {
        console.warn('Spam submission blocked by honeypot.');
        contactForm.reset();
        return;
      }

      // 2. Mandatory Phone Check
      const phoneInput = contactForm.querySelector('[name="phone"]');
      if (phoneInput && (!phoneInput.value || phoneInput.value.trim().length < 5)) {
        alert('Veuillez entrer un numéro de téléphone / WhatsApp valide.');
        phoneInput.focus();
        return;
      }

      // 3. Math Captcha Verification
      const captchaInput = document.getElementById('captcha-answer');
      if (captchaInput && contactExpectedSum !== null) {
        const userAns = parseInt(captchaInput.value.trim(), 10);
        if (userAns !== contactExpectedSum) {
          alert('Vérification anti-spam incorrecte. Veuillez vérifier votre calcul.');
          captchaInput.focus();
          return;
        }
      }

      const successBox = document.getElementById('contact-success-msg');
      if (successBox) {
        successBox.style.display = 'flex';
        contactForm.reset();
        contactExpectedSum = setupAntiSpamCaptcha('math-num1', 'math-num2');
        setTimeout(() => {
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      } else {
        alert('Merci pour votre demande. Nous vous contacterons très prochainement.');
        contactForm.reset();
      }
    });
  }
});

