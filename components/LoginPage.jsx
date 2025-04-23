import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Image
          source={require('../assets/logo 2.png')}
          style={{ width: 50, height: 50, resizeMode: 'contain', marginBottom: 25, marginRight: 5 }}
        />
        <Text style={styles.title}>Sahulat Hub</Text>
      </View>
      <View style={styles.img}>
        <Image
          source={require('../assets/Handyman.png')}
          style={{ width: 363, height: 280 }}
        />
        <Text style={styles.tagline}>
          "Your One-Stop Solution for Home Services & More!"
        </Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button1}>
          <Text style={styles.buttonText}>Continue with Phone</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Continue with Google</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          Joining our app means you agree with our Terms of Use and Privacy Policy
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  heading: {
    flex: 1,
    marginBottom: 50,
    paddingBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 45,
    flexDirection: 'row',
  },
  img: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom: 50,
  },
  tagline: {
    width: 363,
    height: 280,
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  buttons: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button1: {
    marginBottom: 15,
    width: 348.04,
    height: 58.5,
    backgroundColor: '#FF9901',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  button2: {
    width: 348.04,
    height: 58.5,
    backgroundColor: '#3B3B3D',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  termsText: {
    width: 354,
    height: 44,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default LoginPage;
