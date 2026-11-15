'use server';

import { getDb } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export interface Creation {
    id?: string;
    userId: string;
    title: string;
    imageUrl: string;
    theme: string;
    message: string;
    fontStyle: string;
    createdAt: number;
}

export async function addCreation(creation: Omit<Creation, 'id' | 'createdAt' | 'userId'>, userId: string): Promise<Creation> {
    const db = getDb();
    const newCreation: Omit<Creation, 'id'> = {
        ...creation,
        userId,
        createdAt: Date.now(),
    };
    const docRef = await db.collection('creations').add(newCreation);
    revalidatePath('/dashboard');
    return { id: docRef.id, ...newCreation };
}

export async function getCreations(userId: string): Promise<Creation[]> {
    const db = getDb();
    const snapshot = await db.collection('creations')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

    if (snapshot.empty) {
        return [];
    }

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Creation));
}
