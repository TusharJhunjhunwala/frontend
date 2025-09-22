import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-3801212148-94fe4",
  "appId": "1:935083823794:web:3f27f61e93123ab735afab",
  "apiKey": "AIzaSyA-gUyvuAdKFrrZdcEyViD6IuNJizTgACc",
  "authDomain": "studio-3801212148-94fe4.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "935083823794"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
