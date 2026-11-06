import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { Firestore, FieldValue } from 'firebase/firestore';

// Environment variables configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if valid firebase configurations exist
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let db: Firestore | null = null;
let app: FirebaseApp | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp?: FieldValue | string;
}

/**
 * Saves a contact message to Firestore or fallbacks to an explicit offline LocalStorage draft
 */
export async function saveContactMessage(data: ContactMessage): Promise<{
  success: boolean;
  id?: string;
  isOfflineDraft?: boolean;
  error?: string;
}> {
  if (db) {
    try {
      const docRef = await addDoc(collection(db, "contacts"), {
        ...data,
        timestamp: serverTimestamp()
      });
      return { success: true, id: docRef.id, isOfflineDraft: false };
    } catch (error: unknown) {
      const err = error as Error;
      return { success: false, error: err.message || 'Failed to submit to Firestore.' };
    }
  } else {
    // Explicit offline draft storage when Firebase credentials are omitted
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const key = 'sunny_portfolio_contacts_drafts';
          const existing = localStorage.getItem(key);
          const messages = existing ? JSON.parse(existing) : [];
          const mockId = `draft-${Math.random().toString(36).substring(2, 10)}`;
          
          messages.push({
            id: mockId,
            ...data,
            timestamp: new Date().toISOString()
          });
          
          localStorage.setItem(key, JSON.stringify(messages));
          resolve({ success: true, id: mockId, isOfflineDraft: true });
        } catch (e: unknown) {
          const err = e as Error;
          resolve({ success: false, error: err.message || 'Offline draft storage failed.' });
        }
      }, 400);
    });
  }
}

export { app, db };
