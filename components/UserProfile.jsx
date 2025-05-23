import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Image } from "react-native";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const UserProfile = ({ onClose }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    } else {
                        Alert.alert("Error", "User data not found!");
                    }
                } else {
                    Alert.alert("Error", "No user is logged in.");
                }
            } catch (error) {
                Alert.alert("Error", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            Alert.alert("Logged out", "You have been logged out successfully.");
            navigation.replace("Login");
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#FF9901" style={styles.loader} />;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>

            <View style={styles.profileContainer}>
                <Image source={{ uri: userData?.profileImage }} style={styles.profileImage} />
                <View style={styles.mailname}>
                    <Text style={styles.fullName}>{userData?.firstName} {userData?.lastName}</Text>
                    <Text style={styles.email}>{userData?.email}</Text>
                </View>
            </View>

            <View style={styles.menuContainer}>
                <MenuItem style={styles.space} icon="person-outline" text={`Name: ${userData?.firstName}`} />
                <MenuItem style={styles.space} icon="mail-outline" text={`Email: ${userData?.email}`} />
                <MenuItem style={styles.space} icon="call-outline" text={`Phone Number: ${userData?.phoneNumber}`} />

                {/* <MenuItem icon="location-outline" text="Location" /> */}

                {/* <MenuItem icon="download-outline" text="Downloads" /> */}
                {/* <MenuItem icon="globe-outline" text="Languages" /> */}
                {/* <MenuItem icon="tv-outline" text="Subscription" /> */}
                {/* <MenuItem icon="options-outline" text="Display" />
                <MenuItem icon="trash-outline" text="Clear Cache" />
                <MenuItem icon="time-outline" text="Clear History" /> */}
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => navigation.navigate("ServiceProviderLogin")}
            >
                <Ionicons name="construct-outline" size={20} color="black" />
                <Text style={styles.logoutText}>Work As Service Provider</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="black" />
                <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const MenuItem = ({ icon, text }) => (
    <TouchableOpacity style={styles.menuItem}>
        <Ionicons name={icon} size={24} color="black" style={styles.menuIcon} />
        <Text style={styles.menuText}>{text}</Text>
        {/* <Ionicons name="chevron-forward-outline" size={20} color="black" /> */}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FFF", padding: 20 },
    closeButton: { position: "absolute", top: 50, right: 20 },
    profileContainer: { alignItems: "center", marginTop: 80, display: "flex", justifyContent: "start", alignItems: "center", flexDirection: "row" },
    mailname: { display: "flex", flexDirection: "column", marginLeft: 10 },
    profileImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#ccc" },
    fullName: { fontSize: 20, fontWeight: "bold", marginTop: 10 },
    email: { fontSize: 16, color: "#666" },
    phone: { fontSize: 16, color: "#444", marginTop: 5 },
    editButton: { marginTop: 10, backgroundColor: "#007bff", padding: 8, borderRadius: 6 },
    editButtonText: { color: "white", fontSize: 16 },
    menuContainer: { marginTop: 30 },
    menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#ddd" },
    menuIcon: { marginRight: 15 },
    menuText: { flex: 1, fontSize: 16 },
    logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 15, marginTop: 30, backgroundColor: "#FF9901", borderRadius: 10 },
    logoutText: { marginLeft: 10, fontSize: 18, fontWeight: "bold" },
    loader: { flex: 1, justifyContent: "center" },
    space: { padding: 50 },
});

export default UserProfile;