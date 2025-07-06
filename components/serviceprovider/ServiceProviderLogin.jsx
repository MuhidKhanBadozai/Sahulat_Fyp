import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig';

const ServiceProviderLogin = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // 👈 For toggling visibility

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            Alert.alert("Success", "Logged in successfully!");
            navigation.navigate('SelectCategory'); // Navigate to SelectCategory component
        } catch (error) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sahulat Hub</Text>
            <Text style={styles.subtitle}>Service Provider Portal</Text>

            <View style={styles.container2}>
                <Text style={styles.loginTitle}>Login</Text>

                <TextInput 
                    style={styles.input} 
                    placeholder="Email" 
                    value={email} 
                    onChangeText={setEmail} 
                    keyboardType="email-address"
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
                        style={styles.showButton} 
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Text style={{ color: '#FF9901', fontWeight: 'bold' }}>
                            {showPassword ? 'Hide' : 'Show'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Log in</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.createAccount} onPress={() => navigation.navigate('ServiceSignup')}>
                    <Text style={styles.createAccountText}>Don't have an account? Register now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF9901',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 30,
        width: '100%',
    },
    container2: {
        flex: 1,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopEndRadius: 400,
        borderTopStartRadius: 0,
        padding: 20,
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 30,
    },
    subtitle: {
        fontSize: 16,
        color: 'gray',
        marginBottom: 30,
    },
    loginTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: 300,
        height: 40,
        borderColor: 'gray',
        borderBottomWidth: 1,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: 'white',
        marginBottom: 15,
        width: 300,
    },
    showButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    loginButton: {
        width: 300,
        height: 50,
        backgroundColor: '#FF9901',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        marginBottom: 20,
        marginTop: 10,
    },
    loginButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    createAccount: {
        marginTop: 20,
        width: 300,
        height: 50,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    createAccountText: {
        color: 'white',
    },
});

export default ServiceProviderLogin;
