import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    providerPhone: routePhone,
    providerBid,
    jobTitle,
  } = route?.params || {};

  const isServiceProvider = currentUser?.uid === providerId;

  if (isServiceProvider && (!customerId || !providerId || !jobTitle)) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Missing parameters!</Text>
      </View>
    );
  }

  const chatPartnerId = currentUser.uid === customerId ? providerId : customerId;
  const chatPartnerName = currentUser.uid === customerId ? providerName : customerName;
  const senderId = currentUser?.uid || 'unknown_user';
  const jobId = `${customerId}_${providerId}_${jobTitle.replace(/\s+/g, '_')}`;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [jobStatus, setJobStatus] = useState({ customerConfirmed: false, providerConfirmed: false });
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [fetchedPhone, setFetchedPhone] = useState(routePhone || '');

  useEffect(() => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

    if (!routePhone && providerId) {
      const fetchPhone = async () => {
        try {
          const providerRef = doc(db, 'service_providers', providerId);
          const providerSnap = await getDoc(providerRef);
          if (providerSnap.exists()) {
            const phone = providerSnap.data().phoneNumber;
            setFetchedPhone(phone);
          }
        } catch (err) {
          console.error('Error fetching phone:', err);
        }
      };
      fetchPhone();
    }

    return () => {
      unsubscribeMessages();
      unsubscribeJobStatus();
    };
  }, [senderId, chatPartnerId, jobId, providerId]);

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
    if (fetchedPhone) {
      await Clipboard.setStringAsync(fetchedPhone);
      Alert.alert('Copied', 'Phone number copied to clipboard!');
    } else {
      Alert.alert('Error', 'No phone number available.');
    }
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

      Alert.alert('Confirmation Sent', `Waiting for ${chatPartnerName} to confirm.`);
    } catch (error) {
      console.error('Error updating job status:', error);
      Alert.alert('Error', 'Failed to update job status.');
    }
  };

  const closeCompletionModal = () => {
    setShowCompletionModal(false);
    navigation.navigate('JobComplete', {
      customerName,
      providerName,
      providerBid,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>{jobTitle || 'Job Title'}</Text>
                <Text style={styles.subInfo}>You: {currentUser.email}</Text>
                <Text style={styles.subInfo}>With: {chatPartnerName}</Text>
                <Text style={styles.subInfo}>Bid: Rs {providerBid}</Text>
              </View>
              <TouchableOpacity onPress={copyPhoneToClipboard}>
                <Ionicons name="call" size={28} color="#32CD32" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={[...messages].reverse()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.from === senderId ? styles.sent : styles.received,
                  ]}
                >
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              )}
              contentContainerStyle={styles.chatBox}
              inverted
            />

            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor="#aaa"
                value={inputMessage}
                onChangeText={setInputMessage}
              />
              <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
                <Ionicons name="send" size={22} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.jobDoneButton} onPress={handleJobDone}>
              <Text style={styles.jobDoneButtonText}>Job Done</Text>
            </TouchableOpacity>

            <Modal visible={showCompletionModal} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>🎉 Job Completed!</Text>
                  <Text style={styles.modalText}>
                    Both customer and provider have confirmed the job.
                  </Text>
                  <TouchableOpacity style={styles.modalBtn} onPress={closeCompletionModal}>
                    <Text style={styles.modalBtnText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#333',
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    color: '#FFA500',
    fontWeight: 'bold',
  },
  subInfo: {
    fontSize: 14,
    color: '#FFA500',
    marginTop: 2,
  },
  chatBox: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  sent: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF8C00',
  },
  received: {
    alignSelf: 'flex-start',
    backgroundColor: '#333',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    borderRadius: 25,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    padding: 10,
    color: '#fff',
  },
  sendBtn: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 50,
    marginLeft: 6,
  },
  jobDoneButton: {
    backgroundColor: '#4CAF50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  jobDoneButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    padding: 24,
    borderRadius: 10,
    width: '85%',
  },
  modalTitle: {
    color: '#FFA500',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: '#FF8C00',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ChatUI;
