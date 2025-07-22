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
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  addDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const IncomingJobs = ({ route }) => {
  const { selectedCategory = "", userId = "", userName = "" } = route.params || {};
  const navigation = useNavigation();

  const [jobs, setJobs] = useState([]);
  const [providerData, setProviderData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidNotes, setBidNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingJobIndex, setLoadingJobIndex] = useState(-1); // For animation
  const fadeAnim = useRef([]); // Array of Animated.Value for each job

  useEffect(() => {
    console.log("🚀 Route Params -> userId:", userId);
    console.log("🚀 Route Params -> userName:", userName);
  }, [userId, userName]);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "service_providers", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.joinedDate?.seconds) {
              const date = new Date(data.joinedDate.seconds * 1000);
              data.formattedJoinedDate = date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            } else {
              data.formattedJoinedDate = "N/A";
            }
            setProviderData(data);
          } else {
            Alert.alert("Error", "No service provider data found.");
          }
        } else {
          Alert.alert("Error", "User is not authenticated.");
        }
      } catch (error) {
        console.error("Error fetching provider data:", error);
        Alert.alert("Error", error.message);
      }
    };

    fetchProviderData();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log("No authenticated user found.");
      return;
    }

    const acceptedBidsQuery = query(
      collection(db, "incoming_bids"),
      where("serviceProviderId", "==", user.uid)
    );

    const alertedBidIds = new Set();

    const unsubscribeAccepted = onSnapshot(
      acceptedBidsQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const bid = change.doc.data();
          if (
            bid.status === "accepted" &&
            !alertedBidIds.has(change.doc.id)
          ) {
            if (change.type === "added") {
              const now = Date.now();
              const bidTime = bid.timestamp?.seconds
                ? bid.timestamp.seconds * 1000
                : new Date(bid.timestamp).getTime();
              if (now - bidTime < 10000) {
                Alert.alert(
                  "🎉 Bid Accepted!",
                  `Your bid for "${bid.jobTitle}" has been accepted by the customer!`,
                  [
                    {
                      text: "Chat Now",
                      onPress: () =>
                        navigation.navigate("ChatUI", {
                          customerId: bid.customerId,
                          customerName: bid.customerName,
                          providerId: bid.serviceProviderId,
                          providerName: bid.serviceProviderName,
                          jobTitle: bid.jobTitle,
                          providerPhone: bid.serviceproviderPhoneNumber,
                          providerBid: bid.providerBid,
                        }),
                    },
                  ]
                );
                alertedBidIds.add(change.doc.id);
              }
            }
            if (
              change.type === "modified" &&
              change.oldIndex !== -1
            ) {
              Alert.alert(
                "🎉 Bid Accepted!",
                `Your bid for "${bid.jobTitle}" has been accepted by the customer!`,
                [
                  {
                    text: "Chat Now",
                    onPress: () =>
                      navigation.navigate("ChatUI", {
                        customerId: bid.customerId,
                        customerName: bid.customerName,
                        providerId: bid.serviceProviderId,
                        providerName: bid.serviceProviderName,
                        jobTitle: bid.jobTitle,
                        providerPhone: bid.serviceproviderPhoneNumber,
                        providerBid: bid.providerBid,
                      }),
                  },
                ]
              );
              alertedBidIds.add(change.doc.id);
            }
          }
        });
      },
      (error) => {
        console.error("Error listening for accepted bids:", error);
      }
    );

    return () => unsubscribeAccepted();
  }, [navigation]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setJobs([]);
    fadeAnim.current = [];
    setLoadingJobIndex(-1);

    const q = query(collection(db, "upcoming_jobs"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const jobsRaw = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          typeof data.category === "string" &&
          data.category.toLowerCase() === selectedCategory.toLowerCase()
        ) {
          jobsRaw.push({ id: docSnap.id, ...data });
        }
      });

      // For each job, check if it has an accepted bid
      const filteredJobs = [];
      fadeAnim.current = [];
      let index = 0;

      const loadJobsOneByOne = async () => {
        for (const job of jobsRaw) {
          setLoadingJobIndex(index);
          const bidsQuery = query(
            collection(db, "incoming_bids"),
            where("jobId", "==", job.id),
            where("status", "==", "accepted")
          );
          const bidsSnapshot = await getDocs(bidsQuery);
          if (bidsSnapshot.empty) {
            filteredJobs.push(job);
            fadeAnim.current[index] = new Animated.Value(-screenWidth); // Start off-screen left
            setJobs([...filteredJobs]); // Update jobs state to trigger render

            // Animate from left to right
            Animated.timing(fadeAnim.current[index], {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }).start();
            // Wait a bit before loading the next job for effect
            await new Promise((resolve) => setTimeout(resolve, 120));
            index++;
          }
        }
        setLoading(false);
        setLoadingJobIndex(-1);
      };

      loadJobsOneByOne();
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

    // Check if bid amount is at least 100 Rs
    if (parseFloat(bidAmount) < 100) {
      Alert.alert("Error", "Bid amount must be at least Rs 100");
      return;
    }

    setIsSubmitting(true);

    try {
      const bidData = {
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        customerId: selectedJob.userId,
        customerName: selectedJob.userName || "Customer",
        serviceProviderId: providerData.uid,
        serviceProviderName: userName || "No Name",
        providerBid: parseFloat(bidAmount),
        customerBid: null,
        bidNotes: bidNotes,
        timestamp: new Date(),
        status: "pending",
        category: selectedJob.category,
        jobLocation: selectedJob.location,
        serviceprovider: providerData.firstName + providerData.lastName,
        serviceproviderPhoneNumber: providerData.phoneNumber,
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
      <View style={styles.headerRow}>
        <Text style={styles.header}>Incoming Jobs - {selectedCategory}</Text>
        {loading && (
          <ActivityIndicator size="small" color="#FF9901" style={styles.loadingIndicator} />
        )}
      </View>

      {jobs.length === 0 && !loading ? (
        <Text style={styles.noJobsText}>No matching jobs available.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.jobsContainer}>
          {jobs.map((job, idx) => (
            <Animated.View
              key={job.id}
              style={[
                styles.jobCard,
                {
                  transform: [
                    {
                      translateX: fadeAnim.current[idx]
                        ? fadeAnim.current[idx]
                        : 0,
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
                  placeholder="Enter your bid amount (minimum Rs 100)"
                  value={bidAmount} 
                  onChangeText={(text) => {
                    // Remove commas and dots
                    const cleanedText = text.replace(/[,.]/g, '');
                    setBidAmount(cleanedText);
                  }}
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
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  header: {
    color: "#FF9901",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  loadingIndicator: {
    position: "absolute",
    right: 0,
    top: 0,
    marginRight: 10,
    marginTop: 2,
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
