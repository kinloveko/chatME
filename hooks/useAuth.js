import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../config/firebase';
import { doc, updateDoc,getDoc,setDoc } from 'firebase/firestore';
import { AppState, Platform } from 'react-native';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = FIREBASE_AUTH;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        // Update isOnline to "true" when the user is authenticated
        updateUserStatus('true');
      }
    });

    const handleAppStateChange = (nextAppState) => {
      if (user) {
        const isAppActive = nextAppState === 'active';
        const isOnlineStatus = isAppActive ? 'true' : 'false';

        // Update isOnline based on app state
        updateUserStatus(isOnlineStatus);
      }
    };

    // Subscribe to app state changes
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      // Unsubscribe from Firebase listeners and app state changes when the component unmounts
      unsubscribeAuth();
      if (AppState.removeEventListener) {
        AppState.removeEventListener('change', handleAppStateChange);

        if (Platform.OS === 'android') {
          // Clean up background subscription on Android
          AppState.removeEventListener('blur', handleAppStateChange);
          AppState.removeEventListener('focus', handleAppStateChange);
        }
      }
    };
  }, [user]);
  const updateUserStatus = async (isOnlineStatus) => {
    try {
      if (user) {
        const userDocRef = doc(FIREBASE_DB, 'User', user.uid);
  
        // Check if the document exists
        const userDocSnapshot = await getDoc(userDocRef);
  
        if (userDocSnapshot.exists()) {
          // Update the isOnline field in Firestore
          await updateDoc(userDocRef, {
            isOnline: isOnlineStatus,
          });
        } else {
          // Document doesn't exist, create it with default values
          await setDoc(userDocRef, {
            isOnline: isOnlineStatus,
            // Add other default fields if needed
          });
        }
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };
  
  return { user, loading };
}
