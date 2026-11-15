import { NextRequest, NextResponse } from 'next/server';
import { generateStickerCard } from '@/ai/flows/generate-sticker-card';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const description = String(body?.description || '').trim();
    const message = String(body?.message || '');

    if (!description) {
      return NextResponse.json({ error: 'Sticker description is required.' }, { status: 400 });
    }

    const result = await generateStickerCard({ description, message });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API generate-sticker error:', err);
    return NextResponse.json(
      { error: err?.message || 'Sticker generation failed on server.' },
      { status: 500 }
    );
  }
}
