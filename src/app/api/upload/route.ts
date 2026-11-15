import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  try {
    const authToken = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decodedToken = await getAuth().verifyIdToken(authToken);
    const userId = decodedToken.uid;

    const { dataUri } = await request.json();
    if (!dataUri) {
      return NextResponse.json({ error: 'No data URI provided' }, { status: 400 });
    }

    const matches = dataUri.match(/^data:(.*);base64,(.*)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ error: 'Invalid data URI format' }, { status: 400 });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const fileExtension = mimeType.split('/')[1] || 'png';
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;
    const file = getStorage().bucket().file(fileName);

    await file.save(buffer, {
      metadata: {
        contentType: mimeType,
      },
    });

    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-09-2491', // Far future expiration
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload failed:', error);
    if (error instanceof Error && 'code' in error && error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Authentication token has expired.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
