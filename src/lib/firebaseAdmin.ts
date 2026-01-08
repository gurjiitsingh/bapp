// src/lib/firebaseAdmin.ts

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import path from "path";

const relativePath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH;
const serviceAccountPath = path.join(process.cwd(), relativePath || "firebase-service-account.json");



if (!getApps().length) {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
  initializeApp({
    credential: cert(serviceAccount),
  });
}

export const adminDb = getFirestore();


// lib/firebase/admin.ts
// import admin from "firebase-admin";
// import { readFileSync } from "fs";

// const serviceAccountPath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH!;

// // Read and parse the JSON
// const serviceAccount = JSON.parse(
//   readFileSync(serviceAccountPath, "utf-8")
// );

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// const db = admin.firestore();
// const auth = admin.auth();

// export { admin, db, auth };


// lib/firebaseAdmin.ts
// import { initializeApp, cert, getApps } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";

// const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS!);

// const app = getApps().length === 0
//   ? initializeApp({ credential: cert(serviceAccount) })
//   : getApps()[0];

// export const adminDb = getFirestore(app);
