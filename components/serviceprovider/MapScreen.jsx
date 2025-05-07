import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../firebaseConfig'; // ✅ adjust path if your firebase config file is elsewhere

const MapScreen = ({ navigation }) => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const loadMap = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate delay
      setMapReady(true);
    };
    loadMap();
  }, []);

  const handleMessagePress = () => {
    const customerId = auth.currentUser?.uid || "unknown_customer_id";
    const customerName = auth.currentUser?.displayName || "Customer";

    // Hardcoded for now, replace with dynamic data as needed   ss
    const providerId = "example_provider_id";
    const providerName = "Service Provider";
    const providerPhone = "+1234567890";
    const jobTitle = "AC Repair";

    navigation.navigate('ChatUI', {
      customerId,
      customerName,
      providerId,
      providerName,
      providerPhone,
      jobTitle,
    });
  };

  const handleJobDone = () => {
    const jobId = "example_job_id"; // Replace with real job ID
    const userType = "provider";    // Replace with actual user type

    navigation.navigate("JobDone", {
      jobId,
      userType,
    });
  };

  return (
    <View style={styles.container}>
      {mapReady && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 31.5154,
            longitude: 74.3639,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{ latitude: 31.5154, longitude: 74.3639 }}
            title="Lahore Garrison University"
            description="This is a marker example"
          />
        </MapView>
      )}
      {/* <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
      </TouchableOpacity> */}

      <TouchableOpacity style={styles.jobDoneButton} onPress={handleJobDone}>
        <Text style={styles.jobDoneText}>Job Done</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  messageButton: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 12,
    elevation: 5,
  },
  jobDoneButton: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#FF8C00',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 5,
  },
  jobDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapScreen;
