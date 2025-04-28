import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert
} from "react-native";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

const BiddingScreen = ({ route }) => {
  const { jobId = "", jobTitle = "Unknown", category = "Uncategorized" } = route.params || {};
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    if (!jobId) return;

    const bidsRef = query(
      collection(db, "incoming_bids"),
      where("jobId", "==", jobId)
    );

    const unsubscribe = onSnapshot(
      bidsRef,
      (snapshot) => {
        const bidsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
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

  const viewBidDetails = (bid) => {
    setSelectedBid(bid);
    setModalVisible(true);
  };

  const acceptBid = () => {
    Alert.alert("Bid Accepted", "You have accepted this bid!");
    setModalVisible(false);
  };

  const viewProviderProfile = () => {
    if (!selectedBid) return;
    
    setModalVisible(false);
    navigation.navigate("ServiceProviderProfile", {
      serviceProviderId: selectedBid.serviceProviderId,
      serviceProviderName: selectedBid.serviceProviderName,
      // Add any other relevant data you want to pass
    });
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
            {selectedBid && (
              <>
                <View style={styles.bidInfo}>
                  <Text style={styles.bidLabel}>Service Provider:</Text>
                  <Text style={styles.bidValue}>{selectedBid.serviceProviderName}</Text>
                  
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

                <TouchableOpacity style={styles.providerProfileButton} onPress={viewProviderProfile}>
                  <Text style={styles.providerProfileButtonText}>View Provider Profile</Text>
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
  providerProfileButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  providerProfileButtonText: {
    color: "#fff",
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
