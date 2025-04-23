import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Image,
  Alert
} from "react-native";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const BiddingScreen = ({ route }) => {
  const { jobId = "", jobTitle = "Unknown", category = "Uncategorized" } = route.params || {};
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);
  const [providerDetails, setProviderDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const bidsRef = query(
      collection(db, "incoming_bids"),
      where("jobId", "==", jobId)
    );

    const unsubscribe = onSnapshot(
      bidsRef,
      async (snapshot) => {
        const bidsData = await Promise.all(snapshot.docs.map(async (doc) => {
          const bidData = doc.data();
          // Fetch provider name if not available
          if (!bidData.serviceProviderName) {
            const providerDoc = await getDoc(doc(db, "service_providers", bidData.serviceProviderId));
            if (providerDoc.exists()) {
              bidData.serviceProviderName = `${providerDoc.data().firstName} ${providerDoc.data().lastName}`;
            }
          }
          return {
            id: doc.id,
            ...bidData
          };
        }));
        setBids(bidsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching bids:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [jobId]);

  const viewBidDetails = async (bid) => {
    setSelectedBid(bid);
    try {
      const providerDoc = await getDoc(doc(db, "service_providers", bid.serviceProviderId));
      if (providerDoc.exists()) {
        setProviderDetails(providerDoc.data());
      }
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching provider details:", error);
    }
  };

  const acceptBid = () => {
    // Implement bid acceptance logic here
    Alert.alert("Bid Accepted", "You have accepted this bid!");
    setModalVisible(false);
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
                <Text style={styles.bidProvider}>{bid.serviceProviderName || "Service Provider"}</Text>
                <Text style={styles.bidAmount}>Rs {bid.providerBid}</Text>
              </View>
              {bid.bidNotes && <Text style={styles.notes}>{bid.bidNotes}</Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Bid Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {providerDetails && (
              <>
                <View style={styles.profileHeader}>
                  <Image
                    source={{ uri: providerDetails.profileImage || "https://via.placeholder.com/80" }}
                    style={styles.profileImage}
                  />
                  <Text style={styles.providerName}>
                    {providerDetails.firstName} {providerDetails.lastName}
                  </Text>
                  <Text style={styles.providerRating}>
                    ⭐ {providerDetails.averageRating?.toFixed(1) || "5.0"} ({providerDetails.totalReviews || 0} reviews)
                  </Text>
                </View>

                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="phone" size={20} color="#FF9901" />
                    <Text style={styles.detailText}>{providerDetails.phoneNumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="badge" size={20} color="#FF9901" />
                    <Text style={styles.detailText}>{providerDetails.cnic || "Not provided"}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="work" size={20} color="#FF9901" />
                    <Text style={styles.detailText}>
                      {providerDetails.verifiedServices?.join(", ") || "No verified services"}
                    </Text>
                  </View>
                </View>

                <View style={styles.bidInfo}>
                  <Text style={styles.bidLabel}>Bid Amount:</Text>
                  <Text style={styles.bidValue}>Rs {selectedBid?.providerBid}</Text>
                  {selectedBid?.bidNotes && (
                    <>
                      <Text style={styles.bidLabel}>Notes:</Text>
                      <Text style={styles.bidNotes}>{selectedBid.bidNotes}</Text>
                    </>
                  )}
                </View>

                <TouchableOpacity style={styles.acceptButton} onPress={acceptBid}>
                  <Text style={styles.acceptButtonText}>Accept Bid</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
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
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  providerName: {
    color: "#FF9901",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  providerRating: {
    color: "#FFCC00",
    fontSize: 14,
  },
  detailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 10,
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