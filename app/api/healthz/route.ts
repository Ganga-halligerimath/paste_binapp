import { NextResponse } from 'next/server';
import { getPaste } from '@/lib/db';

export async function GET() {
  try {
    // Check if database is accessible
    await getPaste('test');
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

