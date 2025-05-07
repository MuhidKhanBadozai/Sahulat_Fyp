import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Text, Image, Alert, Animated, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import UserProfile from './UserProfile';

const screenWidth = Dimensions.get('window').width;

const Mapbox = () => {
  const [mapReady, setMapReady] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userLocation, setUserLocation] = useState("Your Location");
  const [searchQuery, setSearchQuery] = useState("");
  const slideAnim = useState(new Animated.Value(-screenWidth))[0];

  const navigation = useNavigation();

  useEffect(() => {
    const loadMap = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMapReady(true);
    };
    loadMap();
  }, []);

  const handleMenuPress = () => {
    setShowProfile(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseProfile = () => {
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowProfile(false));
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged out", "You have been logged out successfully.");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
  };

  const navigateToDescription = () => {
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a service category first");
      return;
    }
    navigation.navigate('Description', {
      selectedCategory,
      userLocation
    });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const categories = [
    { id: 1, name: 'Mechanic', icon: require('../assets/mechanic.png') },
    { id: 2, name: 'Taxi', icon: require('../assets/taxi.png') },
    { id: 3, name: 'Home Cleaning', icon: require('../assets/home_cleaning.png') },
    { id: 4, name: 'Delivery', icon: require('../assets/delivery.png') },
    { id: 5, name: 'Electrician', icon: require('../assets/electrician.png') },
    { id: 6, name: 'Plumber', icon: require('../assets/plumber.png') },
    { id: 7, name: 'Petroleum Emergency', icon: require('../assets/petrol.png') },
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchBarContainer} onPress={handleMenuPress}>
        <Ionicons name="menu" size={30} color="#888" />
      </TouchableOpacity>

      {/* {mapReady && (
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

      {showProfile && (
        <Animated.View style={[styles.profileOverlay, { transform: [{ translateX: slideAnim }] }]}>
          <UserProfile onClose={handleCloseProfile} onConfirmLogout={confirmLogout} />
        </Animated.View>
      )} */}

      <View style={styles.bottomContainer}>
        <Text style={styles.categories}>Choose Your Service</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            style={styles.input}
            placeholder="Search Service"
            placeholderTextColor="#aaa"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        <View style={styles.inputContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filteredCategories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === item.name && styles.selectedCategoryButton
                ]}
                onPress={() => handleCategorySelect(item.name)}
              >
                <Image
                  source={item.icon}
                  style={[
                    styles.icon,
                    selectedCategory === item.name && styles.selectedIcon
                  ]}
                />
                <Text style={styles.categoryText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="location" size={20} color="orange" />
          <TextInput
            style={styles.input}
            placeholder="Your Location"
            placeholderTextColor="#aaa"
            value={userLocation}
            onChangeText={setUserLocation}
          />
        </View>

        <TouchableOpacity style={styles.findButton} onPress={navigateToDescription}>
          <Text style={styles.buttonText}>Go to Bidding</Text>
          <Ionicons name="options-outline" size={20} color="black" style={styles.filterIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarContainer: {
    position: 'absolute',
    top: 60,
    left: '14%',
    transform: [{ translateX: -30 }],
    backgroundColor: '#222',
    height: 60,
    width: 60,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 1,
  },
  map: { flex: 1, width: '100%', height: '100%' },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#222',
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    color: 'white',
    marginLeft: 10,
    height: 40, // FIXED: Increased from 20 to 40
    fontSize: 16,
  },
  findButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9901',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: 'black' },
  filterIcon: { marginLeft: 10 },
  categoryButton: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    width: 100,
  },
  selectedCategoryButton: {
    backgroundColor: '#FF9901',
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 0, // FIXED: Rounded properly
    marginBottom: 5,
    resizeMode: 'cover',
  },
  selectedIcon: {
    borderColor: '#222',
    borderWidth: 2,
  },
  categoryText: {
    color: 'black',
    fontSize: 12,
    textAlign: 'center',
  },
  categories: {
    color: 'white',
    fontSize: 24,
    padding: 10,
    alignSelf: 'flex-start',
  },
  profileOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '80%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 2,
  },
});

export default Mapbox;
