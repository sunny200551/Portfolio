import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let db: any = null;
let app: any = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Firebase, falling back to simulated mode:", error);
  }
} else {
  console.warn("Firebase credentials missing in .env. Falling back to simulated local database (localStorage).");
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp?: any;
}

/**
 * Saves a contact message to Firestore or fallbacks to LocalStorage
 */
export async function saveContactMessage(data: ContactMessage): Promise<{ success: boolean; id?: string; error?: string }> {
  if (db) {
    try {
      const docRef = await addDoc(collection(db, "contacts"), {
        ...data,
        timestamp: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Firestore submission failed:", error);
      return { success: false, error: error.message };
    }
  } else {
    // Simulated Firestore local storage backup
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const key = 'sunny_portfolio_contacts';
          const existing = localStorage.getItem(key);
          const messages = existing ? JSON.parse(existing) : [];
          const mockId = `mock-doc-${Math.random().toString(36).substring(2, 11)}`;
          
          messages.push({
            id: mockId,
            ...data,
            timestamp: new Date().toISOString()
          });
          
          localStorage.setItem(key, JSON.stringify(messages));
          console.log("Contact message simulated & saved locally:", { id: mockId, ...data });
          resolve({ success: true, id: mockId });
        } catch (e: any) {
          resolve({ success: false, error: e.message });
        }
      }, 800); // Simulate network latency
    });
  }
}

export { app, db };
