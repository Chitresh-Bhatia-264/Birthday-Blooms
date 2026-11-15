import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/ai/flows/generate-image';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const theme = String(body?.theme || '').trim();
    const message = String(body?.message || '').trim();
    const fontStyle = body?.fontStyle || 'modern';

    if (!theme || !message) {
      return NextResponse.json({ error: 'Theme and message are required.' }, { status: 400 });
    }

    const result = await generateImage({ theme, message, fontStyle });
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('API generate-card error:', err);
    return NextResponse.json(
      { error: err?.message || 'Card generation failed on server.' },
      { status: 500 }
    );
  }
}
