export default function NotFound() {
  return (
    <html>
      <head>
        <title>Paste Not Found</title>
        <meta charSet="utf-8" />
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 600px;
            margin: 100px auto;
            padding: 20px;
            text-align: center;
            background-color: #f5f5f5;
          }
          .error-container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          h1 {
            color: #d32f2f;
            margin-bottom: 16px;
          }
          p {
            color: #666;
            margin-bottom: 24px;
          }
          a {
            color: #1976d2;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        `}</style>
      </head>
      <body>
        <div className="error-container">
          <h1>404 - Paste Not Found</h1>
          <p>The paste you're looking for doesn't exist, has expired, or has reached its view limit.</p>
          <a href="/">Create a new paste</a>
        </div>
      </body>
    </html>
  );
}

