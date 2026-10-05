import React, { useState, useRef, useEffect } from 'react';
import { uploadImage } from '../services/api';

/**
 * RichTextEditor - Full-featured WYSIWYG editor for Blog Articles & Content CMS.
 * Supports:
 * - Rich typography (H2, H3, H4, Paragraph, Blockquote)
 * - Text styling (Bold, Italic, Underline, Strikethrough, Text Color)
 * - Lists (Bullet, Numbered) & Alignment (Left, Center, Right)
 * - Hyperlinks & Horizontal separators
 * - In-content Pictures / Images:
 *    1. Direct one-click device upload (via Cloudinary uploadImage API)
 *    2. Image Modal with local upload, URL input, custom caption & width/alignment
 * - Visual (WYSIWYG) and Raw HTML Code mode toggle
 * - Safe selection & cursor preservation
 */
const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Rédigez le contenu complet de votre article ici...',
  minHeight = '360px',
  label = 'Contenu de l\'article (Éditeur Enrichi avec Images)'
}) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const savedSelectionRef = useRef(null);

  const [isCodeView, setIsCodeView] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  // Image Modal State
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' | 'url'
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageAlignment, setImageAlignment] = useState('center'); // 'center' | 'left' | 'right' | 'full'
  const [modalUploadedUrl, setModalUploadedUrl] = useState('');
  const [modalUploadLoading, setModalUploadLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Link Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  // Sync internal state when external value changes and editor is NOT focused
  useEffect(() => {
    if (value !== htmlContent) {
      setHtmlContent(value || '');
      if (editorRef.current && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  // Initial populate of contentEditable
  useEffect(() => {
    if (editorRef.current && !isCodeView) {
      if (editorRef.current.innerHTML !== htmlContent) {
        editorRef.current.innerHTML = htmlContent || '';
      }
    }
  }, [isCodeView]);

  // Save current cursor position / selection
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      // Ensure the selection is within our editor
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
        return;
      }
    }
  };

  // Restore cursor selection
  const restoreSelection = () => {
    if (!savedSelectionRef.current || !editorRef.current) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedSelectionRef.current);
  };

  // Trigger change event
  const handleContentChange = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      setHtmlContent(newHtml);
      if (onChange) onChange(newHtml);
    }
  };

  // Execute standard formatting commands
  const execCmd = (command, val = null) => {
    if (isCodeView) return;
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(command, false, val);
    handleContentChange();
  };

  // Format block (p, h2, h3, h4, blockquote)
  const handleFormatBlock = (tag) => {
    if (isCodeView) return;
    execCmd('formatBlock', tag);
  };

  // Insert arbitrary HTML at current selection or at the end
  const insertHtmlAtCursor = (htmlToInsert) => {
    if (isCodeView) {
      const updated = htmlContent + '\n' + htmlToInsert;
      setHtmlContent(updated);
      if (onChange) onChange(updated);
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const el = document.createElement('div');
        el.innerHTML = htmlToInsert;
        const frag = document.createDocumentFragment();
        let node;
        let lastNode = null;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);

        // Move cursor after the inserted content
        if (lastNode) {
          const newRange = document.createRange();
          newRange.setStartAfter(lastNode);
          newRange.collapse(true);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
      } else {
        editorRef.current.innerHTML += htmlToInsert;
      }

      handleContentChange();
    }
  };

  // Quick 1-click device file upload
  const handleQuickFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    setUploadProgressText('Téléchargement de l\'image...');

    try {
      const res = await uploadImage(file);
      if (res.data && res.data.url) {
        const imgHtml = `
<figure class="blog-content-figure" style="text-align: center; margin: 24px auto; max-width: 100%;">
  <img src="${res.data.url}" alt="${file.name.replace(/\.[^/.]+$/, '')}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); display: inline-block;" />
</figure>
<p><br></p>`;
        insertHtmlAtCursor(imgHtml);
      } else {
        alert('Échec de la récupération de l\'URL de l\'image.');
      }
    } catch (err) {
      console.error('Quick image upload error:', err);
      alert('Erreur lors du téléchargement de l\'image. Veuillez réessayer.');
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      e.target.value = '';
    }
  };

  // Open Image Modal
  const openImageModal = () => {
    saveSelection();
    setImageUrlInput('');
    setModalUploadedUrl('');
    setImageCaption('');
    setImageAlignment('center');
    setModalError('');
    setShowImageModal(true);
  };

  // Handle upload within Image Modal
  const handleModalFileUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setModalError('Veuillez sélectionner une image valide.');
      return;
    }
    setModalUploadLoading(true);
    setModalError('');
    try {
      const res = await uploadImage(file);
      if (res.data && res.data.url) {
        setModalUploadedUrl(res.data.url);
      } else {
        setModalError('Impossible d\'obtenir le lien de l\'image.');
      }
    } catch (err) {
      console.error(err);
      setModalError('Erreur d\'envoi vers le serveur.');
    } finally {
      setModalUploadLoading(false);
    }
  };

  // Confirm image insert from Modal
  const handleConfirmInsertImage = () => {
    const finalUrl = imageTab === 'upload' ? modalUploadedUrl : imageUrlInput.trim();
    if (!finalUrl) {
      setModalError('Veuillez fournir une image valide ou un lien URL.');
      return;
    }

    let figureStyle = 'margin: 24px auto; text-align: center; max-width: 100%;';
    let imgStyle = 'height: auto; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.08);';

    if (imageAlignment === 'full') {
      imgStyle += ' width: 100%; max-width: 100%; display: block;';
    } else if (imageAlignment === 'left') {
      figureStyle = 'float: left; margin: 12px 24px 16px 0; max-width: 45%; text-align: left;';
      imgStyle += ' width: 100%; display: block;';
    } else if (imageAlignment === 'right') {
      figureStyle = 'float: right; margin: 12px 0 16px 24px; max-width: 45%; text-align: right;';
      imgStyle += ' width: 100%; display: block;';
    } else {
      // Center standard
      figureStyle = 'margin: 24px auto; text-align: center; max-width: 85%;';
      imgStyle += ' max-width: 100%; display: inline-block;';
    }

    const captionHtml = imageCaption.trim()
      ? `<figcaption style="font-size: 0.85rem; color: #64748B; margin-top: 8px; font-style: italic; text-align: center;">${imageCaption.trim()}</figcaption>`
      : '';

    const imgBlock = `
<figure class="blog-content-figure align-${imageAlignment}" style="${figureStyle}">
  <img src="${finalUrl}" alt="${imageCaption.trim() || 'Illustration article'}" style="${imgStyle}" />
  ${captionHtml}
</figure>
<p><br></p>`;

    setShowImageModal(false);
    insertHtmlAtCursor(imgBlock);
  };

  // Open Link Modal
  const openLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : '';
    setLinkText(selectedText);
    setLinkUrl('');
    setLinkNewTab(true);
    setShowLinkModal(true);
  };

  // Confirm Link Insert
  const handleConfirmInsertLink = () => {
    if (!linkUrl.trim()) return;
    const url = linkUrl.trim().startsWith('http') || linkUrl.trim().startsWith('/') ? linkUrl.trim() : `https://${linkUrl.trim()}`;
    const text = linkText.trim() || url;
    const targetAttr = linkNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
    const linkHtml = `<a href="${url}"${targetAttr} style="color: #C59B27; text-decoration: underline; font-weight: 500;">${text}</a>`;
    setShowLinkModal(false);
    insertHtmlAtCursor(linkHtml);
  };

  // Toggle Code / Visual mode
  const handleToggleCodeView = () => {
    if (!isCodeView) {
      // Switching to code
      setIsCodeView(true);
    } else {
      // Switching back to visual
      setIsCodeView(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = htmlContent;
        }
      }, 10);
    }
  };

  // Calculate word and character count
  const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent ? textContent.split(' ').length : 0;
  const charCount = textContent.length;

  return (
    <div className="rich-editor-wrapper" style={{ border: '1px solid #CBD5E1', borderRadius: '12px', background: '#FFFFFF', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      {/* Hidden file input for 1-click upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleQuickFileUpload}
      />

      {/* Editor Header / Top Label & Mode Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-feather-alt" style={{ color: '#C59B27', fontSize: '1rem' }}></i>
          <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#1E293B' }}>{label}</span>
          {isUploading && (
            <span style={{ fontSize: '0.78rem', color: '#0284C7', display: 'inline-flex', alignItems: 'center', gap: '5px', marginLeft: '8px' }}>
              <i className="fas fa-spinner fa-spin"></i> {uploadProgressText}
            </span>
          )}
        </div>

        {/* Visual / HTML Switch */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={handleToggleCodeView}
            style={{
              background: isCodeView ? '#1E293B' : '#FFFFFF',
              color: isCodeView ? '#FFFFFF' : '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.78rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            title={isCodeView ? 'Basculer vers l\'aperçu visuel' : 'Afficher / Modifier le code HTML'}
          >
            <i className={isCodeView ? 'fas fa-eye' : 'fas fa-code'}></i>
            {isCodeView ? 'Vue Visuelle (WYSIWYG)' : 'Code HTML source'}
          </button>
        </div>
      </div>

      {/* Toolbar (Only available in Visual Mode) */}
      {!isCodeView && (
        <div className="rich-editor-toolbar" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', padding: '8px 12px', background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
          {/* Format / Headings */}
          <select
            onChange={(e) => handleFormatBlock(e.target.value)}
            defaultValue=""
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '0.82rem',
              background: '#F8FAFC',
              fontWeight: '600',
              color: '#334155',
              cursor: 'pointer',
              marginRight: '4px'
            }}
          >
            <option value="p">Paragraphe (Normal)</option>
            <option value="h2">Titre 2 (Grand titre)</option>
            <option value="h3">Titre 3 (Sous-titre)</option>
            <option value="h4">Titre 4 (Sous-section)</option>
            <option value="blockquote">Citation mise en valeur</option>
          </select>

          <span style={{ width: '1px', height: '22px', background: '#E2E8F0', margin: '0 4px' }} />

          {/* Typography */}
          <button type="button" className="rich-btn" onClick={() => execCmd('bold')} title="Gras (Ctrl+B)">
            <i className="fas fa-bold"></i>
          </button>
          <button type="button" className="rich-btn" onClick={() => execCmd('italic')} title="Italique (Ctrl+I)">
            <i className="fas fa-italic"></i>
          </button>
          <button type="button" className="rich-btn" onClick={() => execCmd('underline')} title="Souligné (Ctrl+U)">
            <i className="fas fa-underline"></i>
          </button>
          <button type="button" className="rich-btn" onClick={() => execCmd('strikeThrough')} title="Barré">
            <i className="fas fa-strikethrough"></i>
          </button>

          {/* Text Color Quick Options */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <button
              type="button"
              className="rich-btn"
              onClick={() => execCmd('foreColor', '#C59B27')}
              title="Texte Doré Jodhpur Voyage (#C59B27)"
              style={{ color: '#C59B27' }}
            >
              <i className="fas fa-palette"></i>
            </button>
          </div>

          <span style={{ width: '1px', height: '22px', background: '#E2E8F0', margin: '0 4px' }} />

          {/* Alignment */}
          <button type="button" className="rich-btn" onClick={() => execCmd('justifyLeft')} title="Aligner à gauche">
            <i className="fas fa-align-left"></i>
          </button>
          <button type="button" className="rich-btn" onClick={() => execCmd('justifyCenter')} title="Centrer">
            <i className="fas fa-align-center"></i>
          </button>
          <button type="button" className="rich-btn" onClick={() => execCmd('justifyRight')} title="Aligner à droite">
            <i className="fas fa-align-right"></i>
          </button>

          <span style={{ width: '1px', height: '22px', background: '#E2E8F0', margin: '0 4px' }} />

          {/* Lists */}
          <button type="button" className="rich-btn" onClick={() => execCmd('insertUnorderedList')} title="Liste à puces">
            <i className="fas fa-list-ul"></i>
          </button>
          <button type="button" className="rich-btn" onClick={() => execCmd('insertOrderedList')} title="Liste numérotée">
            <i className="fas fa-list-ol"></i>
          </button>
          <button type="button" className="rich-btn" onClick={() => execCmd('insertHorizontalRule')} title="Ligne de séparation horizontale">
            <i className="fas fa-minus"></i>
          </button>

          <span style={{ width: '1px', height: '22px', background: '#E2E8F0', margin: '0 4px' }} />

          {/* Link */}
          <button type="button" className="rich-btn" onClick={openLinkModal} title="Insérer un lien hypertexte">
            <i className="fas fa-link"></i>
          </button>

          {/* CORE FEATURE: PICTURES / IMAGES IN CONTENT */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#FEF3C7', padding: '2px 6px', borderRadius: '6px', border: '1px solid #FCD34D' }}>
            {/* Quick 1-click upload */}
            <button
              type="button"
              className="rich-btn"
              onClick={() => {
                saveSelection();
                fileInputRef.current?.click();
              }}
              title="Télécharger une photo depuis votre appareil et l'insérer immédiatement"
              style={{ color: '#B45309', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <i className="fas fa-cloud-arrow-up"></i>
              <span style={{ fontSize: '0.78rem' }}>Photo Directe</span>
            </button>

            {/* Modal Image Inserter */}
            <button
              type="button"
              className="rich-btn"
              onClick={openImageModal}
              title="Ouvrir l'assistant d'insertion d'image (légende, cadrage, URL web)"
              style={{ color: '#B45309', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <i className="fas fa-image"></i>
              <span style={{ fontSize: '0.78rem' }}>Image Options...</span>
            </button>
          </div>

          <span style={{ width: '1px', height: '22px', background: '#E2E8F0', margin: '0 4px' }} />

          {/* History & Clean */}
          <button type="button" className="rich-btn" onClick={() => execCmd('undo')} title="Annuler (Ctrl+Z)">
            <i className="fas fa-undo"></i>
          </button>
          <button type="button" className="rich-btn" onClick={() => execCmd('redo')} title="Rétablir (Ctrl+Y)">
            <i className="fas fa-redo"></i>
          </button>
          <button type="button" className="rich-btn" onClick={() => execCmd('removeFormat')} title="Effacer la mise en forme">
            <i className="fas fa-eraser"></i>
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div style={{ position: 'relative' }}>
        {isCodeView ? (
          <textarea
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              if (onChange) onChange(e.target.value);
            }}
            placeholder="Écrivez ou collez votre code HTML ici..."
            style={{
              width: '100%',
              minHeight: minHeight,
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              padding: '16px',
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              background: '#0F172A',
              color: '#38BDF8',
              boxSizing: 'border-box'
            }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleContentChange}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onBlur={saveSelection}
            className="rich-editor-content blog-detail-content"
            style={{
              minHeight: minHeight,
              padding: '20px 24px',
              outline: 'none',
              lineHeight: '1.8',
              fontSize: '1rem',
              color: '#1E293B',
              boxSizing: 'border-box',
              cursor: 'text'
            }}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* Footer Info & Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', fontSize: '0.76rem', color: '#64748B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="fas fa-info-circle" style={{ color: '#94A3B8' }}></i>
          <span>
            {isCodeView
              ? 'Mode Code Source HTML actif.'
              : 'Cliquez où vous souhaitez ajouter du texte ou une photo, puis utilisez la barre d\'outils.'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span><strong>{wordCount}</strong> mots</span>
          <span><strong>{charCount}</strong> caractères</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: INSERT PICTURE / IMAGE WITH OPTIONS            */}
      {/* ======================================================== */}
      {showImageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '14px', width: '100%', maxWidth: '540px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', background: '#1E293B', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fas fa-image" style={{ color: '#C59B27', fontSize: '1.2rem' }}></i>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#FFFFFF', fontWeight: '600' }}>Insérer une Image dans l'Article</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              {/* Tab Switch */}
              <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => { setImageTab('upload'); setModalError(''); }}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    borderBottom: imageTab === 'upload' ? '3px solid #C59B27' : '3px solid transparent',
                    fontWeight: imageTab === 'upload' ? '700' : '500',
                    color: imageTab === 'upload' ? '#C59B27' : '#64748B',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-upload"></i> Télécharger depuis l'appareil
                </button>
                <button
                  type="button"
                  onClick={() => { setImageTab('url'); setModalError(''); }}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    borderBottom: imageTab === 'url' ? '3px solid #C59B27' : '3px solid transparent',
                    fontWeight: imageTab === 'url' ? '700' : '500',
                    color: imageTab === 'url' ? '#C59B27' : '#64748B',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-link"></i> Lien Web (URL Image)
                </button>
              </div>

              {/* Tab 1: Upload from Device */}
              {imageTab === 'upload' && (
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: '10px',
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => document.getElementById('modal-device-file-input')?.click()}
                  >
                    <input
                      id="modal-device-file-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleModalFileUpload(file);
                      }}
                    />
                    {modalUploadLoading ? (
                      <div>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#C59B27', marginBottom: '8px' }}></i>
                        <p style={{ margin: 0, fontWeight: '600', color: '#1E293B' }}>Envoi vers Cloudinary en cours...</p>
                      </div>
                    ) : modalUploadedUrl ? (
                      <div>
                        <img
                          src={modalUploadedUrl}
                          alt="Aperçu"
                          style={{ maxHeight: '140px', maxWidth: '100%', borderRadius: '6px', marginBottom: '8px', objectFit: 'cover' }}
                        />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#16A34A', fontWeight: '600' }}>
                          <i className="fas fa-check-circle"></i> Image téléchargée avec succès !
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Cliquez pour en choisir une autre</span>
                      </div>
                    ) : (
                      <div>
                        <i className="fas fa-cloud-arrow-up" style={{ fontSize: '2.4rem', color: '#94A3B8', marginBottom: '10px' }}></i>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#1E293B', fontSize: '0.95rem' }}>
                          Cliquez pour sélectionner une photo
                        </p>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
                          Formats acceptés : JPG, PNG, WEBP (Max 12 Mo)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Direct URL */}
              {imageTab === 'url' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>
                    Adresse web de l'image (URL) *
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {imageUrlInput && (
                    <div style={{ marginTop: '10px', textAlign: 'center' }}>
                      <img
                        src={imageUrlInput}
                        alt="Aperçu"
                        onError={(e) => { e.target.style.display = 'none'; }}
                        style={{ maxHeight: '120px', maxWidth: '100%', borderRadius: '6px', border: '1px solid #E2E8F0' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Caption & Alignment options */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>
                  Légende / Texte alternatif (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : Temple de Mehrangarh au coucher du soleil"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Alignment select */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>
                  Disposition dans l'article
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { key: 'center', label: 'Centré (85%)', icon: 'fa-align-center' },
                    { key: 'full', label: 'Pleine Largeur', icon: 'fa-arrows-alt-h' },
                    { key: 'left', label: 'Flottant Gauche', icon: 'fa-align-left' },
                    { key: 'right', label: 'Flottant Droite', icon: 'fa-align-right' }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setImageAlignment(opt.key)}
                      style={{
                        padding: '8px 6px',
                        borderRadius: '6px',
                        border: imageAlignment === opt.key ? '2px solid #C59B27' : '1px solid #CBD5E1',
                        background: imageAlignment === opt.key ? '#FEF3C7' : '#FFFFFF',
                        color: imageAlignment === opt.key ? '#92400E' : '#475569',
                        fontSize: '0.78rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <i className={`fas ${opt.icon}`}></i>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {modalError && (
                <div style={{ padding: '8px 12px', borderRadius: '6px', background: '#FEE2E2', color: '#B91C1C', fontSize: '0.82rem', marginBottom: '14px' }}>
                  <i className="fas fa-exclamation-triangle"></i> {modalError}
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInsertImage}
                  disabled={modalUploadLoading || (imageTab === 'upload' && !modalUploadedUrl) || (imageTab === 'url' && !imageUrlInput.trim())}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#C59B27',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    cursor: (modalUploadLoading || (imageTab === 'upload' && !modalUploadedUrl) || (imageTab === 'url' && !imageUrlInput.trim())) ? 'not-allowed' : 'pointer',
                    opacity: (modalUploadLoading || (imageTab === 'upload' && !modalUploadedUrl) || (imageTab === 'url' && !imageUrlInput.trim())) ? 0.6 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-plus-circle"></i> Insérer l'Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: INSERT HYPERLINK                               */}
      {/* ======================================================== */}
      {showLinkModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '14px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#1E293B', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-link" style={{ color: '#C59B27' }}></i>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#FFFFFF' }}>Insérer un lien</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>
                  Texte à afficher
                </label>
                <input
                  type="text"
                  placeholder="Texte du lien"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '6px', color: '#334155' }}>
                  Destination (URL ou chemin relatif) *
                </label>
                <input
                  type="text"
                  placeholder="https://... ou /voyage-inde"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="linkNewTabCheckbox"
                  checked={linkNewTab}
                  onChange={(e) => setLinkNewTab(e.target.checked)}
                />
                <label htmlFor="linkNewTabCheckbox" style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
                  Ouvrir dans un nouvel onglet (target="_blank")
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#64748B', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInsertLink}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#C59B27', color: '#FFFFFF', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Insérer le lien
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
