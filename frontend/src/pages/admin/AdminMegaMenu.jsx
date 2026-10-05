import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { fetchMegaMenuConfig, updateMegaMenuConfig, resetMegaMenuConfig, uploadImage } from '../../services/api';

const AdminMegaMenu = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetchMegaMenuConfig();
      setConfig(res.data);
    } catch (err) {
      console.error('Error loading mega menu config:', err);
      showToast('Error loading Mega Menu configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateMegaMenuConfig(config);
      showToast('Mega Menu updated successfully!', 'success');
    } catch (err) {
      console.error('Error saving mega menu config:', err);
      showToast('Error saving Mega Menu changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset the Mega Menu to default settings?')) {
      return;
    }
    setSaving(true);
    try {
      const res = await resetMegaMenuConfig();
      setConfig(res.data?.data || res.data);
      showToast('Mega Menu reset to default settings!', 'info');
    } catch (err) {
      console.error('Error resetting config:', err);
      showToast('Error resetting Mega Menu', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Image Upload handler
  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;

    const fieldId = e.target.id || 'file';
    setUploadingField(fieldId);

    try {
      const res = await uploadImage(file);
      const url = res.data?.url || res.data?.secure_url || res.data?.path;
      if (url) {
        callback(url);
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast('Image upload failed', 'error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Error uploading image', 'error');
    } finally {
      setUploadingField(null);
    }
  };

  // Generic helper for updating nested object
  const updateNested = (section, field, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // About Menu Helpers
  const handleAboutItemChange = (index, field, value) => {
    setConfig(prev => {
      const newItems = [...(prev.aboutMenu?.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return {
        ...prev,
        aboutMenu: { ...prev.aboutMenu, items: newItems }
      };
    });
  };

  const addAboutItem = () => {
    setConfig(prev => ({
      ...prev,
      aboutMenu: {
        ...prev.aboutMenu,
        items: [
          ...(prev.aboutMenu?.items || []),
          {
            title: 'New Navigation Card',
            link: '/qui-sommes-nous',
            image: '/images/image-12.jpg',
            order: (prev.aboutMenu?.items?.length || 0) + 1
          }
        ]
      }
    }));
  };

  const removeAboutItem = (index) => {
    if (!window.confirm('Delete this navigation card?')) return;
    setConfig(prev => {
      const newItems = [...prev.aboutMenu.items];
      newItems.splice(index, 1);
      return {
        ...prev,
        aboutMenu: { ...prev.aboutMenu, items: newItems }
      };
    });
  };

  // Inspiration Menu Helpers
  const handleInspirationItemChange = (index, field, value) => {
    setConfig(prev => {
      const newItems = [...(prev.inspirationMenu?.items || [])];
      newItems[index] = { ...newItems[index], [field]: value };
      return {
        ...prev,
        inspirationMenu: { ...prev.inspirationMenu, items: newItems }
      };
    });
  };

  const addInspirationItem = () => {
    setConfig(prev => ({
      ...prev,
      inspirationMenu: {
        ...prev.inspirationMenu,
        items: [
          ...(prev.inspirationMenu?.items || []),
          {
            title: 'New Inspiration',
            link: '/voyage-sur-mesure',
            image: '/images/image-12.jpg',
            order: (prev.inspirationMenu?.items?.length || 0) + 1
          }
        ]
      }
    }));
  };

  const removeInspirationItem = (index) => {
    if (!window.confirm('Delete this inspiration card?')) return;
    setConfig(prev => {
      const newItems = [...prev.inspirationMenu.items];
      newItems.splice(index, 1);
      return {
        ...prev,
        inspirationMenu: { ...prev.inspirationMenu, items: newItems }
      };
    });
  };

  // Sur Mesure Helpers
  const handleSurMesureLinkChange = (index, field, value) => {
    setConfig(prev => {
      const newLinks = [...(prev.surMesureMenu?.links || [])];
      newLinks[index] = { ...newLinks[index], [field]: value };
      return {
        ...prev,
        surMesureMenu: { ...prev.surMesureMenu, links: newLinks }
      };
    });
  };

  const addSurMesureLink = () => {
    setConfig(prev => ({
      ...prev,
      surMesureMenu: {
        ...prev.surMesureMenu,
        links: [
          ...(prev.surMesureMenu?.links || []),
          { label: 'New Link', path: '/tours', icon: 'fas fa-chevron-right' }
        ]
      }
    }));
  };

  const removeSurMesureLink = (index) => {
    setConfig(prev => {
      const newLinks = [...prev.surMesureMenu.links];
      newLinks.splice(index, 1);
      return {
        ...prev,
        surMesureMenu: { ...prev.surMesureMenu, links: newLinks }
      };
    });
  };

  // Infos Pratiques Helpers
  const handleInfoColChange = (colIdx, field, value) => {
    setConfig(prev => {
      const newCols = [...(prev.infosMenu?.columns || [])];
      newCols[colIdx] = { ...newCols[colIdx], [field]: value };
      return {
        ...prev,
        infosMenu: { ...prev.infosMenu, columns: newCols }
      };
    });
  };

  const handleInfoSublinkChange = (colIdx, linkIdx, field, value) => {
    setConfig(prev => {
      const newCols = [...(prev.infosMenu?.columns || [])];
      const newLinks = [...newCols[colIdx].links];
      newLinks[linkIdx] = { ...newLinks[linkIdx], [field]: value };
      newCols[colIdx] = { ...newCols[colIdx], links: newLinks };
      return {
        ...prev,
        infosMenu: { ...prev.infosMenu, columns: newCols }
      };
    });
  };

  const addInfoSublink = (colIdx) => {
    setConfig(prev => {
      const newCols = [...(prev.infosMenu?.columns || [])];
      newCols[colIdx] = {
        ...newCols[colIdx],
        links: [
          ...(newCols[colIdx].links || []),
          { label: 'New Practical Link', path: '/infos-pratiques', icon: 'fas fa-check' }
        ]
      };
      return {
        ...prev,
        infosMenu: { ...prev.infosMenu, columns: newCols }
      };
    });
  };

  const removeInfoSublink = (colIdx, linkIdx) => {
    setConfig(prev => {
      const newCols = [...(prev.infosMenu?.columns || [])];
      const newLinks = [...newCols[colIdx].links];
      newLinks.splice(linkIdx, 1);
      newCols[colIdx] = { ...newCols[colIdx], links: newLinks };
      return {
        ...prev,
        infosMenu: { ...prev.infosMenu, columns: newCols }
      };
    });
  };

  if (loading || !config) {
    return (
      <AdminLayout title="Mega Menu CMS" subtitle="Management of navigation headers and dropdown mega menus">
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: '#0D9488' }}></i>
          <p style={{ marginTop: '16px', color: '#64748B', fontWeight: '500' }}>Loading Mega Menu CMS...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Mega Menu CMS" subtitle="Comprehensive editor for dropdown menus, banners, titles, badges, and links">
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '14px 22px',
          borderRadius: '8px',
          background: toast.type === 'error' ? '#EF4444' : toast.type === 'info' ? '#3B82F6' : '#10B981',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.95rem',
          fontWeight: '500',
          animation: 'fadeIn 0.3s ease'
        }}>
          <i className={toast.type === 'error' ? 'fas fa-exclamation-circle' : toast.type === 'info' ? 'fas fa-info-circle' : 'fas fa-check-circle'}></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FFFFFF',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #0D9488, #0F766E)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            <i className="fas fa-sitemap"></i>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0F172A' }}>Mega Menu Navigation Fields</h3>
            <span style={{ fontSize: '0.82rem', color: '#64748B' }}>All modifications reflect in real-time across the live website</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline btn-sm"
            style={{ borderColor: '#E2E8F0', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}
            disabled={saving}
          >
            <i className="fas fa-undo"></i> Reset to Default
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px', justifyContent: 'center' }}
            disabled={saving}
          >
            {saving ? (
              <>
                <i className="fas fa-circle-notch fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #E2E8F0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'about', label: '1. About Us', icon: 'fas fa-users' },
          { id: 'inspiration', label: '2. Inspiration', icon: 'fas fa-lightbulb' },
          { id: 'surmesure', label: '3. Custom Trips', icon: 'fas fa-sliders-h' },
          { id: 'infos', label: '4. Practical Info', icon: 'fas fa-info-circle' },
          { id: 'destinations', label: '5. Destinations', icon: 'fas fa-map-marked-alt' },
          { id: 'topbar', label: '6. Top Bar & Contact', icon: 'fas fa-phone-alt' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: activeTab === tab.id ? '#0D9488' : '#F1F5F9',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              borderRadius: '8px 8px 0 0',
              fontWeight: '600',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ABOUT US MEGA MENU */}
      {/* ========================================================================= */}
      {activeTab === 'about' && (
        <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          {/* Quick link to Page Designer CMS */}
          <div style={{
            background: 'linear-gradient(135deg, #F0FDFA, #E6FFFA)',
            border: '1px solid #99F6E4',
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#0D9488', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <i className="fas fa-palette"></i>
              </div>
              <div>
                <strong style={{ color: '#0F766E', fontSize: '0.96rem', display: 'block' }}>Design & Content for "About Us" Pages</strong>
                <span style={{ fontSize: '0.82rem', color: '#115E59' }}>
                  Edit the hero banner, company history text, founder photo & quote, and core commitment pillars.
                </span>
              </div>
            </div>
            <Link to="/admin/pages?page=qui-sommes-nous" className="btn btn-sm btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-edit"></i> Open Page CMS
            </Link>
          </div>

          <h4 style={{ margin: '0 0 16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-heading" style={{ color: '#0D9488' }}></i> Mega Menu Header & Slogan
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Primary Text (Left)</label>
              <input
                type="text"
                className="form-control"
                value={config.aboutMenu?.headerText || ''}
                onChange={(e) => updateNested('aboutMenu', 'headerText', e.target.value)}
                placeholder="e.g. CRAFTING UNFORGETTABLE"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Highlighted Text (Golden/Accent)</label>
              <input
                type="text"
                className="form-control"
                value={config.aboutMenu?.headerHighlight || ''}
                onChange={(e) => updateNested('aboutMenu', 'headerHighlight', e.target.value)}
                placeholder="e.g. JOURNEYS FOR 20+ YEARS"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-th-large" style={{ color: '#0D9488' }}></i> Menu Cards & Navigation Links ({config.aboutMenu?.items?.length || 0})
            </h4>
            <button
              type="button"
              onClick={addAboutItem}
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#0D9488', color: '#0D9488', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fas fa-plus"></i> Add Card
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {(config.aboutMenu?.items || []).map((item, idx) => (
              <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', background: '#F8FAFC', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => removeAboutItem(idx)}
                    title="Delete card"
                    style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0D9488', textTransform: 'uppercase' }}>Card #{idx + 1}</span>
                </div>

                {/* Image Preview & Upload */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#E2E8F0', marginBottom: '8px', position: 'relative' }}>
                    <img
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/images/slide4-300x176.jpg'; }}
                    />
                    {uploadingField === `about_file_${idx}` && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <i className="fas fa-circle-notch fa-spin"></i>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.82rem' }}
                      value={item.image || ''}
                      onChange={(e) => handleAboutItemChange(idx, 'image', e.target.value)}
                      placeholder="Image URL or path (/images/...)"
                    />
                    <label style={{
                      padding: '8px 12px',
                      background: '#0D9488',
                      color: '#ffffff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      <i className="fas fa-upload"></i>
                      <input
                        id={`about_file_${idx}`}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, (url) => handleAboutItemChange(idx, 'image', url))}
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Button Label</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.title || ''}
                    onChange={(e) => handleAboutItemChange(idx, 'title', e.target.value)}
                    placeholder="e.g. About Us"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Redirect Link (URL)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.link || ''}
                    onChange={(e) => handleAboutItemChange(idx, 'link', e.target.value)}
                    placeholder="e.g. /qui-sommes-nous"
                  />
                </div>

                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #CBD5E1' }}>
                  <Link
                    to={`/admin/pages?page=${(item.link || 'qui-sommes-nous').replace(/^\/+/, '').split('#')[0]}`}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.76rem', padding: '5px 10px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#0F766E', borderColor: '#99F6E4', background: '#F0FDFA', fontWeight: '600' }}
                  >
                    <i className="fas fa-edit"></i> Edit Page CMS Content
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INSPIRATION MEGA MENU */}
      {/* ========================================================================= */}
      {activeTab === 'inspiration' && (
        <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <h4 style={{ margin: '0 0 16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-heading" style={{ color: '#0D9488' }}></i> Inspirations Header & Slogan
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Primary Text</label>
              <input
                type="text"
                className="form-control"
                value={config.inspirationMenu?.headerText || ''}
                onChange={(e) => updateNested('inspirationMenu', 'headerText', e.target.value)}
                placeholder="e.g. TRAVEL ACCORDING TO"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Highlighted Text</label>
              <input
                type="text"
                className="form-control"
                value={config.inspirationMenu?.headerHighlight || ''}
                onChange={(e) => updateNested('inspirationMenu', 'headerHighlight', e.target.value)}
                placeholder="e.g. YOUR DREAMS"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-images" style={{ color: '#0D9488' }}></i> Inspiration Cards ({config.inspirationMenu?.items?.length || 0})
            </h4>
            <button
              type="button"
              onClick={addInspirationItem}
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#0D9488', color: '#0D9488', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fas fa-plus"></i> Add Inspiration
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {(config.inspirationMenu?.items || []).map((item, idx) => (
              <div key={idx} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', background: '#F8FAFC', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => removeInspirationItem(idx)}
                    title="Delete card"
                    style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0D9488', textTransform: 'uppercase' }}>Inspiration #{idx + 1}</span>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#E2E8F0', marginBottom: '8px', position: 'relative' }}>
                    <img
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/images/slide4-300x176.jpg'; }}
                    />
                    {uploadingField === `insp_file_${idx}` && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <i className="fas fa-circle-notch fa-spin"></i>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.82rem' }}
                      value={item.image || ''}
                      onChange={(e) => handleInspirationItemChange(idx, 'image', e.target.value)}
                      placeholder="Image URL or path"
                    />
                    <label style={{
                      padding: '8px 12px',
                      background: '#0D9488',
                      color: '#ffffff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}>
                      <i className="fas fa-upload"></i>
                      <input
                        id={`insp_file_${idx}`}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(e, (url) => handleInspirationItemChange(idx, 'image', url))}
                      />
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Inspiration Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.title || ''}
                    onChange={(e) => handleInspirationItemChange(idx, 'title', e.target.value)}
                    placeholder="e.g. Custom Trip"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Redirect Link (URL)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.link || ''}
                    onChange={(e) => handleInspirationItemChange(idx, 'link', e.target.value)}
                    placeholder="e.g. /voyage-sur-mesure"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CUSTOM TRIPS MEGA MENU */}
      {/* ========================================================================= */}
      {activeTab === 'surmesure' && (
        <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
            {/* Left Column: Title, Icon, Description & Links */}
            <div>
              <h4 style={{ margin: '0 0 16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-sliders-h" style={{ color: '#0D9488' }}></i> Left Column (Content & Links)
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Section Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.surMesureMenu?.title || ''}
                    onChange={(e) => updateNested('surMesureMenu', 'title', e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>FA Icon</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.surMesureMenu?.icon || 'fas fa-sliders-h'}
                    onChange={(e) => updateNested('surMesureMenu', 'icon', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Description Text</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={config.surMesureMenu?.description || ''}
                  onChange={(e) => updateNested('surMesureMenu', 'description', e.target.value)}
                />
              </div>

              {/* Sublinks */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h5 style={{ margin: 0, color: '#1E293B', fontSize: '0.92rem' }}>Quick Navigation Links</h5>
                <button
                  type="button"
                  onClick={addSurMesureLink}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  <i className="fas fa-plus"></i> Add Link
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(config.surMesureMenu?.links || []).map((link, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px 36px', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.82rem' }}
                      value={link.label || ''}
                      onChange={(e) => handleSurMesureLinkChange(idx, 'label', e.target.value)}
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.82rem' }}
                      value={link.path || ''}
                      onChange={(e) => handleSurMesureLinkChange(idx, 'path', e.target.value)}
                      placeholder="Path (/tours...)"
                    />
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.82rem' }}
                      value={link.icon || 'fas fa-chevron-right'}
                      onChange={(e) => handleSurMesureLinkChange(idx, 'icon', e.target.value)}
                      placeholder="Icon"
                    />
                    <button
                      type="button"
                      onClick={() => removeSurMesureLink(idx)}
                      style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', height: '36px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Featured Promo Card */}
            <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ margin: '0 0 16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-ad" style={{ color: '#D97706' }}></i> Featured Promo Banner / Card
              </h4>

              <div style={{ width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', background: '#CBD5E1', marginBottom: '12px', position: 'relative' }}>
                <img
                  src={config.surMesureMenu?.featuredCard?.image || '/images/jaipur-travel.jpg'}
                  alt="Featured Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {uploadingField === 'surmesure_featured_file' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <i className="fas fa-circle-notch fa-spin"></i>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  className="form-control"
                  style={{ fontSize: '0.82rem' }}
                  value={config.surMesureMenu?.featuredCard?.image || ''}
                  onChange={(e) => {
                    setConfig(prev => ({
                      ...prev,
                      surMesureMenu: {
                        ...prev.surMesureMenu,
                        featuredCard: { ...prev.surMesureMenu.featuredCard, image: e.target.value }
                      }
                    }));
                  }}
                  placeholder="Image URL / Path"
                />
                <label style={{
                  padding: '8px 12px',
                  background: '#0D9488',
                  color: '#ffffff',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <i className="fas fa-upload"></i>
                  <input
                    id="surmesure_featured_file"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, (url) => {
                      setConfig(prev => ({
                        ...prev,
                        surMesureMenu: {
                          ...prev.surMesureMenu,
                          featuredCard: { ...prev.surMesureMenu.featuredCard, image: url }
                        }
                      }));
                    })}
                  />
                </label>
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Badge Tag</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.surMesureMenu?.featuredCard?.tag || 'Exclusive Service'}
                  onChange={(e) => {
                    setConfig(prev => ({
                      ...prev,
                      surMesureMenu: {
                        ...prev.surMesureMenu,
                        featuredCard: { ...prev.surMesureMenu.featuredCard, tag: e.target.value }
                      }
                    }));
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '10px' }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Card Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.surMesureMenu?.featuredCard?.title || '100% Customized Itineraries'}
                  onChange={(e) => {
                    setConfig(prev => ({
                      ...prev,
                      surMesureMenu: {
                        ...prev.surMesureMenu,
                        featuredCard: { ...prev.surMesureMenu.featuredCard, title: e.target.value }
                      }
                    }));
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Button Text</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.surMesureMenu?.featuredCard?.buttonText || 'Start Planning'}
                    onChange={(e) => {
                      setConfig(prev => ({
                        ...prev,
                        surMesureMenu: {
                          ...prev.surMesureMenu,
                          featuredCard: { ...prev.surMesureMenu.featuredCard, buttonText: e.target.value }
                        }
                      }));
                    }}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: '600' }}>Button Link</label>
                  <input
                    type="text"
                    className="form-control"
                    value={config.surMesureMenu?.featuredCard?.buttonLink || '/voyage-sur-mesure'}
                    onChange={(e) => {
                      setConfig(prev => ({
                        ...prev,
                        surMesureMenu: {
                          ...prev.surMesureMenu,
                          featuredCard: { ...prev.surMesureMenu.featuredCard, buttonLink: e.target.value }
                        }
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PRACTICAL INFO MEGA MENU */}
      {/* ========================================================================= */}
      {activeTab === 'infos' && (
        <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <h4 style={{ margin: '0 0 20px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-info-circle" style={{ color: '#0D9488' }}></i> 3 Thematic Navigation Columns
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            {(config.infosMenu?.columns || []).map((col, cIdx) => (
              <div key={cIdx} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', background: '#F8FAFC' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '8px', marginBottom: '14px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '0.82rem' }}>Column #{cIdx + 1} Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={col.title || ''}
                      onChange={(e) => handleInfoColChange(cIdx, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontWeight: '600', fontSize: '0.82rem' }}>Icon</label>
                    <input
                      type="text"
                      className="form-control"
                      value={col.icon || 'fas fa-info-circle'}
                      onChange={(e) => handleInfoColChange(cIdx, 'icon', e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748B' }}>Sub-links ({col.links?.length || 0})</span>
                  <button
                    type="button"
                    onClick={() => addInfoSublink(cIdx)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                  >
                    <i className="fas fa-plus"></i> Add
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(col.links || []).map((lnk, lIdx) => (
                    <div key={lIdx} style={{ background: '#FFFFFF', padding: '8px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' }}>
                      <button
                        type="button"
                        onClick={() => removeInfoSublink(cIdx, lIdx)}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                      <input
                        type="text"
                        className="form-control"
                        style={{ fontSize: '0.8rem', paddingRight: '24px' }}
                        value={lnk.label || ''}
                        onChange={(e) => handleInfoSublinkChange(cIdx, lIdx, 'label', e.target.value)}
                        placeholder="Label"
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px', gap: '6px' }}>
                        <input
                          type="text"
                          className="form-control"
                          style={{ fontSize: '0.78rem' }}
                          value={lnk.path || ''}
                          onChange={(e) => handleInfoSublinkChange(cIdx, lIdx, 'path', e.target.value)}
                          placeholder="Link (/visa-inde-nepal)"
                        />
                        <input
                          type="text"
                          className="form-control"
                          style={{ fontSize: '0.78rem' }}
                          value={lnk.icon || 'fas fa-check'}
                          onChange={(e) => handleInfoSublinkChange(cIdx, lIdx, 'icon', e.target.value)}
                          placeholder="Icon"
                        />
                      </div>
                      <Link
                        to={`/admin/pages?page=${(lnk.path || 'visa-inde-nepal').replace(/^\/+/, '').split('#')[0]}`}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.74rem', padding: '4px 6px', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#0F766E', borderColor: '#99F6E4', background: '#F0FDFA', fontWeight: '600' }}
                      >
                        <i className="fas fa-edit"></i> Edit Page Content in CMS
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Help & Advisory Banner Card */}
          <div style={{ background: '#F0FDFA', border: '1px solid #CCFBF1', borderRadius: '12px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px', color: '#0F766E', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-headset"></i> Advisory & Support Card (Right Box)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Box Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.infosMenu?.helpCard?.title || 'Have questions?'}
                  onChange={(e) => {
                    setConfig(prev => ({
                      ...prev,
                      infosMenu: {
                        ...prev.infosMenu,
                        helpCard: { ...prev.infosMenu.helpCard, title: e.target.value }
                      }
                    }));
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Box Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.infosMenu?.helpCard?.description || 'Our travel experts are here to answer all your inquiries.'}
                  onChange={(e) => {
                    setConfig(prev => ({
                      ...prev,
                      infosMenu: {
                        ...prev.infosMenu,
                        helpCard: { ...prev.infosMenu.helpCard, description: e.target.value }
                      }
                    }));
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Button Text</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.infosMenu?.helpCard?.buttonText || 'Contact Us'}
                  onChange={(e) => {
                    setConfig(prev => ({
                      ...prev,
                      infosMenu: {
                        ...prev.infosMenu,
                        helpCard: { ...prev.infosMenu.helpCard, buttonText: e.target.value }
                      }
                    }));
                  }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Button Link</label>
                <input
                  type="text"
                  className="form-control"
                  value={config.infosMenu?.helpCard?.buttonLink || '/contact'}
                  onChange={(e) => {
                    setConfig(prev => ({
                      ...prev,
                      infosMenu: {
                        ...prev.infosMenu,
                        helpCard: { ...prev.infosMenu.helpCard, buttonLink: e.target.value }
                      }
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DESTINATIONS MEGA MENU */}
      {/* ========================================================================= */}
      {activeTab === 'destinations' && (
        <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <h4 style={{ margin: '0 0 16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-map-marked-alt" style={{ color: '#0D9488' }}></i> Destinations Mega Menu
          </h4>

          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', marginBottom: '24px', border: '1px solid #E2E8F0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.destinationsMenu?.useDynamicFromDb !== false}
                onChange={(e) => {
                  setConfig(prev => ({
                    ...prev,
                    destinationsMenu: {
                      ...prev.destinationsMenu,
                      useDynamicFromDb: e.target.checked
                    }
                  }));
                }}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>Automatic Dynamic Feed from Database (Recommended)</strong>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>
                  Automatically displays the 4 regional columns (North India, South India, Nepal, Bhutan) populated with all published destinations.
                </p>
              </div>
            </label>
          </div>

          {/* Featured Side Card */}
          <div style={{ background: '#F8FAFC', padding: '20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ margin: '0 0 16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-star" style={{ color: '#F59E0B' }}></i> Featured Side Card (e.g. Incontournable Rajasthan)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
              <div>
                <div style={{ width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', background: '#CBD5E1', marginBottom: '8px', position: 'relative' }}>
                  <img
                    src={config.destinationsMenu?.featuredCard?.image || '/images/Voyage-Jaisalmer.jpg'}
                    alt="Featured Card Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {uploadingField === 'dest_featured_file' && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <i className="fas fa-circle-notch fa-spin"></i>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ fontSize: '0.8rem' }}
                    value={config.destinationsMenu?.featuredCard?.image || ''}
                    onChange={(e) => {
                      setConfig(prev => ({
                        ...prev,
                        destinationsMenu: {
                          ...prev.destinationsMenu,
                          featuredCard: { ...prev.destinationsMenu.featuredCard, image: e.target.value }
                        }
                      }));
                    }}
                    placeholder="Image URL"
                  />
                  <label style={{
                    padding: '8px 10px',
                    background: '#0D9488',
                    color: '#ffffff',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}>
                    <i className="fas fa-upload"></i>
                    <input
                      id="dest_featured_file"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileUpload(e, (url) => {
                        setConfig(prev => ({
                          ...prev,
                          destinationsMenu: {
                            ...prev.destinationsMenu,
                            featuredCard: { ...prev.destinationsMenu.featuredCard, image: url }
                          }
                        }));
                      })}
                    />
                  </label>
                </div>
              </div>

              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Badge Tag</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.destinationsMenu?.featuredCard?.tag || 'Must-Visit'}
                      onChange={(e) => {
                        setConfig(prev => ({
                          ...prev,
                          destinationsMenu: {
                            ...prev.destinationsMenu,
                            featuredCard: { ...prev.destinationsMenu.featuredCard, tag: e.target.value }
                          }
                        }));
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.destinationsMenu?.featuredCard?.title || 'Golden Rajasthan'}
                      onChange={(e) => {
                        setConfig(prev => ({
                          ...prev,
                          destinationsMenu: {
                            ...prev.destinationsMenu,
                            featuredCard: { ...prev.destinationsMenu.featuredCard, title: e.target.value }
                          }
                        }));
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Button Text</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.destinationsMenu?.featuredCard?.buttonText || 'Explore'}
                      onChange={(e) => {
                        setConfig(prev => ({
                          ...prev,
                          destinationsMenu: {
                            ...prev.destinationsMenu,
                            featuredCard: { ...prev.destinationsMenu.featuredCard, buttonText: e.target.value }
                          }
                        }));
                      }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Button Link</label>
                    <input
                      type="text"
                      className="form-control"
                      value={config.destinationsMenu?.featuredCard?.buttonLink || '/destination-rajasthan.html'}
                      onChange={(e) => {
                        setConfig(prev => ({
                          ...prev,
                          destinationsMenu: {
                            ...prev.destinationsMenu,
                            featuredCard: { ...prev.destinationsMenu.featuredCard, buttonLink: e.target.value }
                          }
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: TOP BAR & CONTACT */}
      {/* ========================================================================= */}
      {activeTab === 'topbar' && (
        <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
          <h4 style={{ margin: '0 0 16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-phone-alt" style={{ color: '#0D9488' }}></i> Top Header Contact Information
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Displayed Contact Email</label>
              <input
                type="email"
                className="form-control"
                value={config.topBar?.email || ''}
                onChange={(e) => updateNested('topBar', 'email', e.target.value)}
                placeholder="Info@jodhpurvoyage.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Phone / WhatsApp Number</label>
              <input
                type="text"
                className="form-control"
                value={config.topBar?.phone || ''}
                onChange={(e) => updateNested('topBar', 'phone', e.target.value)}
                placeholder="+91-96 50 69 86 69"
              />
            </div>
          </div>

          <h4 style={{ margin: '0 0 16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-bullhorn" style={{ color: '#0D9488' }}></i> Top Announcement Bar
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Prefix</label>
              <input
                type="text"
                className="form-control"
                value={config.topBar?.announcementPrefix || ''}
                onChange={(e) => updateNested('topBar', 'announcementPrefix', e.target.value)}
                placeholder="Travel with confidence :"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Announcement Text</label>
              <input
                type="text"
                className="form-control"
                value={config.topBar?.announcementText || ''}
                onChange={(e) => updateNested('topBar', 'announcementText', e.target.value)}
                placeholder="free quotes & customized advice"
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Announcement Link</label>
              <input
                type="text"
                className="form-control"
                value={config.topBar?.announcementLink || ''}
                onChange={(e) => updateNested('topBar', 'announcementLink', e.target.value)}
                placeholder="/voyage-sur-mesure"
              />
            </div>
          </div>

          <h4 style={{ margin: '0 0 16px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-share-alt" style={{ color: '#0D9488' }}></i> Social Media & Review Links
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>TripAdvisor Link</label>
              <input
                type="url"
                className="form-control"
                value={config.topBar?.tripAdvisorUrl || ''}
                onChange={(e) => updateNested('topBar', 'tripAdvisorUrl', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Trustpilot Link</label>
              <input
                type="url"
                className="form-control"
                value={config.topBar?.trustpilotUrl || ''}
                onChange={(e) => updateNested('topBar', 'trustpilotUrl', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Google Reviews Link</label>
              <input
                type="url"
                className="form-control"
                value={config.topBar?.googleReviewsUrl || ''}
                onChange={(e) => updateNested('topBar', 'googleReviewsUrl', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Facebook Link</label>
              <input
                type="url"
                className="form-control"
                value={config.topBar?.facebookUrl || ''}
                onChange={(e) => updateNested('topBar', 'facebookUrl', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Instagram Link</label>
              <input
                type="url"
                className="form-control"
                value={config.topBar?.instagramUrl || ''}
                onChange={(e) => updateNested('topBar', 'instagramUrl', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.82rem', fontWeight: '600' }}>Twitter / X Link</label>
              <input
                type="url"
                className="form-control"
                value={config.topBar?.twitterUrl || ''}
                onChange={(e) => updateNested('topBar', 'twitterUrl', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Button */}
      <div style={{
        marginTop: '24px',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px'
      }}>
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary"
          style={{ minWidth: '200px', height: '44px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          disabled={saving}
        >
          {saving ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i> Saving changes...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle"></i> Save All Changes
            </>
          )}
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminMegaMenu;
