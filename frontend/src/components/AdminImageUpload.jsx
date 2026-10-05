import React, { useState, useRef } from 'react';
import { uploadImage } from '../services/api';

const AdminImageUpload = ({
  value = '',
  onChange,
  label = 'Image / Photo',
  required = false,
  helpText = 'Upload an image from your device (Cloudinary) or enter an image URL directly.',
  placeholder = 'https://... or upload a local file'
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP, SVG).');
      return;
    }

    // 12 MB max limit
    if (file.size > 12 * 1024 * 1024) {
      setUploadError('Image size exceeds 12 MB. Please select a smaller file.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const res = await uploadImage(file);
      if (res.data && res.data.url) {
        onChange(res.data.url);
      } else {
        setUploadError('Failed to get uploaded image URL.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const msg = err.response?.data?.message || 'Error uploading image. Please try again.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // Reset input
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="admin-image-upload-wrapper" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label className="form-label" style={{ fontWeight: '600', margin: 0 }}>
          {label} {required && <span style={{ color: 'var(--admin-red)' }}>*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--admin-red)',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <i className="fas fa-trash-alt"></i> Clear Image
          </button>
        )}
      </div>

      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileInputChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Upload & Preview Container */}
      <div
        style={{
          border: dragOver ? '2px dashed var(--admin-primary)' : '1px solid #E2E8F0',
          borderRadius: '10px',
          background: dragOver ? 'var(--admin-primary-light)' : '#FAFAFA',
          padding: '12px',
          transition: 'all 0.2s ease'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Image Thumbnail Preview */}
          {value ? (
            <div
              style={{
                position: 'relative',
                width: '100px',
                height: '75px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid #CBD5E1',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                background: '#F1F5F9'
              }}
            >
              <img
                src={value}
                alt="Preview"
                onError={(e) => {
                  e.currentTarget.src = '/images/dest-rajasthan.jpg';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}
              >
                {value.includes('cloudinary') ? 'Cloudinary' : 'Live'}
              </span>
            </div>
          ) : (
            <div
              style={{
                width: '100px',
                height: '75px',
                borderRadius: '8px',
                border: '1px dashed #CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#F8FAFC',
                color: '#94A3B8',
                flexShrink: 0,
                fontSize: '0.75rem'
              }}
            >
              <i className="far fa-image" style={{ fontSize: '1.4rem', marginBottom: '4px' }}></i>
              <span>No Image</span>
            </div>
          )}

          {/* Controls & Upload Button */}
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  fontWeight: '600'
                }}
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Uploading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt"></i> Upload from Device
                  </>
                )}
              </button>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                or drag &amp; drop image here
              </span>
            </div>

            {/* Direct URL input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  fontSize: '0.84rem',
                  padding: '6px 12px',
                  background: '#FFFFFF',
                  borderRadius: '6px'
                }}
              />
            </div>
          </div>
        </div>

        {uploadError && (
          <div
            style={{
              color: 'var(--admin-red)',
              fontSize: '0.78rem',
              fontWeight: 600,
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <i className="fas fa-exclamation-triangle"></i> {uploadError}
          </div>
        )}

        {helpText && (
          <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', marginTop: '6px' }}>
            <i className="fas fa-info-circle" style={{ opacity: 0.8, marginRight: '4px' }}></i>
            {helpText}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminImageUpload;
