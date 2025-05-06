import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { auth } from '../firebaseConfig'; // make sure path matches your config file

const MapScreen = ({ navigation, route }) => {
  const [mapReady, setMapReady] = useState(false);
  const currentUser = auth.currentUser;
  const senderId = currentUser?.email; // Or use UID: currentUser?.uid
  const receiverId = route.params?.otherUserId || "provider456"; // Replace with dynamic value as needed

  useEffect(() => {
    const loadMap = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // simulate delay
      setMapReady(true);
    };
    loadMap();
  }, []);

  const handleMessagePress = () => {
    if (!senderId || !receiverId) return;

    navigation.navigate("ChatScreen", {
      senderId,
      receiverId,
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
      <TouchableOpacity style={styles.messageButton} onPress={handleMessagePress}>
        <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
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
    bottom: 20,
    left: 20,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 12,
    elevation: 5,
  },
});

export default MapScreen;
