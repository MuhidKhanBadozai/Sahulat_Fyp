import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const serviceCategories = {
  Mechanic: ['Shop Photo', 'Certification/Degree (Optional)'],
  Taxi: ['Driving License'],
  'Home Cleaning': ['Certification/Degree (Optional)'],
  Delivery: ['Driving License'],
  Electrician: ['Certification/Degree (Optional)'],
  Plumber: ['Certification/Degree (Optional)'],
  'Petroleum Emergency': ['Driving License'],
};

const ProviderVerificationForm = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { selectedCategories = [] } = route.params || {};
  const [documents, setDocuments] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async (docType, category) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
    });

    if (!result.canceled) {
      setDocuments((prev) => ({
        ...prev,
        [category]: {
          ...(prev[category] || {}),
          [docType]: result.assets[0].uri,
        },
      }));
    }
  };

  const handleSubmit = () => {
    for (let category of selectedCategories) {
      const requiredDocs = serviceCategories[category] || [];
      const uploadedDocs = documents[category] || {};
      const missingDocs = requiredDocs.filter((doc) => !uploadedDocs[doc]);

      if (missingDocs.length > 0) {
        Alert.alert('Incomplete', `Please upload for ${category}: ${missingDocs.join(', ')}`);
        return;
      }
    }

    setSubmitting(true);

    setTimeout(() => {
      Alert.alert(
        'Success', 
        'Verification documents submitted successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('HomeServiceProvider', { 
              verifiedServices: selectedCategories 
            })
          }
        ]
      );
      setSubmitting(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.fullScreen}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.heading}>Service Provider Verification</Text>

        {selectedCategories.length === 0 ? (
          <Text style={styles.label}>No categories selected.</Text>
        ) : (
          selectedCategories.map((category) => (
            <View key={category} style={styles.docSection}>
              <Text style={styles.label}>{category} - Upload Required Documents:</Text>
              {(serviceCategories[category] || []).map((docType) => (
                <View key={docType} style={styles.uploadContainer}>
                  <Text style={styles.docLabel}>{docType}:</Text>
                  <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => pickImage(docType, category)}
                  >
                    <Text style={styles.uploadButtonText}>Upload</Text>
                  </TouchableOpacity>
                  {documents[category] && documents[category][docType] && (
                    <Image
                      source={{ uri: documents[category][docType] }}
                      style={styles.previewImage}
                    />
                  )}
                </View>
              ))}
            </View>
          ))
        )}

        {selectedCategories.length > 0 && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitButtonText}>
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 10,
    textAlign: 'center',
  },
  docSection: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
  },
  uploadContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  docLabel: {
    color: 'white',
    marginBottom: 5,
  },
  uploadButton: {
    backgroundColor: 'orange',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 10,
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: 'orange',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProviderVerificationForm;