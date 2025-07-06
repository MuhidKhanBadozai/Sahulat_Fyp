import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

const ServiceSignup = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [cnic, setCnic] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !username || !firstName || !lastName || !phoneNumber || !cnic) {
            Alert.alert("Error", "All fields are required!");
            return;
        }

        if (phoneNumber.length !== 11) {
            Alert.alert("Error", "Phone number must be 11 digits long!");
            return;
        }

        if (cnic.length !== 13) {
            Alert.alert("Error", "CNIC must be 13 digits long!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "service_providers", user.uid), {
                uid: user.uid,
                email,
                username,
                firstName,
                lastName,
                phoneNumber,
                cnic,
                review: 0,
                createdAt: serverTimestamp(),
            });

            Alert.alert("Success", "Service Provider account created successfully!");
            navigation.navigate("SelectCategory");
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sahulat Hub</Text>
            <Text style={styles.subtitle}>Serve the need and earn cash</Text>

            <View style={styles.container2}>
                <Text style={styles.loginTitle}>Create Service Provider Account</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={styles.input}
                    placeholder="CNIC (Enter without dashes)"
                    value={cnic}
                    onChangeText={setCnic}
                    keyboardType="number-pad"
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.showPasswordButton}
                    >
                        <Text style={styles.showPasswordText}>
                            {showPassword ? "Hide" : "Show"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
                    <Text style={styles.loginButtonText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FF9901",
        alignItems: "center",
        paddingTop: 30,
    },
    container2: {
        width: "100%",
        height: "85%",
        backgroundColor: "#FFF",
        borderTopEndRadius: 400,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 30,
    },
    subtitle: {
        fontSize: 16,
        color: "gray",
        marginBottom: 30,
    },
    loginTitle: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        width: 270,
        height: 40,
        borderColor: "gray",
        borderBottomWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    loginButton: {
        width: 270,
        height: 50,
        backgroundColor: "#FF9901",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        marginTop: 30,
    },
    loginButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: 270,
        borderBottomWidth: 1,
        borderColor: "white",
        marginBottom: 15,
    },
    showPasswordButton: {
        padding: 10,
    },
    showPasswordText: {
        color: "#FF9901",
        fontWeight: "bold",
    },
});

export default ServiceSignup;
