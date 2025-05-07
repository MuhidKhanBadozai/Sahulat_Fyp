import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';

import { auth, db } from './firebaseConfig';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

const ChatUI = ({ route }) => {
  const navigation = useNavigation();
  const currentUser = auth.currentUser;
  const {
    customerId,
    customerName,
    providerId,
    providerName,
    providerPhone,
    providerBid,
    jobTitle,
  } = route?.params || {};

  const isServiceProvider = currentUser?.uid === providerId;

  if (isServiceProvider && (!customerId || !providerId || !jobTitle)) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error: Missing parameters! Please ensure the correct data is passed.
        </Text>
      </View>
    );
  }

  const chatPartnerId = currentUser.uid === customerId ? providerId : customerId;
  const chatPartnerName = currentUser.uid === customerId ? providerName : customerName;
  const senderId = currentUser?.uid || 'unknown_user';

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [jobStatus, setJobStatus] = useState({
    customerConfirmed: false,
    providerConfirmed: false,
  });
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const jobId = `${customerId}_${providerId}_${jobTitle.replace(/\s+/g, '_')}`;

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredMessages = fetchedMessages.filter(
        (msg) =>
          (msg.from === senderId && msg.to === chatPartnerId) ||
          (msg.from === chatPartnerId && msg.to === senderId)
      );

      setMessages(filteredMessages);
    });

    const jobStatusRef = doc(db, 'jobStatus', jobId);
    const unsubscribeJobStatus = onSnapshot(jobStatusRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        setJobStatus(docSnapshot.data());
        if (docSnapshot.data().customerConfirmed && docSnapshot.data().providerConfirmed) {
          setShowCompletionModal(true);
        }
      }
    });

    return () => {
      unsubscribeMessages();
      unsubscribeJobStatus();
    };
  }, [senderId, chatPartnerId, jobId]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        from: senderId,
        to: chatPartnerId,
        text: inputMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const copyPhoneToClipboard = async () => {
    if (providerPhone) {
      await Clipboard.setStringAsync(providerPhone);
      Alert.alert('Copied', 'Phone number copied to clipboard!');
    } else {
      Alert.alert('Error', 'No phone number available.');
    }
  };

  const goToMapScreen = () => {
    navigation.navigate('MapScreen');
  };

  const handleJobDone = async () => {
    try {
      const jobStatusRef = doc(db, 'jobStatus', jobId);
      const currentStatus = (await getDoc(jobStatusRef)).data() || {
        customerConfirmed: false,
        providerConfirmed: false,
      };

      const update = {
        customerConfirmed: currentUser.uid === customerId ? true : currentStatus.customerConfirmed,
        providerConfirmed: currentUser.uid === providerId ? true : currentStatus.providerConfirmed,
      };

      await setDoc(jobStatusRef, update, { merge: true });

      Alert.alert(
        'Confirmation Sent',
        `Waiting for ${currentUser.uid === customerId ? providerName : customerName} to confirm.`
      );
    } catch (error) {
      console.error('Error updating job status:', error);
      Alert.alert('Error', 'Failed to update job status.');
    }
  };

  const closeCompletionModal = () => {
    setShowCompletionModal(false);

    // Show payment reminder popup to the customer
    if (currentUser.uid === customerId) {
      Alert.alert(
        'Payment Reminder',
        `Please pay Rs ${providerBid} to the service provider.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chat about: {jobTitle || 'Job'}</Text>
          <Text style={styles.info}>You: {currentUser.email}</Text>
          <Text style={styles.info}>
            Talking to: {chatPartnerName || 'Unknown'}
          </Text>
        </View>

        <View style={styles.iconGroup}>
          <TouchableOpacity onPress={copyPhoneToClipboard} style={styles.iconBtn}>
            <Ionicons name="call" size={28} color="limegreen" />
          </TouchableOpacity>

          {/* <TouchableOpacity onPress={goToMapScreen} style={styles.iconBtn}>
            <Ionicons name="location-outline" size={28} color="#00BFFF" />
          </TouchableOpacity> */}
        </View>
      </View>

      <FlatList
        data={[...messages].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text
            style={[
              styles.message,
              item.from === senderId ? styles.sent : styles.received,
            ]}
          >
            {item.text}
          </Text>
        )}
        contentContainerStyle={styles.chatBox}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <Button title="Send" onPress={sendMessage} />
      </View>

      <TouchableOpacity style={styles.jobDoneButton} onPress={handleJobDone}>
        <Text style={styles.jobDoneButtonText}>Job Done</Text>
      </TouchableOpacity>

      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Job Completed!</Text>
            <Text style={styles.modalText}>
              Both parties have confirmed the job is complete.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeCompletionModal}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    paddingTop: 50,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconGroup: {
    flexDirection: 'row',
  },
  iconBtn: {
    marginLeft: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFA500',
    marginBottom: 4,
  },
  info: {
    fontSize: 16,
    color: '#FFA500',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  chatBox: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  message: {
    fontSize: 16,
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: '80%',
    color: '#fff',
  },
  sent: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF8C00',
  },
  received: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopColor: '#444',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  jobDoneButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  jobDoneButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    color: '#FFA500',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FF8C00',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatUI; 