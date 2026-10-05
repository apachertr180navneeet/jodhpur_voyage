import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { fetchSeoConfigs, updateSeoPageConfig, createSeoConfig } from '../../services/api';

const AdminSEO = () => {
  const [seoList, setSeoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeItem, setActiveItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    pageKey: '',
    pageName: '',
    customUrl: '',
    title: '',
    description: '',
    keywords: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: '',
    structuredData: ''
  });

  const loadSeoConfigs = () => {
    setLoading(true);
    fetchSeoConfigs()
      .then((res) => {
        setSeoList(res.data || []);
        if (res.data && res.data.length > 0 && !activeItem) {
          setActiveItem(res.data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching SEO configurations:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSeoConfigs();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        pageKey: item.pageKey || '',
        pageName: item.pageName || '',
        customUrl: item.customUrl || (item.pageKey ? `/${item.pageKey}` : ''),
        title: item.title || '',
        description: item.description || '',
        keywords: item.keywords || '',
        ogTitle: item.ogTitle || item.title || '',
        ogDescription: item.ogDescription || item.description || '',
        ogImage: item.ogImage || '',
        canonicalUrl: item.canonicalUrl || '',
        structuredData: item.structuredData || ''
      });
    } else {
      setFormData({
        pageKey: '',
        pageName: '',
        customUrl: '',
        title: '',
        description: '',
        keywords: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        canonicalUrl: '',
        structuredData: ''
      });
    }
    setIsModalOpen(true);
    setFeedback(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFeedback(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pageKey.trim() || !formData.title.trim() || !formData.description.trim()) {
      setFeedback({ type: 'error', message: 'Veuillez remplir la clé de page (Page Key), le Meta Title et la Meta Description.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const key = formData.pageKey.toLowerCase().trim();
      const existing = seoList.find((s) => s.pageKey === key);

      if (existing) {
        await updateSeoPageConfig(key, formData);
      } else {
        await createSeoConfig(formData);
      }

      setFeedback({ type: 'success', message: `Balises SEO enregistrées avec succès pour la page "${formData.pageName || key}" !` });
      
      // Refresh list
      const updatedList = await fetchSeoConfigs();
      setSeoList(updatedList.data || []);
      const updatedActive = updatedList.data.find((s) => s.pageKey === key);
      if (updatedActive) setActiveItem(updatedActive);

      setTimeout(() => {
        setIsModalOpen(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Erreur lors de l’enregistrement des balises SEO.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredList = seoList.filter((item) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.pageName?.toLowerCase().includes(q) ||
      item.pageKey?.toLowerCase().includes(q) ||
      item.title?.toLowerCase().includes(q) ||
      item.keywords?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <AdminLayout title="Gestion SEO & Meta Tags" subtitle="Configurez les balises Meta Title, Description, Mots-clés et OpenGraph pour chaque page.">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: 'var(--admin-primary)' }}></i>
          <p style={{ marginTop: '16px', color: 'var(--admin-text-muted)' }}>Chargement de la configuration SEO...</p>
        </div>
      </AdminLayout>
    );
  }

  const titleLen = formData.title ? formData.title.length : 0;
  const descLen = formData.description ? formData.description.length : 0;

  return (
    <AdminLayout
      title="Gestion SEO & Balises Meta Par Page"
      subtitle="Ajoutez et modifiez facilement le Meta Title, les Mots-clés (Meta Keywords) et la Meta Description de toutes les pages."
    >
      {/* Top Quick Actions Bar */}
      <div className="admin-action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 300px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}></i>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher une page par nom ou mot-clé..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{ paddingLeft: '36px', height: '42px', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal(null)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <i className="fas fa-plus-circle"></i> Ajouter les balises SEO d'une Nouvelle Page
        </button>
      </div>

      {/* Pages SEO Master Table */}
      <div className="admin-table-card" style={{ marginBottom: '30px' }}>
        <div className="admin-table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--admin-text-main)' }}>
            <i className="fas fa-search-location" style={{ color: 'var(--admin-primary)', marginRight: '8px' }}></i>
            Toutes les Pages du Site & Leur Statut SEO ({filteredList.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page Name / Identifiant</th>
                <th>Meta Title (Titre Google)</th>
                <th>Meta Keywords (Mots-clés)</th>
                <th>Meta Description (Aperçu)</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item) => {
                const isSelected = activeItem && activeItem.pageKey === item.pageKey;
                return (
                  <tr
                    key={item.pageKey}
                    style={{ background: isSelected ? '#F0FDF4' : 'transparent', cursor: 'pointer' }}
                    onClick={() => setActiveItem(item)}
                  >
                    <td>
                      <strong style={{ color: '#0F172A', display: 'block' }}>{item.pageName || item.pageKey}</strong>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                        <code style={{ fontSize: '0.78rem', color: 'var(--admin-primary)', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                          /{item.pageKey}
                        </code>
                        {item.customUrl && (
                          <code style={{ fontSize: '0.78rem', color: '#0284C7', background: '#E0F2FE', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            <i className="fas fa-link" style={{ fontSize: '0.7rem', marginRight: '3px' }}></i>
                            {item.customUrl}
                          </code>
                        )}
                      </div>
                    </td>
                    <td style={{ maxWidth: '240px', wordBreak: 'break-word', fontWeight: '500' }}>
                      {item.title ? (
                        <span>{item.title}</span>
                      ) : (
                        <span style={{ color: '#DC2626', fontStyle: 'italic' }}>Titre manquant</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '220px' }}>
                      {item.keywords ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {item.keywords.split(',').slice(0, 3).map((kw, i) => (
                            <span key={i} className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '2px 6px' }}>
                              {kw.trim()}
                            </span>
                          ))}
                          {item.keywords.split(',').length > 3 && (
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>+{item.keywords.split(',').length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#D97706', fontStyle: 'italic', fontSize: '0.82rem' }}>Mots-clés non renseignés</span>
                      )}
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#475569', fontSize: '0.85rem' }}>
                      {item.description || <span style={{ color: '#DC2626', fontStyle: 'italic' }}>Description manquante</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(item);
                        }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <i className="fas fa-edit"></i> Modifier SEO
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Page Live Google & Social Preview Card */}
      {activeItem && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Live Google Search Preview */}
          <div className="admin-table-card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fab fa-google" style={{ color: '#4285F4' }}></i> Aperçu du Résultat Google pour "{activeItem.pageName}"
            </h4>
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '8px', border: '1px solid #E2E8F0', fontFamily: 'Arial, sans-serif' }}>
              <div style={{ fontSize: '0.82rem', color: '#202124', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img src="/images/logo-transprent.png" alt="favicon" style={{ width: '16px', height: '16px' }} />
                <span>Jodhpur Voyage › {activeItem.pageKey}</span>
              </div>
              <div style={{ color: '#1a0dab', fontSize: '1.2rem', fontWeight: '400', lineHeight: 1.3, marginBottom: '4px' }}>
                {activeItem.title}
              </div>
              <div style={{ color: '#4d5156', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {activeItem.description}
              </div>
              <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #E2E8F0', fontSize: '0.78rem', color: '#64748B' }}>
                <strong>Mots-clés cibles :</strong> {activeItem.keywords || 'Aucun mot-clé renseigné'}
              </div>
            </div>
          </div>

          {/* Social Media Share Preview */}
          <div className="admin-table-card" style={{ padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px 0', fontSize: '0.95rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fab fa-whatsapp" style={{ color: '#25D366' }}></i> Carte de Partage Réseaux (WhatsApp / Facebook / LinkedIn)
            </h4>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <img
                src={activeItem.ogImage || '/images/dest-rajasthan.jpg'}
                alt="OG Preview"
                style={{ width: '100%', height: '180px', objectFit: 'cover' }}
              />
              <div style={{ padding: '14px 16px', background: '#F8FAFC' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  jodhpurvoyage.com
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A', marginTop: '2px' }}>
                  {activeItem.ogTitle || activeItem.title}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {activeItem.ogDescription || activeItem.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create SEO Modal */}
      {isModalOpen && (
        <div className="booking-modal-overlay active" onClick={(e) => e.target.classList.contains('booking-modal-overlay') && handleCloseModal()}>
          <div className="booking-modal" style={{ maxWidth: '680px', borderRadius: '16px' }}>
            <div className="booking-modal-header" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', color: '#fff', padding: '18px 24px' }}>
              <button className="modal-close-btn" onClick={handleCloseModal} aria-label="Fermer">
                <i className="fas fa-times"></i>
              </button>
              <h3 className="booking-modal-title" style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>
                <i className="fas fa-tags" style={{ color: 'var(--admin-gold)' }}></i>
                {formData.pageKey ? `Modifier les balises SEO — ${formData.pageName || formData.pageKey}` : 'Ajouter les Balises SEO d’une Page'}
              </h3>
            </div>

            <div className="booking-modal-body" style={{ padding: '24px', overflowY: 'auto', maxHeight: '78vh' }}>
              {feedback && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    background: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                    border: `1px solid ${feedback.type === 'success' ? '#16A34A' : '#DC2626'}`,
                    color: feedback.type === 'success' ? '#14532D' : '#991B1B',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                >
                  <i className={`fas ${feedback.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i> {feedback.message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* 1. Page Key & Name */}
                <div className="form-row-compact" style={{ marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      <i className="fas fa-key"></i> Clé de Page (Page Key) *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="pageKey"
                      placeholder="ex: home, tours, contact, voyage-sur-mesure"
                      value={formData.pageKey}
                      onChange={handleChange}
                      required
                    />
                    <small style={{ fontSize: '0.75rem', color: '#64748B' }}>Identifiant interne unique (ex: home, tours, contact)</small>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 600 }}>
                      <i className="fas fa-file-alt"></i> Nom Lisible de la Page *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="pageName"
                      placeholder="ex: Page d'Accueil, Circuits, Contact"
                      value={formData.pageName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Custom URL Path Field */}
                <div className="form-group" style={{ marginBottom: '16px', background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-link" style={{ color: '#0284C7' }}></i> Custom URL Path (Chemin d'URL Personnalisé)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="customUrl"
                    placeholder="ex: /mon-url-sur-mesure ou /circuits-prives"
                    value={formData.customUrl}
                    onChange={handleChange}
                    style={{ fontWeight: '600', color: '#0284C7' }}
                  />
                  <small style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px', display: 'block' }}>
                    Personnalisez le chemin d'accès d'URL direct pour cette page. Ex: <code>/voyage-sur-mesure</code> ou <code>/nos-circuits</code>
                  </small>
                </div>

                {/* 2. Meta Title */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                      <i className="fas fa-heading" style={{ color: 'var(--admin-primary)' }}></i> Meta Title (Titre de la Page) *
                    </label>
                    <span style={{ fontSize: '0.78rem', color: titleLen >= 40 && titleLen <= 60 ? '#16A34A' : '#D97706', fontWeight: 600 }}>
                      {titleLen} / 60 caractères {titleLen >= 40 && titleLen <= 60 ? '(Idéal)' : '(Conseillé : 40-60)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    placeholder="Saisissez le titre optimisé pour les moteurs de recherche..."
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* 3. Meta Keywords */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    <i className="fas fa-key" style={{ color: 'var(--admin-gold)' }}></i> Meta Keywords (Mots-clés SEO séparés par des virgules) *
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="keywords"
                    placeholder="voyage inde, circuit rajasthan, agence voyage inde, nepal voyage..."
                    value={formData.keywords}
                    onChange={handleChange}
                  />
                  <small style={{ fontSize: '0.75rem', color: '#64748B' }}>Saisissez vos mots-clés stratégiques séparés par une virgule (ex: voyage inde, circuit rajasthan)</small>
                </div>

                {/* 4. Meta Description */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label className="form-label" style={{ fontWeight: 600, margin: 0 }}>
                      <i className="fas fa-align-left" style={{ color: 'var(--admin-primary)' }}></i> Meta Description (Description SEO Google) *
                    </label>
                    <span style={{ fontSize: '0.78rem', color: descLen >= 120 && descLen <= 160 ? '#16A34A' : '#D97706', fontWeight: 600 }}>
                      {descLen} / 160 caractères {descLen >= 120 && descLen <= 160 ? '(Idéal)' : '(Conseillé : 120-160)'}
                    </span>
                  </div>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="3"
                    placeholder="Résumé attractif de la page affiché sous le titre dans les résultats Google..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                {/* 5. OpenGraph Image */}
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    <i className="fas fa-image"></i> Image de Partage Réseaux Sociaux (OG Image URL)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="ogImage"
                    placeholder="/images/dest-rajasthan.jpg"
                    value={formData.ogImage}
                    onChange={handleChange}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span><i className="fas fa-spinner fa-spin"></i> Enregistrement...</span>
                    ) : (
                      <span><i className="fas fa-save"></i> Enregistrer les Balises SEO</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSEO;
