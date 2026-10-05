import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import AdminImageUpload from '../../components/AdminImageUpload';
import { fetchAdminReviews, updateReview, deleteReview, createAdminReview } from '../../services/api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    authorName: '',
    authorCity: 'France',
    tourTitle: 'Rajasthan Tour 14 Days',
    category: 'rajasthan',
    rating: 5,
    travelDate: 'January 2026',
    comment: '',
    status: 'approved'
  });

  const loadReviews = () => {
    setLoading(true);
    fetchAdminReviews({ status: filterStatus })
      .then((res) => {
        setReviews(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReviews();
  }, [filterStatus]);

  const handleStatusChange = async (id, status) => {
    try {
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
      await updateReview(id, { status });
      loadReviews();
    } catch (err) {
      console.error('Error changing review status:', err);
      alert(err.response?.data?.message || 'Error changing review status.');
      loadReviews();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      await deleteReview(id);
      loadReviews();
    } catch (err) {
      console.error('Error deleting review:', err);
      alert(err.response?.data?.message || 'Error deleting review.');
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    try {
      await createAdminReview(newReview);
      setIsModalOpen(false);
      setNewReview({
        authorName: '',
        authorCity: 'France',
        tourTitle: 'Rajasthan Tour 14 Days',
        category: 'rajasthan',
        rating: 5,
        travelDate: 'January 2026',
        comment: '',
        status: 'approved'
      });
      loadReviews();
    } catch (err) {
      alert('Error creating review.');
    }
  };

  return (
    <AdminLayout 
      title="Customer Reviews & Moderation" 
      subtitle="Approve, publish, or moderate testimonials left by travelers about their trip experiences."
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div className="admin-filter-bar" style={{ margin: 0 }}>
          <button className={`admin-filter-chip ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
            <i className="fas fa-list"></i>
            <span>All Reviews</span>
            {filterStatus === 'all' && <span className="admin-filter-count">{reviews.length}</span>}
          </button>
          <button className={`admin-filter-chip ${filterStatus === 'pending' ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
            <i className="fas fa-hourglass-half"></i>
            <span>Pending Approval</span>
          </button>
          <button className={`admin-filter-chip ${filterStatus === 'approved' ? 'active' : ''}`} onClick={() => setFilterStatus('approved')}>
            <i className="fas fa-check-circle"></i>
            <span>Published Online</span>
          </button>
        </div>

        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <i className="fas fa-plus"></i> Add Verified Review
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: 'var(--admin-primary)' }}></i>
          <p style={{ marginTop: '16px', color: 'var(--admin-text-muted)' }}>Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="admin-table-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <i className="fas fa-star-half-alt" style={{ fontSize: '3rem', color: '#CBD5E1', marginBottom: '16px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--admin-text-main)', margin: '0 0 8px' }}>No reviews in this status</h3>
          <p style={{ color: 'var(--admin-text-muted)', margin: '0 0 16px' }}>Reviews submitted by travelers will appear here for moderation.</p>
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <i className="fas fa-plus"></i> Write a Review
          </button>
        </div>
      ) : (
        <div className="admin-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Tour & Date</th>
                  <th>Rating</th>
                  <th>Review Comment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong style={{ color: 'var(--admin-text-main)' }}>{r.authorName}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                        <i className="fas fa-map-pin"></i> {r.authorCity || 'France'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--admin-navy)' }}>{r.tourTitle}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>{r.travelDate}</div>
                    </td>
                    <td>
                      <div style={{ color: '#F59E0B', display: 'flex', gap: '2px' }}>
                        {[...Array(r.rating || 5)].map((_, i) => (
                          <i key={i} className="fas fa-star" style={{ fontSize: '0.82rem' }}></i>
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: '340px', fontSize: '0.88rem', lineHeight: '1.5' }}>
                      <p style={{ margin: 0, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', color: '#334155' }}>
                        "{r.comment}"
                      </p>
                    </td>
                    <td>
                      <span className={`admin-status-badge ${r.status === 'approved' ? 'status-confirme' : (r.status === 'pending' ? 'status-nouveau' : 'status-annule')}`}>
                        {r.status === 'approved' ? <><i className="fas fa-check"></i> Published</> : (r.status === 'pending' ? <><i className="fas fa-clock"></i> Pending</> : <><i className="fas fa-ban"></i> Hidden</>)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {r.status !== 'approved' && (
                          <button className="btn btn-sm" style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }} onClick={() => handleStatusChange(r._id, 'approved')} title="Approve and publish online">
                            <i className="fas fa-check"></i> Publish
                          </button>
                        )}
                        {r.status !== 'rejected' && r.status !== 'pending' && (
                          <button className="btn btn-sm" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A' }} onClick={() => handleStatusChange(r._id, 'rejected')} title="Hide review">
                            <i className="fas fa-eye-slash"></i> Hide
                          </button>
                        )}
                        <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }} onClick={() => handleDelete(r._id)} title="Delete permanently">
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Review */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <form onSubmit={handleCreateReview} style={{ display: 'flex', flexDirection: 'column', height: '100%', margin: 0, overflow: 'hidden' }}>
              <div className="modal-header">
                <h3 className="modal-title">
                  <i className="fas fa-star" style={{ color: 'var(--admin-gold)' }}></i>
                  <span>Add Verified Traveler Review</span>
                </h3>
                <button type="button" className="modal-close" onClick={() => setIsModalOpen(false)} title="Close dialog">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600' }}>Traveler Name *</label>
                    <input type="text" required className="form-control" placeholder="e.g. John and Sarah Smith" value={newReview.authorName} onChange={(e) => setNewReview({ ...newReview, authorName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600' }}>City / Country</label>
                    <input type="text" className="form-control" placeholder="e.g. London, UK" value={newReview.authorCity} onChange={(e) => setNewReview({ ...newReview, authorCity: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600' }}>Tour Traveled</label>
                    <input type="text" className="form-control" placeholder="e.g. Rajasthan Highlights 14 Days" value={newReview.tourTitle} onChange={(e) => setNewReview({ ...newReview, tourTitle: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: '600' }}>Rating</label>
                    <select className="form-control" value={newReview.rating} onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}>
                      <option value="5">⭐⭐⭐⭐⭐ (5 / 5 - Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ (4 / 5 - Very Good)</option>
                      <option value="3">⭐⭐⭐ (3 / 5 - Average)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>Travel Date (e.g. February 2026)</label>
                  <input type="text" className="form-control" placeholder="e.g. February 2026" value={newReview.travelDate} onChange={(e) => setNewReview({ ...newReview, travelDate: e.target.value })} />
                </div>

                <AdminImageUpload
                  label="Review Photo / Traveler Avatar (Local Upload / Cloudinary)"
                  value={newReview.image || ''}
                  onChange={(url) => setNewReview({ ...newReview, image: url })}
                  placeholder="https://... or click 'Upload from Device'"
                />

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600' }}>Full Testimonial Comment *</label>
                  <textarea rows="4" required className="form-control" placeholder="Feedback on their experience with Jodhpur Voyage..." value={newReview.comment} onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-check"></i> Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReviews;
