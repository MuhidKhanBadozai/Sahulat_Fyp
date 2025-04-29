// components/NotificationListener.js
import { useEffect } from 'react';
import { onSnapshot, collection, query, where } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { Alert } from 'react-native';

const NotificationListener = () => {
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, 'upcoming_jobs'),
          where('serviceCategory', '!=', null)
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const job = change.doc.data();
              if (job && job.title && job.location) {
                Alert.alert(
                  'New Job Available',
                  `${job.title} at ${job.location}`,
                  [{ text: 'OK' }]
                );
              }
            }
          });
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return null;
};

export default NotificationListener;
