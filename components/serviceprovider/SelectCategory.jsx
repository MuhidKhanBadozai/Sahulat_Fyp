import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

const SelectCategory = () => {
    const navigation = useNavigation();
    const [selectedCategories, setSelectedCategories] = useState([]);

    const toggleSelection = (id) => {
        setSelectedCategories((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((categoryId) => categoryId !== id)
                : [...prevSelected, id]
        );
    };

    const handleNext = () => {
        const selectedCategoryNames = categories
            .filter((cat) => selectedCategories.includes(cat.id))
            .map((cat) => cat.name);

        navigation.navigate('ProviderVerificationForm', { selectedCategories: selectedCategoryNames });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.header}> Select Your Work Categories</Text>
            <View style={styles.grid}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.card,
                            selectedCategories.includes(category.id) && styles.selectedCard,
                        ]}
                        onPress={() => toggleSelection(category.id)}
                    >
                        <Image source={category.icon} style={styles.icon} />
                        <Text style={styles.text}>{category.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            {selectedCategories.length > 0 && (
                <TouchableOpacity
                    style={styles.nextButton}
                    onPress={handleNext}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111',
        paddingTop: 50,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    card: {
        width: 150,
        height: 150,
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedCard: {
        backgroundColor: 'orange',
    },
    icon: {
        width: 50,
        height: 50,
        marginBottom: 10,
    },
    text: {
        color: 'black',
        fontSize: 14,
    },
    nextButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'orange',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    nextButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default SelectCategory;
