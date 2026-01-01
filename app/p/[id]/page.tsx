import { headers } from 'next/headers';
import {
  getPaste,
  isPasteAvailable,
  getCurrentTime,
  incrementViews
} from '@/lib/db';
import { notFound } from 'next/navigation';

async function getPasteData(id: string) {
  const paste = await getPaste(id);

  if (!paste) {
    return null;
  }

  // Get current time (with test mode support)
  const testMode = process.env.TEST_MODE === '1';
  const headersList = await headers();
  const testNowMs = headersList.get('x-test-now-ms');
  const now = getCurrentTime(testMode, testNowMs);

  // Check if paste is available (before incrementing)
  const availability = isPasteAvailable(paste, now);
  if (!availability.available) {
    return null;
  }

  // Increment view count (HTML views also count)
  // Note: There's a small race condition window here, but acceptable for this implementation
  await incrementViews(id);

  // Re-fetch to get updated paste
  return await getPaste(id);
}

export default async function PastePage({
  params,
}: {
  params: { id: string };
}) {
  const paste = await getPasteData(params.id);

  if (!paste) {
    notFound();
  }

  // Escape HTML to prevent XSS
  const escapeHtml = (text: string) => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  };

  const escapedContent = escapeHtml(paste.content);
  const formattedContent = escapedContent.replace(/\n/g, '<br />');

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #e0e0e0',
        }}>
          <h1 style={{ margin: 0, fontSize: '18px', color: '#666' }}>Paste #{params.id}</h1>
        </div>
        <div
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            fontFamily: '"Courier New", monospace',
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#333',
          }}
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </div>
    </div>
  );
}

