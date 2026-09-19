'use client';

import { useState, useRef } from 'react';
import styles from '../../components/admin/ImageUploadWidget.module.css';

export default function ThemeManager({ initialThemes }) {
  const [themes, setThemes] = useState(initialThemes || []);
  const [themeName, setThemeName] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (e.g., .jpg, .png, .webp).');
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError(null);
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUploadAndSave = async () => {
    if (!file || !themeName) {
      setError('Please provide both a theme name and an image.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Upload file to CDN
      const formData = new FormData();
      formData.append('file', file);
      // Clean filename for the CDN
      const cleanName = `theme-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '-').toLowerCase()}`;
      formData.append('filename', cleanName);

      const uploadRes = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Upload failed');
      }

      const cdnUrl = uploadData.url;

      // 2. Save theme to database
      const themeRes = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: themeName,
          backgroundUrl: `url(${cdnUrl}) center/cover no-repeat`
        })
      });
      const themeData = await themeRes.json();

      if (!themeRes.ok) {
        throw new Error(themeData.error || 'Failed to save theme');
      }

      // 3. Update UI
      setThemes([...themes, themeData.theme]);
      setFile(null);
      setPreviewUrl(null);
      setThemeName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;
    try {
      const res = await fetch(`/api/admin/themes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setThemes(themes.filter(t => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Create New Theme Form */}
      <div className={styles.container} style={{ maxWidth: '600px', margin: 0 }}>
        <h2 className={styles.title}>Add New Theme</h2>
        <p className={styles.description}>Upload a background image and give it a name for the Squad Builder.</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="themeName">Theme Name</label>
          <input 
            id="themeName"
            type="text" 
            value={themeName} 
            onChange={(e) => setThemeName(e.target.value)}
            className={styles.textInput}
            disabled={isUploading}
            placeholder="e.g., Summer Stadium"
          />
        </div>

        {!file && (
          <div 
            className={styles.dropzone}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={styles.dropzoneContent}>
              <p><strong>Click to select image</strong></p>
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              onChange={onFileChange} 
              className={styles.hiddenInput}
            />
          </div>
        )}

        {file && (
          <div className={styles.previewContainer}>
            <div className={styles.imagePreview}>
              <img src={previewUrl} alt="Preview" />
            </div>
            <div className={styles.actions}>
              <button 
                className={styles.cancelButton} 
                onClick={() => { setFile(null); setPreviewUrl(null); }}
                disabled={isUploading}
              >
                Cancel Image
              </button>
            </div>
          </div>
        )}

        {file && themeName && (
           <div className={styles.actions} style={{ marginTop: '1rem' }}>
             <button 
               className={styles.uploadButton} 
               onClick={handleUploadAndSave}
               disabled={isUploading}
             >
               {isUploading ? 'Saving...' : 'Add Theme'}
             </button>
           </div>
        )}
      </div>

      {/* Existing Themes List */}
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Existing Custom Themes</h2>
        {themes.length === 0 ? (
          <p style={{ color: '#666' }}>No custom themes added yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {themes.map(theme => {
               // Extract URL from the "url(...) center/cover no-repeat" string for the img src
               const urlMatch = theme.backgroundUrl.match(/url\((.*?)\)/);
               const imgSrc = urlMatch ? urlMatch[1] : '';
               return (
                 <div key={theme.id} style={{ border: '1px solid #eaeaea', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
                   <div style={{ height: '150px', backgroundImage: theme.backgroundUrl, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                   <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontWeight: '600' }}>{theme.name}</span>
                     <button 
                       onClick={() => handleDelete(theme.id)}
                       style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                     >
                       Delete
                     </button>
                   </div>
                 </div>
               );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
