import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

    apiKey: process.env.API_KEY || "",
  
    authDomain: process.env.AUTH_DOMAIN || "",
  
    databaseURL: process.env.DATABASE_URL || "",
  
    projectId: "quest-map-59d3e",
  
    storageBucket: process.env.STORAGE_BUCKET || "",
  
    messagingSenderId: process.env.MESSAGING_SENDER_ID || "",
  
    appId: process.env.APP_ID || "",
  
    measurementId: process.env.MEASUREMENT_ID || ""
  
  };
  
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db} ;