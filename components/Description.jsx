import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from "react-native";
import { Menu, Divider } from "react-native-paper";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { useNavigation, useRoute } from "@react-navigation/native";

const Description = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(route.params?.userLocation || "");
  const [price, setPrice] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(route.params?.selectedCategory || "Select Category");
  const [userName, setUserName] = useState("");
  const [jobId, setJobId] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const categories = [
    "Mechanic",
    "Taxi",
    "Home Cleaning",
    "Delivery",
    "Electrician",
    "Plumber",
    "Petroleum Emergency",
  ];

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.username || "");
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSaveDetails = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "User not logged in!");
      return;
    }

    if (!selectedCategory || !title || !description || !location || !price) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    try {
      const newJobRef = await addDoc(collection(db, "upcoming_jobs"), {
        userId: user.uid,
        userEmail: user.email,
        userName: userName,
        category: selectedCategory,
        title,
        description,
        location,
        price,
        timestamp: new Date(),
      });

      setJobId(newJobRef.id);

      Alert.alert("Success", "Service details stored!");

      navigation.navigate("BiddingScreen", {
        jobId: newJobRef.id,
        jobTitle: title,
        category: selectedCategory,
      });

      setTitle("");
      setDescription("");
      setLocation("");
      setPrice("");
      setSelectedCategory("Select Category");
    } catch (error) {
      Alert.alert("Error", "Failed to store details: " + error.message);
    }
  };

  const handlePriceChange = (text) => {
    // Remove any dots or commas entered by the user
    const filteredText = text.replace(/[.,]/g, "");
    // Remove any non-numeric characters
    const numericText = filteredText.replace(/[^0-9]/g, "");
    setPrice(numericText);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#111" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={isKeyboardVisible}
      >
        <Text style={styles.header}>Sahulat Details</Text>

        <Text style={styles.label}>Category</Text>
        <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={
            <TouchableOpacity style={styles.input} onPress={() => setVisible(true)}>
              <Text style={{ color: "#fff" }}>{selectedCategory}</Text>
            </TouchableOpacity>
          }
        >
          {categories.map((category, index) => (
            <React.Fragment key={index}>
              <Menu.Item
                onPress={() => {
                  setSelectedCategory(category);
                  setVisible(false);
                }}
                title={category}
              />
              {index !== categories.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Menu>

        <Text style={styles.label}>Sahulat Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Add Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your service"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Add Your Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location"
          placeholderTextColor="#aaa"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Add Your Price</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>Rs</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Enter price"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={price}
            onChangeText={handlePriceChange}
          />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleSaveDetails}>
          <Text style={styles.nextButtonText}>Save Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 80,
    backgroundColor: "#111",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#222",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  textArea: {
    height: 180,
    textAlignVertical: "top",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 8,
    padding: 12,
  },
  currency: {
    color: "#fff",
    marginRight: 10,
  },
  priceInput: {
    flex: 1,
    color: "#fff",
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: "#FF9901",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  nextButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Description;
