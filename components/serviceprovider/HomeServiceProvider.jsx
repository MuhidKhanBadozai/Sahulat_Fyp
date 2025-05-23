import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const categories = [
  { id: 1, name: 'Mechanic', icon: require('../../assets/mechanic.png') },
  { id: 2, name: 'Taxi', icon: require('../../assets/taxi.png') },
  { id: 3, name: 'Home Cleaning', icon: require('../../assets/home_cleaning.png') },
  { id: 4, name: 'Delivery', icon: require('../../assets/delivery.png') },
  { id: 5, name: 'Electrician', icon: require('../../assets/electrician.png') },
  { id: 6, name: 'Plumber', icon: require('../../assets/plumber.png') },
  { id: 7, name: 'Petroleum Emergency', icon: require('../../assets/petrol.png') },
];

const HomeServiceProvider = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const verifiedServices = route.params?.verifiedServices || [];

  const filteredCategories = categories.filter((cat) =>
    verifiedServices.includes(cat.name)
  );

  const handleServiceSelect = (serviceName) => {
    navigation.navigate('IncomingJobs', {
      selectedCategory: serviceName, // pass selected category correctly
      verifiedServices: verifiedServices,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Welcome, Service Provider</Text>
        <Text style={styles.subHeaderText}>
          Here are the services you're verified for
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.servicesContainer}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => handleServiceSelect(service.name)}
            >
              <Image
                source={service.icon}
                style={styles.iconStyle}
                resizeMode="contain"
              />
              <Text style={styles.serviceText}>{service.name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noServicesText}>
            No verified services available. Please complete verification first.
          </Text>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ServiceProviderProfile')}
        >
          <Ionicons name="person-outline" size={24} color="#FFA500" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeServiceProvider;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 35,
    backgroundColor: '#0D0D0D',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  serviceCard: {
    width: width * 0.38,
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 20,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStyle: {
    width: 45,
    height: 45,
    tintColor: '#FFA500',
  },
  serviceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  noServicesText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: '#0D0D0D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 4,
  },
});
