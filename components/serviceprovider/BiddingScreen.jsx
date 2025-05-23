import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db,auth } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const BiddingScreen = ({ route }) => {
  const {
    jobId = "",
    jobTitle = "Unknown",
    category = "Uncategorized",
    customerId = auth.currentUser?.uid,
    customerName = "Customer",
  } = route.params || {};

  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [ratings, setRatings] = useState({});

  const navigation = useNavigation();

  useEffect(() => {
    if (!jobId) return;

    const bidsRef = query(
      collection(db, "incoming_bids"),
      where("jobId", "==", jobId)
    );

    const unsubscribe = onSnapshot(
      bidsRef,
      async (snapshot) => {
        const bidsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBids(bidsData);
        await fetchServiceProviderRatings(bidsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching bids:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [jobId]);

  const fetchServiceProviderRatings = async (bidsData) => {
    const ratingPromises = bidsData.map(async (bid) => {
      if (!bid.serviceProviderId) return null;
      try {
        const docRef = doc(db, "service_providers", bid.serviceProviderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return {
            id: bid.serviceProviderId,
            rating: docSnap.data().rating || "No rating",
          };
        }
      } catch (error) {
        console.error(`Error fetching rating for ${bid.serviceProviderId}:`, error);
      }
      return { id: bid.serviceProviderId, rating: "Unavailable" };
    });

    const results = await Promise.all(ratingPromises);
    const ratingsMap = {};
    results.forEach((result) => {
      if (result) ratingsMap[result.id] = result.rating;
    });
    setRatings(ratingsMap);
  };

  const viewBidDetails = (bid) => {
    setSelectedBid(bid);
    setModalVisible(true);
  };

  const acceptBid = async () => {
    if (!selectedBid?.id) return;

    try {
      const bidRef = doc(db, "incoming_bids", selectedBid.id);

      await updateDoc(bidRef, {
        status: "accepted",
      });

      Alert.alert(
        "🎉 Bid Accepted!",
        `You have accepted the bid by "${selectedBid.serviceprovider}"`,
        [
          {
            text: "Go to Chat",
            onPress: () => {
              navigation.navigate("ChatUI", {
                customerId: customerId,
                customerName: customerName,
                providerId: selectedBid.serviceProviderId,
                providerName: selectedBid.serviceprovider,
                jobTitle: selectedBid.jobTitle || jobTitle,
                providerPhone: selectedBid.providerPhone,
                providerBid: selectedBid.providerBid,
              });
            },
          },

        ]
      );

      setModalVisible(false);
    } catch (error) {
      console.error("Error updating bid:", error);
      Alert.alert("Error", "Failed to accept the bid.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Current Job</Text>
      <View style={styles.jobInfo}>
        <Text style={styles.title}>{jobTitle}</Text>
        <Text style={styles.category}>{category}</Text>
      </View>

      <Text style={styles.subHeader}>Bids ({bids.length})</Text>

      {loading ? (
        <ActivityIndicator color="#FF9901" size="large" />
      ) : bids.length === 0 ? (
        <Text style={styles.noBidsText}>No bids placed yet.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.bidsList}>
          {bids.map((bid) => (
            <TouchableOpacity
              key={bid.id}
              style={styles.bidCard}
              onPress={() => viewBidDetails(bid)}
            >
              <View style={styles.bidHeader}>
                <Text style={styles.bidProvider}>
                  {bid.serviceprovider || "Service Provider"}
                </Text>
                <Text style={styles.bidAmount}>Rs {bid.providerBid}</Text>
              </View>
              {bid.bidNotes && <Text style={styles.notes}>{bid.bidNotes}</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedBid && (
              <>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidLabel}>Service Provider:</Text>
                  <Text style={styles.bidValue}>{selectedBid.serviceprovider}</Text>

                  {/* <Text style={styles.bidLabel}>Service Provider Rating:</Text>
                  <Text style={styles.bidValue}>
                    {ratings[selectedBid.serviceProviderId] ?? "Loading..."}
                  </Text> */}

                  <Text style={styles.bidLabel}>Bid Amount:</Text>
                  <Text style={styles.bidValue}>Rs {selectedBid.providerBid}</Text>

                  {selectedBid.bidNotes && (
                    <>
                      <Text style={styles.bidLabel}>Notes:</Text>
                      <Text style={styles.bidNotes}>{selectedBid.bidNotes}</Text>
                    </>
                  )}
                </View>

                <TouchableOpacity style={styles.acceptButton} onPress={acceptBid}>
                  <Text style={styles.acceptButtonText}>Accept Bid</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF9901",
    marginBottom: 10,
  },
  jobInfo: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  category: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 5,
  },
  subHeader: {
    color: "#FF9901",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  noBidsText: {
    color: "#888",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  bidsList: {
    gap: 10,
    paddingBottom: 30,
  },
  bidCard: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  bidHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  bidProvider: {
    color: "#FF9901",
    fontSize: 16,
    fontWeight: "600",
  },
  bidAmount: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
  },
  notes: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: "#222",
    width: "90%",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  bidInfo: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  bidLabel: {
    color: "#FF9901",
    fontSize: 14,
    marginBottom: 5,
  },
  bidValue: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  bidNotes: {
    color: "#ccc",
    fontSize: 14,
  },
  acceptButton: {
    backgroundColor: "#FF9901",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  acceptButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#FF9901",
    fontSize: 16,
  },
});

export default BiddingScreen;
