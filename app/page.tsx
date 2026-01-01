'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttlSeconds, setTtlSeconds] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pasteUrl, setPasteUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPasteUrl('');

    try {
      const body: any = { content: content.trim() };
      
      if (ttlSeconds.trim()) {
        const ttl = parseInt(ttlSeconds, 10);
        if (isNaN(ttl) || ttl < 1) {
          setError('TTL must be an integer >= 1');
          setLoading(false);
          return;
        }
        body.ttl_seconds = ttl;
      }

      if (maxViews.trim()) {
        const views = parseInt(maxViews, 10);
        if (isNaN(views) || views < 1) {
          setError('Max views must be an integer >= 1');
          setLoading(false);
          return;
        }
        body.max_views = views;
      }

      const response = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create paste');
        setLoading(false);
        return;
      }

      setPasteUrl(data.url);
      setContent('');
      setTtlSeconds('');
      setMaxViews('');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Pastebin</h1>
        <p style={styles.subtitle}>Create and share text snippets</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="content" style={styles.label}>
              Content <span style={styles.required}>*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your text here..."
              required
              rows={12}
              style={styles.textarea}
            />
          </div>

          <div style={styles.optionsRow}>
            <div style={styles.formGroup}>
              <label htmlFor="ttl" style={styles.label}>
                TTL (seconds)
              </label>
              <input
                type="number"
                id="ttl"
                value={ttlSeconds}
                onChange={(e) => setTtlSeconds(e.target.value)}
                placeholder="Optional"
                min="1"
                style={styles.input}
              />
              <small style={styles.helpText}>Paste expires after this many seconds</small>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="views" style={styles.label}>
                Max Views
              </label>
              <input
                type="number"
                id="views"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="Optional"
                min="1"
                style={styles.input}
              />
              <small style={styles.helpText}>Paste becomes unavailable after this many views</small>
            </div>
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          {pasteUrl && (
            <div style={styles.success}>
              <p style={styles.successText}>✅ Paste created successfully!</p>
              <a
                href={pasteUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                {pasteUrl}
              </a>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !content.trim()}
            style={{
              ...styles.button,
              ...(loading || !content.trim() ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Creating...' : 'Create Paste'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '40px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '32px',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    margin: '0 0 24px 0',
    color: '#666',
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  optionsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  label: {
    fontWeight: '500',
    color: '#333',
    fontSize: '14px',
  },
  required: {
    color: '#d32f2f',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  helpText: {
    fontSize: '12px',
    color: '#999',
    marginTop: '4px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  error: {
    padding: '12px',
    backgroundColor: '#ffebee',
    color: '#d32f2f',
    borderRadius: '4px',
    fontSize: '14px',
  },
  success: {
    padding: '12px',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
  },
  successText: {
    margin: '0 0 8px 0',
    color: '#2e7d32',
    fontSize: '14px',
  },
  link: {
    color: '#1976d2',
    textDecoration: 'none',
    wordBreak: 'break-all',
    fontSize: '14px',
  },
};

