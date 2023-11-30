import { initializeApp } from 'firebase/app';
import {  initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDTHgIiQ9e5nIIj0sJQlwGXr1DLCR7kbqA",
  authDomain: "chat-me-app-2023.firebaseapp.com",
  projectId: "chat-me-app-2023",
  storageBucket: "chat-me-app-2023.appspot.com",
  messagingSenderId: "731825114045",
  appId: "1:731825114045:web:5153f3d29684624af7e0d4",
  measurementId: "G-55FDBJX05K"
};

  const FIREBASE_APP = initializeApp(firebaseConfig);
  const auth = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  
  export const FIREBASE_DB = getFirestore(FIREBASE_APP);
  export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
  export const FIREBASE_AUTH = auth;