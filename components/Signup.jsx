import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

const Signup = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const handleSignup = async () => {
        if (!email || !password || !username || !firstName || !lastName || !phoneNumber) {
            Alert.alert("Error", "All fields are required!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: email,
                username: username,
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                createdAt: new Date(),
            });

            Alert.alert("Success", "Account created successfully!");
            navigation.navigate("Login");
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sahulat Hub</Text>
            <Text style={styles.subtitle}>Find Your Service</Text>

            <View style={styles.container2}>
                <Text style={styles.loginTitle}>Create an account</Text>

                <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
                <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
                <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
                <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                <TextInput style={styles.input} placeholder="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
                <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

                <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
                    <Text style={styles.loginButtonText}>Sign Up</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.createAccount} onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.createAccountText}>Already have an account? Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#FF9901", alignItems: "center", justifyContent: "flex-start", paddingTop: 30 },
    container2: { width: "100%", height: "85%", backgroundColor: "#FFF", borderTopEndRadius: 400, borderTopStartRadius: 0, alignItems: "center", justifyContent: "center", padding: 20 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, marginTop: 30 },
    subtitle: { fontSize: 16, color: "gray", marginBottom: 30 },
    loginTitle: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },
    input: { width: 270, height: 40, borderColor: "gray", borderBottomWidth: 1, paddingHorizontal: 10, marginBottom: 15 },
    loginButton: { width: 270, height: 50, backgroundColor: "#FF9901", justifyContent: "center", alignItems: "center", borderRadius: 4, marginTop: 30 },
    loginButtonText: { color: "white", fontWeight: "bold" },
    createAccount: { marginTop: 20, width: 270, height: 50, backgroundColor: "#334155", justifyContent: "center", alignItems: "center", borderRadius: 4 },
    createAccountText: { color: "white" },
});

export default Signup;
