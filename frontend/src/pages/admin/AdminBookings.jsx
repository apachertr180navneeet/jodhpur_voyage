import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { fetchBookings, updateBookingStatus, deleteBooking } from '../../services/api';

const STATUS_OPTIONS = [
  { key: 'all', label: 'All Requests', icon: 'fas fa-list' },
  { key: 'nouveau', label: 'New (Pending)', icon: 'fas fa-clock', badgeClass: 'status-nouveau' },
  { key: 'contacte', label: 'Contacted', icon: 'fas fa-phone-alt', badgeClass: 'status-contacte' },
  { key: 'devis_envoye', label: 'Quote Sent', icon: 'fas fa-paper-plane', badgeClass: 'status-devis_envoye' },
  { key: 'confirme', label: 'Confirmed / Booked', icon: 'fas fa-check-circle', badgeClass: 'status-confirme' },
  { key: 'annule', label: 'Cancelled', icon: 'fas fa-times-circle', badgeClass: 'status-annule' }
];

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadBookings = () => {
    setLoading(true);
    fetchBookings({ status: filterStatus })
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadBookings();
  }, [filterStatus]);

  const handleOpenDetail = (booking) => {
    setSelectedBooking(booking);
    setStatusUpdate(booking.status);
    setAdminNotes(booking.adminNotes || '');
  };

  const handleSaveStatus = async () => {
    if (!selectedBooking) return;
    setIsUpdating(true);
    try {
      await updateBookingStatus(selectedBooking._id, {
        status: statusUpdate,
        adminNotes: adminNotes
      });
      loadBookings();
      setSelectedBooking(null);
    } catch (err) {
      alert('Error updating request status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this quote request?')) return;
    try {
      await deleteBooking(id);
      loadBookings();
      if (selectedBooking?._id === id) setSelectedBooking(null);
    } catch (err) {
      alert('Error deleting request.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'nouveau':
        return <span className="admin-status-badge status-nouveau"><i className="fas fa-clock"></i> New</span>;
      case 'contacte':
        return <span className="admin-status-badge status-contacte"><i className="fas fa-phone-alt"></i> Contacted</span>;
      case 'devis_envoye':
        return <span className="admin-status-badge status-devis_envoye"><i className="fas fa-paper-plane"></i> Quote Sent</span>;
      case 'confirme':
        return <span className="admin-status-badge status-confirme"><i className="fas fa-check-circle"></i> Confirmed</span>;
      case 'annule':
        return <span className="admin-status-badge status-annule"><i className="fas fa-times-circle"></i> Cancelled</span>;
      default:
        return <span className="admin-status-badge">{status}</span>;
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      b.fullName?.toLowerCase().includes(term) ||
      b.email?.toLowerCase().includes(term) ||
      b.phone?.toLowerCase().includes(term) ||
      b.tourTitle?.toLowerCase().includes(term)
    );
  });

  return (
    <AdminLayout 
      title="Quote Requests & Custom Trips" 
      subtitle="Manage all incoming tour bookings, custom travel inquiries, and customer communication."
    >
      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div className="admin-filter-bar" style={{ margin: 0 }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilterStatus(opt.key)}
              className={`admin-filter-chip ${filterStatus === opt.key ? 'active' : ''}`}
            >
              <i className={opt.icon}></i>
              <span>{opt.label}</span>
              {filterStatus === opt.key && (
                <span className="admin-filter-count">{bookings.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }}></i>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Search by customer, email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '34px', fontSize: '0.88rem', height: '38px', borderRadius: '8px' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: 'var(--admin-primary)' }}></i>
          <p style={{ marginTop: '16px', color: 'var(--admin-text-muted)' }}>Loading requests...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="admin-table-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: '#CBD5E1', marginBottom: '16px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--admin-text-main)', margin: '0 0 8px' }}>No requests found</h3>
          <p style={{ color: 'var(--admin-text-muted)', margin: 0 }}>All newly submitted travel quote requests will appear here.</p>
        </div>
      ) : (
        <div className="admin-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Itinerary / Inquiry</th>
                  <th>Dates & Duration</th>
                  <th>Travelers</th>
                  <th>Status</th>
                  <th>Received Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong style={{ color: 'var(--admin-text-main)' }}>{b.fullName}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                        <i className="fas fa-envelope"></i> {b.email}
                      </div>
                      {b.phone && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)' }}>
                          <i className="fab fa-whatsapp" style={{ color: '#16A34A' }}></i> {b.phone}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--admin-navy)' }}>
                        {b.tourTitle || b.destinations?.join(', ') || 'Custom Tailor-Made Trip'}
                      </span>
                      {b.accommodationType && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>
                          Hotel: {b.accommodationType}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{b.departureDate || 'Flexible dates'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>{b.durationDays || 'Unspecified duration'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '500' }}>{b.adultsCount} adult(s)</span>
                      {b.childrenCount > 0 && <span style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)' }}>, {b.childrenCount} child.</span>}
                    </td>
                    <td>{getStatusBadge(b.status)}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                      {new Date(b.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => handleOpenDetail(b)} title="View and edit">
                          <i className="fas fa-eye"></i> Details
                        </button>
                        <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }} onClick={() => handleDelete(b._id)} title="Delete">
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

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            {/* Modal Header (Sticky) */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <h3 className="modal-title">
                  <i className="fas fa-file-invoice" style={{ color: 'var(--admin-primary)' }}></i>
                  <span>Quote Request #{selectedBooking._id?.slice(-6).toUpperCase()}</span>
                </h3>
                {getStatusBadge(statusUpdate || selectedBooking.status)}
              </div>
              <button className="modal-close" onClick={() => setSelectedBooking(null)} title="Close dialog">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Customer Information Card */}
              <div style={{ background: '#F8FAFC', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #0F766E, #0D9488)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: '700', flexShrink: 0 }}>
                    {selectedBooking.fullName ? selectedBooking.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--admin-text-main)', fontSize: '1.15rem', fontWeight: '700' }}>
                      {selectedBooking.fullName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                      Received on {new Date(selectedBooking.createdAt).toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-envelope" style={{ color: '#0D9488', width: '16px' }}></i>
                    <strong style={{ color: '#475569' }}>Email:</strong>
                    <a href={`mailto:${selectedBooking.email}`} style={{ color: 'var(--admin-primary)', fontWeight: '600', textDecoration: 'none' }}>
                      {selectedBooking.email}
                    </a>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-phone-alt" style={{ color: '#0D9488', width: '16px' }}></i>
                    <strong style={{ color: '#475569' }}>Phone:</strong>
                    {selectedBooking.phone ? (
                      <a 
                        href={`https://wa.me/${selectedBooking.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: '#16A34A', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <i className="fab fa-whatsapp"></i> {selectedBooking.phone}
                      </a>
                    ) : (
                      <span style={{ color: 'var(--admin-text-muted)' }}>Not provided</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-globe-americas" style={{ color: '#0D9488', width: '16px' }}></i>
                    <strong style={{ color: '#475569' }}>Country:</strong>
                    <span>{selectedBooking.country || 'France'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fas fa-comments" style={{ color: '#0D9488', width: '16px' }}></i>
                    <strong style={{ color: '#475569' }}>Preferred Contact:</strong>
                    <span style={{ textTransform: 'capitalize' }}>{selectedBooking.preferredContact || 'Email / WhatsApp'}</span>
                  </div>
                </div>
              </div>

              {/* Trip Specifications Grid */}
              <div style={{ background: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <h5 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--admin-text-muted)', fontWeight: '700' }}>
                  Trip & Itinerary Specifications
                </h5>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.88rem' }}>
                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Trip Category</div>
                    <strong style={{ color: 'var(--admin-navy)' }}>
                      {selectedBooking.bookingType === 'custom_trip' ? '✨ Custom Tailor-Made Trip' : '🧭 Predefined Tour Package'}
                    </strong>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Destination / Circuit</div>
                    <strong style={{ color: 'var(--admin-primary)' }}>
                      {selectedBooking.tourTitle || selectedBooking.destinations?.join(', ') || 'Tailor-made Itinerary'}
                    </strong>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Departure Date</div>
                    <strong style={{ color: '#0F172A' }}>
                      <i className="fas fa-calendar-day" style={{ marginRight: '6px', color: '#64748B' }}></i>
                      {selectedBooking.departureDate || 'Flexible'}
                    </strong>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Estimated Duration</div>
                    <strong style={{ color: '#0F172A' }}>
                      <i className="fas fa-clock" style={{ marginRight: '6px', color: '#64748B' }}></i>
                      {selectedBooking.durationDays || 'Not specified'}
                    </strong>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Group Breakdown</div>
                    <strong style={{ color: '#0F172A' }}>
                      <i className="fas fa-users" style={{ marginRight: '6px', color: '#64748B' }}></i>
                      {selectedBooking.adultsCount || 1} Adult(s){selectedBooking.childrenCount > 0 ? `, ${selectedBooking.childrenCount} Child(ren)` : ''}
                    </strong>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                    <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem', marginBottom: '2px' }}>Target Budget / Comfort</div>
                    <strong style={{ color: '#0F172A' }}>
                      <i className="fas fa-hotel" style={{ marginRight: '6px', color: '#64748B' }}></i>
                      {selectedBooking.accommodationType || selectedBooking.budgetPerPerson || 'Standard / Heritage'}
                    </strong>
                  </div>
                </div>

                {selectedBooking.interests && selectedBooking.interests.length > 0 && (
                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '6px' }}>
                      Traveler Interests:
                    </span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {selectedBooking.interests.map((it, i) => (
                        <span key={i} style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '600' }}>
                          ✓ {it}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Traveler Notes / Special Requests */}
              {selectedBooking.notes && (
                <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <i className="fas fa-quote-left" style={{ color: '#D97706' }}></i>
                    <strong style={{ color: '#92400E', fontSize: '0.88rem' }}>Traveler Notes & Special Requests:</strong>
                  </div>
                  <p style={{ margin: 0, fontStyle: 'italic', color: '#78350F', fontSize: '0.9rem', lineHeight: '1.6' }}>
                    "{selectedBooking.notes}"
                  </p>
                </div>
              )}

              {/* Status Update & Internal Notes */}
              <div style={{ background: '#F8FAFC', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h5 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--admin-text-muted)', fontWeight: '700' }}>
                  Status & Internal Administration
                </h5>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: '600', color: 'var(--admin-text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>File Status</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 'normal', color: 'var(--admin-text-muted)' }}>Updating changes the active stage of this lead</span>
                  </label>
                  <select 
                    className="form-control" 
                    value={statusUpdate} 
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    style={{ fontWeight: '600', height: '42px' }}
                  >
                    <option value="nouveau">🟡 New (Pending Review)</option>
                    <option value="contacte">🔵 Contacted (Initial phone/email communication done)</option>
                    <option value="devis_envoye">🟣 Quote Sent (Detailed itinerary & price proposal delivered)</option>
                    <option value="confirme">🟢 Confirmed (Deposit received / Booking finalized)</option>
                    <option value="annule">🔴 Cancelled (Lead abandoned or declined)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: '600', color: 'var(--admin-text-main)' }}>
                    Internal Follow-up Notes (Private - visible only to staff)
                  </label>
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    placeholder="Enter internal follow-up remarks, customized price quotes, client specific preferences..." 
                    value={adminNotes} 
                    onChange={(e) => setAdminNotes(e.target.value)}
                    style={{ fontSize: '0.88rem' }}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Modal Footer (Sticky) */}
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button 
                type="button"
                className="btn btn-sm" 
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '8px 14px' }} 
                onClick={() => handleDelete(selectedBooking._id)}
                title="Delete this request permanently"
              >
                <i className="fas fa-trash-alt"></i> Delete Request
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedBooking(null)}>
                  Close
                </button>
                <button 
                  type="button"
                  className="btn btn-primary" 
                  onClick={handleSaveStatus} 
                  disabled={isUpdating}
                  style={{ minWidth: '140px' }}
                >
                  {isUpdating ? (
                    <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                  ) : (
                    <><i className="fas fa-save"></i> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBookings;
