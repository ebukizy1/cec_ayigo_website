import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
  const normalizedKey = rawKey
    .replace(/^"+|"+$/g, "") // strip surrounding quotes if present
    .replace(/\\n/g, "\n");  // convert escaped newlines

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizedKey,
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const realTimeDb = admin.database();

export { admin, db, auth, storage, realTimeDb };
