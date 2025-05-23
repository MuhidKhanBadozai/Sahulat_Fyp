import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const ServiceProviderProfile = () => {
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, "service_providers", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Format joined date if it exists
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
        }
      } catch (error) {
        Alert.alert("Error", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged Out", "You have been logged out successfully.");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#FF9901" style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="arrow-back" size={24} color="#fff" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Profile Summary */}
      <View style={styles.profileSection}>
        <Image
          source={{ uri: providerData?.profileImage || "https://via.placeholder.com/80" }}
          style={styles.profileImage}
        />
        <View style={styles.profileDetails}>
          <Text style={styles.name}>{providerData?.firstName} {providerData?.lastName}</Text>
          {/* <Text style={styles.rating}>
            ⭐ {providerData?.averageRating?.toFixed(2) || "4.85"} stars (
            {providerData?.totalReviews || 0} reviews)
          </Text>
          <Text style={styles.joined}>Joined: {providerData?.formattedJoinedDate}</Text> */}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Text style={[styles.tab, styles.activeTab]}>Profile Info</Text>
      </View>

      {/* Profile Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        <InfoRow label="Full Name" value={`${providerData?.firstName} ${providerData?.lastName}`} />
        <InfoRow label="User name" value={providerData?.username} />
        <InfoRow label="Phone number" value={providerData?.phoneNumber} />
      </View>

      {/* Verification Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Verification</Text>
        <InfoRow
          label="CNIC"
          value={providerData?.cnic || "Not uploaded"}
          icon="insert-drive-file"
        />
        <InfoRow
          label="Driving License"
          value={providerData?.licenseImage ? "Uploaded" : "Uploaded"}
          icon="insert-photo"
        />
      </View>

      {/* Verified Services */}
      {providerData?.verifiedServices?.length > 0 && (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Verified Jobs</Text>
          {providerData.verifiedServices.map((service, index) => (
            <View key={index} style={styles.verifiedItem}>
              <Ionicons name="checkmark-circle" size={18} color="#FF9901" />
              <Text style={styles.verifiedText}>{service}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="black" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const InfoRow = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    {icon && <MaterialIcons name={icon} size={20} color="#FF9901" style={{ marginRight: 5 }} />}
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    padding: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 15,
  },

  profileSection: {
    backgroundColor: "#000",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ccc",
  },
  profileDetails: {
    marginLeft: 15,
  },
  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  rating: {
    color: "#FFCC00",
    fontSize: 14,
    marginTop: 5,
  },
  joined: {
    color: "#ccc",
    fontSize: 13,
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1c1c1c",
  },
  tab: {
    paddingVertical: 12,
    color: "#888",
    fontWeight: "bold",
  },
  activeTab: {
    color: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#FF9901",
  },

  infoContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  infoRow: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#000",
    marginTop: 2,
  },
  verifiedItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  verifiedText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF9901",
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ServiceProviderProfile;