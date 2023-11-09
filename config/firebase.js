import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

   const firebaseConfig = {
    apiKey: "AIzaSyCSlI8MQg3LMfZYvwJ_XjESYChQOelxPu0",
    authDomain: "chatme-a94af.firebaseapp.com",
    projectId: "chatme-a94af",
    storageBucket: "chatme-a94af.appspot.com",
    messagingSenderId: "184326536003",
    appId: "1:184326536003:web:a41d6cb92abc9d9bc0cdf6",
    measurementId: "G-C2394634VJ"
  };

  const FIREBASE_APP = initializeApp(firebaseConfig);
  const auth = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  
  export const FIREBASE_DB = getFirestore(FIREBASE_APP);
  export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
  export const FIREBASE_AUTH = auth;