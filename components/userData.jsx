import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

export function useUserData() {
  const auth = getAuth();
  const db = getFirestore();

  const [userData, setUserData] = useState(null);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });

    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (uid) {
      const userDocRef = doc(db, 'User', uid);

      const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setUserData(null);
        }
      });

      return () => unsubscribeFirestore();
    }
  }, [uid]);

  return { userData, uid };
}
