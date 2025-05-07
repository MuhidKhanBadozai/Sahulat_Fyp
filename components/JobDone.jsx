import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Adjust this import based on your project

const JobDone = ({ route }) => {
  const { jobId, userType } = route.params; // Pass these from previous screen
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobDonePressed, setJobDonePressed] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const jobRef = doc(db, 'jobs', jobId);
      const jobSnap = await getDoc(jobRef);
      if (jobSnap.exists()) {
        setStatus(jobSnap.data());
      }
    } catch (err) {
      console.error('Error fetching job status:', err);
    }
    setLoading(false);
  };

  const handleJobDone = async () => {
    if (!status) return;
    const jobRef = doc(db, 'jobs', jobId);
    const updateField =
      userType === 'provider' ? { providerJobDone: true } : { customerJobDone: true };

    await updateDoc(jobRef, updateField);
    setJobDonePressed(true);
    fetchStatus();
  };

  const renderMessage = () => {
    if (!status) return null;

    const { providerJobDone, customerJobDone, amount } = status;

    if (providerJobDone && customerJobDone) {
      return (
        <Text style={styles.finalMessage}>
          ✅ Job Done. Customer paid Rs. {amount} to the service provider.
        </Text>
      );
    }

    if (userType === 'provider') {
      if (providerJobDone) {
        return <Text style={styles.waitingMessage}>⏳ Waiting for customer to finish the job...</Text>;
      } else {
        return null;
      }
    } else {
      if (customerJobDone) {
        return <Text style={styles.waitingMessage}>⏳ Waiting for provider to finish the job...</Text>;
      } else {
        return null;
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#FF8C00" />
      ) : (
        <>
          {renderMessage()}
          {!jobDonePressed && (
            <TouchableOpacity style={styles.button} onPress={handleJobDone}>
              <Text style={styles.buttonText}>Job Done</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  waitingMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  finalMessage: {
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default JobDone;
