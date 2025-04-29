import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const MapScreen = () => {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const loadMap = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate loading
      setMapReady(true);
    };
    loadMap();
  }, []);

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default MapScreen;
