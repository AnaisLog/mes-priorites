import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBk4WdKRJoWhMTX1QtsnzaELJM-qzc_VxY",
  authDomain: "mes-priorites-17b2d.firebaseapp.com",
  projectId: "mes-priorites-17b2d",
  storageBucket: "mes-priorites-17b2d.firebasestorage.app",
  messagingSenderId: "256671407571",
  appId: "1:256671407571:web:cadcb6862246d1fe7d6326",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
const auth = getAuth(app);

// Connexion anonyme : nécessaire pour que les règles Firestore
// (allow read, write: if request.auth != null) acceptent les requêtes.
// C'est invisible pour l'utilisateur : pas de mot de passe, pas d'écran de login Firebase.
export function ensureSignedIn() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          signInAnonymously(auth).then(resolve).catch(reject);
        }
      },
      reject
    );
  });
}
