import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { fetchContacts, updateContactStatus, deleteContact } from '../../services/api';

const AdminInquiries = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyModalMessage, setReplyModalMessage] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const loadMessages = () => {
    setLoading(true);
    fetchContacts({ status: filterStatus })
      .then((res) => {
        setMessages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMessages();
  }, [filterStatus]);

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'unread' ? 'read' : (currentStatus === 'read' ? 'replied' : 'unread');
    try {
      await updateContactStatus(id, { status: nextStatus });
      loadMessages();
    } catch (err) {
      alert('Error updating message status.');
    }
  };

  const markAsReplied = async (id) => {
    try {
      await updateContactStatus(id, { status: 'replied' });
      loadMessages();
    } catch (err) {
      console.error('Failed to update status to replied', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteContact(id);
      loadMessages();
      if (selectedMessage?._id === id) setSelectedMessage(null);
      if (replyModalMessage?._id === id) setReplyModalMessage(null);
    } catch (err) {
      alert('Error deleting message.');
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleReplyAction = (actionType, message) => {
    markAsReplied(message._id);
    const subject = encodeURIComponent(`Re: ${message.subject || 'Inquiry to Jodhpur Voyage'}`);
    const email = encodeURIComponent(message.email);

    if (actionType === 'gmail') {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}`, '_blank');
    } else if (actionType === 'mailto') {
      window.location.href = `mailto:${message.email}?subject=${subject}`;
    } else if (actionType === 'whatsapp' && message.phone) {
      const cleanPhone = message.phone.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=Bonjour%20${encodeURIComponent(message.fullName)}`, '_blank');
    }
  };

  return (
    <AdminLayout 
      title="Contact Form Messages" 
      subtitle="View and respond to inquiries sent by travelers via the contact page."
    >
      <div className="admin-filter-bar" style={{ marginBottom: '24px' }}>
        <button className={`admin-filter-chip ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
          <i className="fas fa-inbox"></i>
          <span>All Messages</span>
          {filterStatus === 'all' && <span className="admin-filter-count">{messages.length}</span>}
        </button>
        <button className={`admin-filter-chip ${filterStatus === 'unread' ? 'active' : ''}`} onClick={() => setFilterStatus('unread')}>
          <i className="fas fa-envelope"></i>
          <span>Unread</span>
        </button>
        <button className={`admin-filter-chip ${filterStatus === 'read' ? 'active' : ''}`} onClick={() => setFilterStatus('read')}>
          <i className="fas fa-envelope-open"></i>
          <span>Read</span>
        </button>
        <button className={`admin-filter-chip ${filterStatus === 'replied' ? 'active' : ''}`} onClick={() => setFilterStatus('replied')}>
          <i className="fas fa-reply"></i>
          <span>Replied</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <i className="fas fa-circle-notch fa-spin" style={{ fontSize: '2.5rem', color: 'var(--admin-primary)' }}></i>
          <p style={{ marginTop: '16px', color: 'var(--admin-text-muted)' }}>Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="admin-table-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <i className="fas fa-envelope-open-text" style={{ fontSize: '3rem', color: '#CBD5E1', marginBottom: '16px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--admin-text-main)', margin: '0 0 8px' }}>Inbox is empty</h3>
          <p style={{ color: 'var(--admin-text-muted)', margin: 0 }}>Messages sent from the Contact Us form will appear here.</p>
        </div>
      ) : (
        <div className="admin-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Message Preview</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <strong style={{ color: 'var(--admin-text-main)' }}>{m.fullName}</strong>
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', marginTop: '2px' }}>
                        <i className="fas fa-envelope"></i> <a href={`mailto:${m.email}`} style={{ color: 'var(--admin-primary)' }}>{m.email}</a>
                        {m.phone && <span> • <i className="fab fa-whatsapp" style={{ color: '#16A34A' }}></i> {m.phone}</span>}
                      </div>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--admin-navy)' }}>{m.subject}</td>
                    <td style={{ maxWidth: '340px', fontSize: '0.88rem', lineHeight: '1.5', color: '#334155' }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {m.message}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--admin-text-muted)' }}>
                      {new Date(m.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`admin-status-badge ${m.status === 'unread' ? 'status-nouveau' : (m.status === 'read' ? 'status-contacte' : 'status-confirme')}`}>
                        {m.status === 'unread' ? <><i className="fas fa-bell"></i> Unread</> : (m.status === 'read' ? <><i className="fas fa-check"></i> Read</> : <><i className="fas fa-reply"></i> Replied</>)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-sm btn-outline" onClick={() => setSelectedMessage(m)} title="Read message">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => handleStatusToggle(m._id, m.status)} title="Toggle status">
                          <i className="fas fa-sync-alt"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-primary" 
                          onClick={() => setReplyModalMessage(m)} 
                          title="Reply to message"
                        >
                          <i className="fas fa-reply"></i>
                        </button>
                        <button className="btn btn-sm" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }} onClick={() => handleDelete(m._id)} title="Delete">
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

      {/* Message Reader Modal */}
      {selectedMessage && (
        <div className="modal-backdrop" onClick={() => setSelectedMessage(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fas fa-envelope-open-text" style={{ color: 'var(--admin-primary)' }}></i>
                <span>{selectedMessage.subject || 'Client Inquiry'}</span>
              </h3>
              <button className="modal-close" onClick={() => setSelectedMessage(null)} title="Close dialog">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '16px 18px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  <div><strong>From:</strong> <span style={{ color: 'var(--admin-text-main)', fontWeight: '600' }}>{selectedMessage.fullName}</span></div>
                  <div><strong>Email:</strong> <a href={`mailto:${selectedMessage.email}`} style={{ color: 'var(--admin-primary)', fontWeight: '600' }}>{selectedMessage.email}</a></div>
                  <div><strong>Phone:</strong> {selectedMessage.phone ? <a href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#16A34A', fontWeight: '600' }}><i className="fab fa-whatsapp"></i> {selectedMessage.phone}</a> : <span style={{ color: 'var(--admin-text-muted)' }}>Not provided</span>}</div>
                  <div><strong>Sent on:</strong> <span style={{ color: 'var(--admin-text-muted)' }}>{new Date(selectedMessage.createdAt).toLocaleString('en-US')}</span></div>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--admin-text-muted)', display: 'block', marginBottom: '8px' }}>
                  Message Content
                </label>
                <div style={{ background: '#FFFFFF', padding: '18px', borderRadius: '10px', border: '1px solid #E2E8F0', minHeight: '140px', fontSize: '0.92rem', lineHeight: '1.65', whiteSpace: 'pre-line', color: '#1E293B' }}>
                  {selectedMessage.message}
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button 
                type="button"
                className="btn btn-sm" 
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '8px 14px' }}
                onClick={() => {
                  handleDelete(selectedMessage._id);
                  setSelectedMessage(null);
                }}
              >
                <i className="fas fa-trash-alt"></i> Delete
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setSelectedMessage(null)}>
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    const msg = selectedMessage;
                    setSelectedMessage(null);
                    setReplyModalMessage(msg);
                  }}
                >
                  <i className="fas fa-reply"></i> Reply Options
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Options Modal */}
      {replyModalMessage && (
        <div className="modal-backdrop" onClick={() => setReplyModalMessage(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fas fa-paper-plane" style={{ color: 'var(--admin-primary)' }}></i>
                <span>Reply to {replyModalMessage.fullName}</span>
              </h3>
              <button className="modal-close" onClick={() => setReplyModalMessage(null)} title="Close dialog">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', padding: '14px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}>
                <div><strong>Recipient:</strong> <span style={{ color: 'var(--admin-navy)', fontWeight: '600' }}>{replyModalMessage.fullName}</span></div>
                <div style={{ marginTop: '4px' }}><strong>Email:</strong> <span style={{ color: 'var(--admin-primary)', fontWeight: '600' }}>{replyModalMessage.email}</span></div>
                {replyModalMessage.subject && (
                  <div style={{ marginTop: '4px' }}><strong>Subject:</strong> <span style={{ color: '#475569' }}>{replyModalMessage.subject}</span></div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--admin-text-muted)' }}>
                  Choose How to Reply:
                </label>

                {/* Option 1: Gmail Webmail */}
                <button 
                  className="btn" 
                  style={{ 
                    background: '#EA4335', 
                    color: '#FFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justify: 'center', 
                    gap: '10px', 
                    padding: '12px', 
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleReplyAction('gmail', replyModalMessage)}
                >
                  <i className="fab fa-google" style={{ fontSize: '1.1rem' }}></i>
                  Open in Gmail Webmail (New Tab)
                </button>

                {/* Option 2: WhatsApp (if phone available) */}
                {replyModalMessage.phone && (
                  <button 
                    className="btn" 
                    style={{ 
                      background: '#25D366', 
                      color: '#FFF', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justify: 'center', 
                      gap: '10px', 
                      padding: '12px', 
                      fontSize: '0.95rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleReplyAction('whatsapp', replyModalMessage)}
                  >
                    <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }}></i>
                    Send Direct WhatsApp Message ({replyModalMessage.phone})
                  </button>
                )}

                {/* Option 3: Default Mail Client */}
                <button 
                  className="btn btn-outline" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justify: 'center', 
                    gap: '10px', 
                    padding: '12px', 
                    fontSize: '0.92rem',
                    fontWeight: '600'
                  }}
                  onClick={() => handleReplyAction('mailto', replyModalMessage)}
                >
                  <i className="fas fa-envelope-open" style={{ color: 'var(--admin-primary)' }}></i>
                  Open Default Desktop Mail App (Outlook / Mail)
                </button>

                {/* Option 4: Copy Email */}
                <button 
                  className="btn btn-outline" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justify: 'center', 
                    gap: '10px', 
                    padding: '10px', 
                    fontSize: '0.88rem',
                    color: copiedEmail ? '#16A34A' : '#475569',
                    borderColor: copiedEmail ? '#86EFAC' : '#E2E8F0',
                    background: copiedEmail ? '#F0FDF4' : 'transparent'
                  }}
                  onClick={() => handleCopyEmail(replyModalMessage.email)}
                >
                  <i className={copiedEmail ? "fas fa-check" : "fas fa-copy"}></i>
                  {copiedEmail ? 'Email Copied to Clipboard!' : `Copy Email Address (${replyModalMessage.email})`}
                </button>
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-between' }}>
              <button 
                type="button" 
                className="btn btn-sm btn-outline"
                onClick={() => {
                  markAsReplied(replyModalMessage._id);
                  setReplyModalMessage(null);
                }}
              >
                <i className="fas fa-check-double"></i> Mark as Replied without opening
              </button>
              <button 
                type="button" 
                className="btn btn-sm"
                style={{ background: '#E2E8F0', color: '#475569' }}
                onClick={() => setReplyModalMessage(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminInquiries;

