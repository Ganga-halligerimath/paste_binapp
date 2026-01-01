export default function NotFound() {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      maxWidth: '600px',
      margin: '100px auto',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>404 - Page Not Found</h1>
        <p style={{ color: '#666', marginBottom: '24px' }}>The page you&apos;re looking for doesn&apos;t exist.</p>
        <a href="/" style={{ color: '#1976d2', textDecoration: 'none' }}>Go home</a>
      </div>
    </div>
  );
}

