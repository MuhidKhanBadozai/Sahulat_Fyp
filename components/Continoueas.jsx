import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Continoueas = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.buttons}>
      <TouchableOpacity style={styles.button1} onPress={() => navigation.navigate('Mapbox')}>
        <Text style={styles.buttonText}>Continue as Customer</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button2} onPress={() => navigation.navigate('ServiceProviderLogin')}>
        <Text style={styles.buttonText}>Continue as Service Provider</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  buttons: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
});

export default Continoueas;
