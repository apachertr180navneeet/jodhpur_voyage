import React, { useState } from 'react';
import { submitPublicReview } from '../services/api';

const ReviewModal = ({ isOpen, onClose, onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    authorName: '',
    authorCity: '',
    tourTitle: 'Voyage au Rajasthan 14 Jours',
    category: 'rajasthan',
    rating: 5,
    travelDate: '',
    comment: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await submitPublicReview(formData);
      setSuccessMsg(res.data.message || 'Merci pour votre avis ! Il sera visible après validation.');
      if (onReviewSubmitted) onReviewSubmitted();
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Erreur lors de l’enregistrement de votre avis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title"><i className="fas fa-star" style={{ color: 'var(--gold-color)' }}></i> Laisser un Témoignage</h3>
          <button className="modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>

        <div className="modal-body">
          {successMsg ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#15803d' }}>
              <i className="fas fa-check-circle" style={{ fontSize: '3rem', marginBottom: '16px' }}></i>
              <h4>Avis enregistré avec succès !</h4>
              <p>{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Votre nom & prénom *</label>
                  <input type="text" name="authorName" required className="form-control" placeholder="ex: Michel & Claire" value={formData.authorName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ville / Région *</label>
                  <input type="text" name="authorCity" required className="form-control" placeholder="ex: Lyon, France" value={formData.authorCity} onChange={handleChange} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Circuit réalisé</label>
                  <input type="text" name="tourTitle" className="form-control" placeholder="ex: Circuit Rajasthan 14 Jours" value={formData.tourTitle} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Région</label>
                  <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                    <option value="rajasthan">Rajasthan</option>
                    <option value="inde-du-nord">Inde du Nord / Varanasi</option>
                    <option value="ladakh">Ladakh & Himalaya</option>
                    <option value="inde-du-sud">Inde du Sud & Kerala</option>
                    <option value="gujarat">Gujarat & Népal</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Période du voyage</label>
                  <input type="text" name="travelDate" className="form-control" placeholder="ex: Janvier 2026" value={formData.travelDate} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Note globale (sur 5 étoiles)</label>
                  <select name="rating" className="form-control" value={formData.rating} onChange={handleChange}>
                    <option value="5">⭐⭐⭐⭐⭐ (5/5) Exceptionnel</option>
                    <option value="4">⭐⭐⭐⭐ (4/5) Très Bien</option>
                    <option value="3">⭐⭐⭐ (3/5) Bien</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Votre avis détaillé *</label>
                <textarea name="comment" required rows="4" className="form-control" placeholder="Partagez votre expérience avec notre chauffeur, l’accueil, les hôtels et le voyage..." value={formData.comment} onChange={handleChange}></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check"></i> Publier mon avis</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
