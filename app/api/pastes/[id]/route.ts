import { NextRequest, NextResponse } from 'next/server';
import {
  getPaste,
  incrementViews,
  isPasteAvailable,
  getCurrentTime
} from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const paste = await getPaste(id);

    if (!paste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    // Get current time (with test mode support)
    const testMode = process.env.TEST_MODE === '1';
    const testNowMs = request.headers.get('x-test-now-ms');
    const now = getCurrentTime(testMode, testNowMs);

    // Check if paste is available (before incrementing)
    const availability = isPasteAvailable(paste, now);
    if (!availability.available) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    // Increment view count (this happens after availability check)
    // Note: There's a small race condition window here, but acceptable for this implementation
    await incrementViews(id);

    // Re-fetch to get updated view count
    const updatedPaste = await getPaste(id);
    if (!updatedPaste) {
      return NextResponse.json(
        { error: 'Paste not found' },
        { status: 404 }
      );
    }

    // Calculate remaining views
    const remainingViews =
      updatedPaste.max_views !== null
        ? Math.max(0, updatedPaste.max_views - updatedPaste.current_views)
        : null;

    // Calculate expires_at
    const expiresAt =
      updatedPaste.ttl_seconds !== null
        ? new Date(updatedPaste.created_at + updatedPaste.ttl_seconds * 1000).toISOString()
        : null;

    return NextResponse.json({
      content: updatedPaste.content,
      remaining_views: remainingViews,
      expires_at: expiresAt
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

