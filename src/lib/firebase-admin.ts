import * as admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import type { Storage } from 'firebase-admin/storage';

function initializeFirebaseAdmin() {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        if (!admin.apps.length) {
            try {
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
                });
            } catch (error) {
                console.log('Firebase admin initialization error', error);
            }
        }
    }
}

function getDb(): Firestore {
    initializeFirebaseAdmin();
    return admin.firestore();
}

function getStorage(): Storage {
    initializeFirebaseAdmin();
    return admin.storage();
}

export { getDb, getStorage };
