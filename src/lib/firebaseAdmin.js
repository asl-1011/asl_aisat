import admin from "firebase-admin";

// ✅ Ensure Firebase Admin is initialized only once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Handle multiline key
      }),
    });
    console.log("✅ Firebase Admin Initialized Successfully");
  } catch (error) {
    console.error("🔥 Firebase Admin Initialization Error:", error);
  }
}

// ✅ Firestore instance from Firebase Admin (NOT from `firebase/firestore`)
export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
