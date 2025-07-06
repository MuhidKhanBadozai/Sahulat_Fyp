import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location'; // 📍 GPS & permissions
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import UserProfile from './UserProfile';

const screenWidth = Dimensions.get('window').width;

const DEFAULT_REGION = {
  latitude: 31.4945,
  longitude: 74.3534,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const cityLocations = [
  'DHA Phase 1','DHA Phase 2','DHA Phase 3','DHA Phase 4','DHA Phase 5','DHA Phase 6','Model Town','Gulberg','Johar Town','Bahria Town','Barki Rd','Paragon City','Wapda Town','Askari 10','Askari 9','Cantt','Garden Town','Shadman','Faisal Town','Allama Iqbal Town','Township','Green Town','Sabzazar','Iqbal Park','LDA Avenue','Fortress Stadium','Liberty Market','MM Alam Road','Anarkali','Shalimar','Samanabad','Dharampura'
];

const categories = [
  { id: 1, name: 'Mechanic', icon: require('../assets/mechanic.png') },
  { id: 2, name: 'Taxi', icon: require('../assets/taxi.png') },
  { id: 3, name: 'Home Cleaning', icon: require('../assets/home_cleaning.png') },
  { id: 4, name: 'Delivery', icon: require('../assets/delivery.png') },
  { id: 5, name: 'Electrician', icon: require('../assets/electrician.png') },
  { id: 6, name: 'Plumber', icon: require('../assets/plumber.png') },
  { id: 7, name: 'Petroleum Emergency', icon: require('../assets/petrol.png') },
];

const Mapbox = () => {
  const [mapReady, setMapReady] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userLocation, setUserLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const slideAnim = useState(new Animated.Value(-screenWidth))[0];
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission denied');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc.coords);
      } catch (err) {
        console.log(err);
        setErrorMsg('Could not fetch location');
      }
    })();
  }, []);

  useEffect(() => {
    const loadMap = async () => {
      await new Promise((res) => setTimeout(res, 1000));
      setMapReady(true);
    };
    loadMap();
  }, []);

  const openMenu = () => {
    setShowProfile(true);
    Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, { toValue: -screenWidth, duration: 300, useNativeDriver: true }).start(() => setShowProfile(false));
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged out', 'You have been logged out successfully.');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCategorySelect = (name) => setSelectedCategory(name);

  const navigateToDescription = () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a service category first');
      return;
    }
    navigation.navigate('Description', { selectedCategory, userLocation });
  };

  const handleSearch = (txt) => setSearchQuery(txt);

  const handleLocationChange = (txt) => {
    setUserLocation(txt);
    if (txt.length) {
      const suggestions = cityLocations.filter((l) => l.toLowerCase().startsWith(txt.toLowerCase()));
      setLocationSuggestions(suggestions);
    } else {
      setLocationSuggestions([]);
    }
  };

  const handleLocationSelect = (loc) => {
    setUserLocation(loc);
    setLocationSuggestions([]);
  };

  const filteredCategories = categories.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const region = location
    ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
    : DEFAULT_REGION;

  if (!mapReady || (!location && !errorMsg)) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#FF9901" />
        <Text style={{ marginTop: 8, color: '#fff' }}>Loading map…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.searchBarContainer} onPress={openMenu}>
        <Ionicons name="menu" size={30} color="#888" />
      </TouchableOpacity>

      <MapView style={styles.map} region={region} showsUserLocation followsUserLocation>
        {location && <Marker coordinate={location} title="You are here" description="Current position" />}
      </MapView>

      {showProfile && (
        <Animated.View style={[styles.profileOverlay, { transform: [{ translateX: slideAnim }] }]}>
          <UserProfile onClose={closeMenu} onConfirmLogout={confirmLogout} />
        </Animated.View>
      )}

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
          {filteredCategories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.categoryButton, selectedCategory === item.name && styles.selectedCategoryButton]}
              onPress={() => handleCategorySelect(item.name)}
            >
              <Image source={item.icon} style={[styles.icon, selectedCategory === item.name && styles.selectedIcon]} />
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputContainer}>
          <Ionicons name="location" size={20} color="orange" />
          <TextInput
            style={styles.input}
            placeholder="Your Location"
            placeholderTextColor="#aaa"
            value={userLocation}
            onChangeText={handleLocationChange}
          />
        </View>

        {locationSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {locationSuggestions.map((loc, idx) => (
              <TouchableOpacity key={idx} onPress={() => handleLocationSelect(loc)}>
                <Text style={styles.suggestionText}>{loc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  map: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#222' },
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
  input: { flex: 1, color: 'white', marginLeft: 10, height: 40, fontSize: 16 },
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
  selectedCategoryButton: { backgroundColor: '#FF9901' },
  icon: { width: 50, height: 50, marginBottom: 5, resizeMode: 'cover' },
  selectedIcon: { borderColor: '#222', borderWidth: 0 },
  categoryText: { color: 'black', fontSize: 12, textAlign: 'center' },
  categories: { color: 'white', fontSize: 24, padding: 10, alignSelf: 'flex-start' },
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
  suggestionsContainer: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    marginBottom: 10,
    maxHeight: 150,
  },
  suggestionText: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    color: '#000',
  },
});

export default Mapbox;
