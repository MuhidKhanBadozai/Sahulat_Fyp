import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Animated,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const screenWidth = Dimensions.get("window").width;

const IncomingJobs = ({ route }) => {
  const { selectedCategory = "", userId = "", userName = "" } = route.params || {};

  // ✅ Debugging values
  useEffect(() => {
    console.log("🚀 Route Params -> userId:", userId);
    console.log("🚀 Route Params -> userName:", userName);
  }, []);

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidNotes, setBidNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const q = query(collection(db, "upcoming_jobs"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          typeof data.category === "string" &&
          data.category.toLowerCase() === selectedCategory.toLowerCase()
        ) {
          jobList.push({ id: doc.id, ...data });
        }
      });
      setJobs(jobList);

      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  const handleJobPress = (job) => {
    setSelectedJob(job);
    setBidAmount("");
    setBidNotes("");
  };

  const closeModal = () => {
    setSelectedJob(null);
  };

  const handlePlaceBid = async () => {
    if (!bidAmount) {
      Alert.alert("Error", "Please enter your bid amount");
      return;
    }

    if (isNaN(bidAmount)) {
      Alert.alert("Error", "Please enter a valid number for bid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const bidData = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        customerId: selectedJob.userId,
        customerName: selectedJob.userName || "Customer",
        serviceProviderId: userId,
        serviceProviderName: userName || "No Name", // ✅ fixed fallback
        providerBid: parseFloat(bidAmount),
        customerBid: null,
        bidNotes: bidNotes,
        timestamp: new Date(),
        status: "pending",
        category: selectedJob.category,
        jobLocation: selectedJob.location,
      };

      await addDoc(collection(db, "incoming_bids"), bidData);

      Alert.alert("Success", `Bid of Rs ${bidAmount} placed successfully!`);
      closeModal();
    } catch (error) {
      console.error("Error placing bid:", error);
      Alert.alert("Error", "Failed to place bid. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Incoming Jobs - {selectedCategory}</Text>

      {jobs.length === 0 ? (
        <Text style={styles.noJobsText}>No matching jobs available.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.jobsContainer}>
          {jobs.map((job) => (
            <Animated.View
              key={job.id}
              style={[
                styles.jobCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity onPress={() => handleJobPress(job)}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.customerName}>Posted by: {job.userName || "Customer"}</Text>
                <Text style={styles.jobLocation}>{job.location}</Text>
                <Text style={styles.jobDescription} numberOfLines={2}>
                  {job.description}
                </Text>
                <Text style={styles.jobPrice}>Customer's Budget: Rs {job.price}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      )}

      <Modal visible={!!selectedJob} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedJob?.title}</Text>
              <Text style={styles.customerName}>Posted by: {selectedJob?.userName || "Customer"}</Text>
              <Text style={styles.modalText}>Location: {selectedJob?.location}</Text>
              <Text style={styles.modalText}>Category: {selectedJob?.category}</Text>
              <Text style={styles.modalText}>Description: {selectedJob?.description}</Text>
              <Text style={styles.modalText}>Customer's Budget: Rs {selectedJob?.price}</Text>

              <View style={styles.bidForm}>
                <Text style={styles.bidLabel}>Your Bid Amount (Rs)</Text>
                <TextInput
                  style={styles.bidInput}
                  keyboardType="numeric"
                  placeholder="Enter your bid amount"
                  value={bidAmount}
                  onChangeText={setBidAmount}
                />

                <Text style={styles.bidLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.bidInput, styles.notesInput]}
                  multiline
                  placeholder="Any additional notes for the customer"
                  value={bidNotes}
                  onChangeText={setBidNotes}
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.bidButton, isSubmitting && styles.disabledButton]}
              onPress={handlePlaceBid}
              disabled={isSubmitting}
            >
              <Text style={styles.bidButtonText}>
                {isSubmitting ? "Submitting..." : "Place Bid"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
              disabled={isSubmitting}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#000",
  },
  header: {
    color: "#FF9901",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  jobsContainer: {
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  jobTitle: {
    color: "#FF9901",
    fontSize: 16,
    fontWeight: "bold",
  },
  customerName: {
    color: "#FF9901",
    fontSize: 14,
    marginTop: 3,
    fontStyle: "italic",
  },
  jobLocation: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 5,
  },
  jobDescription: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 5,
  },
  jobPrice: {
    color: "#4CAF50",
    fontSize: 14,
    marginTop: 5,
    fontWeight: "bold",
  },
  noJobsText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  bidForm: {
    marginTop: 15,
  },
  bidLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  bidInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  bidButton: {
    backgroundColor: "#FF9901",
    padding: 12,
    marginTop: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  bidButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  closeButton: {
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FF9901",
    fontSize: 16,
  },
});

export default IncomingJobs;
