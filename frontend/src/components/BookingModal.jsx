import React, { useState, useEffect } from 'react';
import { createBooking } from '../services/api';

const BookingModal = ({ isOpen, onClose, tour = null, tourTitle = '', tourDuration = '' }) => {
  const [formData, setFormData] = useState({
    civility: 'M.',
    first_name: '',
    last_name: '',
    address: '',
    email: '',
    departure_date: '',
    country: 'FRANCE',
    phone: '',
    adults_count: 2,
    children_count: 0,
    babies_count: 0,
    date_flexibility: 'Dates exactes',
    departure_city: 'Paris',
    comments: '',
    captcha_answer: ''
  });

  const [captcha, setCaptcha] = useState({ num1: 6, num2: 4 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const effectiveTitle = (typeof tour === 'object' && tour ? tour.title : tour) || tourTitle || 'Circuit sur Mesure';
  const effectiveDuration = (typeof tour === 'object' && tour ? tour.duration : '') || tourDuration || '';
  const effectiveSlug = typeof tour === 'object' && tour ? tour.slug : '';

  useEffect(() => {
    if (isOpen) {
      const n1 = Math.floor(Math.random() * 6) + 2;
      const n2 = Math.floor(Math.random() * 5) + 1;
      setCaptcha({ num1: n1, num2: n2 });
      setFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const totalTravelers =
    Number(formData.adults_count || 0) +
    Number(formData.children_count || 0) +
    Number(formData.babies_count || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate required fields
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez renseigner votre Prénom et Nom.' });
      const el = document.getElementById('package-booking-form');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFeedback({ type: 'error', message: 'Veuillez saisir une adresse email valide.' });
      return;
    }

    if (!formData.phone.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez saisir votre numéro de téléphone (pour WhatsApp ou appel).' });
      return;
    }

    // 2. Anti-spam check
    if (Number(formData.captcha_answer) !== captcha.num1 + captcha.num2) {
      setFeedback({ 
        type: 'error', 
        message: `Calcul anti-spam incorrect : ${captcha.num1} + ${captcha.num2} = ${captcha.num1 + captcha.num2}. Veuillez corriger.` 
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const fullClientName = `${formData.civility} ${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();

    try {
      await createBooking({
        fullName: fullClientName,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        client: {
          civility: formData.civility,
          firstName: formData.first_name.trim(),
          lastName: formData.last_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          country: formData.country,
          departureCity: formData.departure_city
        },
        tourTitle: effectiveTitle,
        tourSlug: effectiveSlug,
        departureDate: formData.departure_date,
        dateFlexibility: formData.date_flexibility,
        adultsCount: Number(formData.adults_count || 2),
        childrenCount: Number(formData.children_count || 0),
        babiesCount: Number(formData.babies_count || 0),
        totalTravelers,
        notes: formData.comments,
        specialRequests: formData.comments,
        bookingType: 'tour_quote',
        status: 'nouveau'
      });

      setFeedback({
        type: 'success',
        message: 'Votre demande de devis a été enregistrée avec succès ! Notre équipe locale francophone vous répondra sous 24h.'
      });

      // Clear form
      setFormData({
        civility: 'M.',
        first_name: '',
        last_name: '',
        address: '',
        email: '',
        departure_date: '',
        country: 'FRANCE',
        phone: '',
        adults_count: 2,
        children_count: 0,
        babies_count: 0,
        date_flexibility: 'Dates exactes',
        departure_city: 'Paris',
        comments: '',
        captcha_answer: ''
      });

      setTimeout(() => {
        onClose();
      }, 3500);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Une erreur est survenue lors de l\'envoi. Veuillez vérifier vos données.';
      setFeedback({
        type: 'error',
        message: msg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`booking-modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target.classList.contains('booking-modal-overlay') && onClose()}>
      <div className="booking-modal" role="dialog" aria-labelledby="modalTitle">
        <div className="booking-modal-header">
          <button className="modal-close-btn" onClick={onClose} aria-label="Fermer">
            <i className="fas fa-times"></i>
          </button>
          <h3 className="booking-modal-title" id="modalTitle">
            <i className="fas fa-paper-plane"></i> Votre Voyage – Demande de Devis
          </h3>
          <div className="selected-tour-badge" id="modalSelectedTourBadge">
            <i className="fas fa-map-marked-alt"></i> <span>{effectiveTitle} {effectiveDuration ? `(${effectiveDuration})` : ''}</span>
          </div>
        </div>

        <div className="booking-modal-body">
          {feedback && (
            <div 
              className={`toast-notification ${feedback.type}`} 
              style={{ 
                position: 'static', 
                marginBottom: '16px', 
                width: '100%',
                padding: '14px 18px',
                borderRadius: '8px',
                background: feedback.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                border: `1px solid ${feedback.type === 'success' ? '#10B981' : '#EF4444'}`,
                color: feedback.type === 'success' ? '#065F46' : '#991B1B',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.92rem',
                fontWeight: 600
              }}
            >
              <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`} style={{ fontSize: '1.2rem' }}></i>
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} id="package-booking-form">
            {/* Row 1: Civility & First Name */}
            <div className="form-row-compact">
              <div className="form-group">
                <label className="form-label">Civilité / Title *</label>
                <select className="form-control" name="civility" value={formData.civility} onChange={handleChange} required>
                  <option value="M.">M. / Mr</option>
                  <option value="Mme">Mme / Mrs</option>
                  <option value="Mlle">Mlle / Ms</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Prénom / First name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  placeholder="Votre prénom"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 2: Name & Address */}
            <div className="form-row-compact">
              <div className="form-group">
                <label className="form-label">Nom / Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  placeholder="Votre nom"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Adresse / Address (optionnel)</label>
                <input
                  type="text"
                  className="form-control"
                  name="address"
                  placeholder="Ville / Adresse"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 3: E-mail & Departure Date */}
            <div className="form-row-compact">
              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="votre.email@domaine.fr"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date de départ estimée</label>
                <input
                  type="date"
                  className="form-control"
                  name="departure_date"
                  value={formData.departure_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Row 4: Country & Phone */}
            <div className="form-row-compact">
              <div className="form-group">
                <label className="form-label">Pays / Country</label>
                <select className="form-control" name="country" value={formData.country} onChange={handleChange}>
                  <option value="FRANCE">FRANCE</option>
                  <option value="BELGIQUE">BELGIQUE</option>
                  <option value="SUISSE">SUISSE</option>
                  <option value="CANADA">CANADA</option>
                  <option value="LUXEMBOURG">LUXEMBOURG</option>
                  <option value="AUTRE">AUTRE</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone / Phone *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="phone"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 5: Travelers Count (Adults, Children, Babies, Total) */}
            <div className="form-group">
              <label className="form-label">Nombre de voyageurs</label>
              <div className="travelers-grid-4col">
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Adultes</label>
                  <select className="form-control select-travelers-calc" name="adults_count" value={formData.adults_count} onChange={handleChange}>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10+</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Enfants (2-11 ans)</label>
                  <select className="form-control select-travelers-calc" name="children_count" value={formData.children_count} onChange={handleChange}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Bébés (&lt;2 ans)</label>
                  <select className="form-control select-travelers-calc" name="babies_count" value={formData.babies_count} onChange={handleChange}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3+</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Total</label>
                  <input
                    type="text"
                    className="form-control"
                    name="travelers_total"
                    value={totalTravelers}
                    readOnly
                    style={{ backgroundColor: 'var(--color-cream)', fontWeight: 700, textAlign: 'center' }}
                  />
                </div>
              </div>
            </div>

            {/* Row 6: Flexibilité & Ville de départ */}
            <div className="form-row-compact">
              <div className="form-group">
                <label className="form-label">Flexibilité des dates</label>
                <select className="form-control" name="date_flexibility" value={formData.date_flexibility} onChange={handleChange}>
                  <option value="Dates exactes">Dates exactes</option>
                  <option value="± 3 jours">± 3 jours</option>
                  <option value="± 7 jours">± 7 jours</option>
                  <option value="± 15 jours">± 15 jours</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ville de départ</label>
                <select className="form-control" name="departure_city" value={formData.departure_city} onChange={handleChange}>
                  <option value="Paris">Paris</option>
                  <option value="Lyon">Lyon</option>
                  <option value="Marseille">Marseille</option>
                  <option value="Nice">Nice</option>
                  <option value="Toulouse">Toulouse</option>
                  <option value="Bordeaux">Bordeaux</option>
                  <option value="Nantes">Nantes</option>
                  <option value="Strasbourg">Strasbourg</option>
                  <option value="Bruxelles">Bruxelles</option>
                  <option value="Genève">Genève</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Row 7: Comments */}
            <div className="form-group">
              <label className="form-label">Comments / Commentaires ou souhaits particuliers</label>
              <textarea
                className="form-control"
                name="comments"
                rows="3"
                placeholder="Décrivez votre projet, vos attentes, souhaits d'hôtels..."
                value={formData.comments}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Anti-Spam Captcha */}
            <div className="form-group spam-verify-group">
              <label className="form-label">
                <i className="fas fa-shield-alt"></i> Protection Anti-Spam : Combien font <span>{captcha.num1}</span> + <span>{captcha.num2}</span> ? *
              </label>
              <input
                type="number"
                className="form-control"
                name="captcha_answer"
                placeholder="Entrez le résultat"
                value={formData.captcha_answer}
                onChange={handleChange}
                required
              />
            </div>

            {feedback && feedback.type === 'error' && (
              <div style={{ color: '#DC2626', fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>
                <i className="fas fa-exclamation-circle"></i> {feedback.message}
              </div>
            )}

            <button type="submit" className="modal-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <span><i className="fas fa-spinner fa-spin"></i> Envoi en cours...</span>
              ) : (
                <span>Envoyer ma demande de réservation <i className="fas fa-paper-plane"></i></span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
