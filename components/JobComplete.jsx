import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import LottieView from 'lottie-react-native';

export default function JobComplete({ route }) {
  const { customerName, providerName, providerBid } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../assets/logo 2.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Sahulat Hub</Text>
      </View>

      {/* Animated Tick */}  
      <LottieView
        source={require('../assets/animatedtick.json')}
        autoPlay
        loop={false}
        style={styles.animation}
      />

      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.heading1}>"Thanks for using Sahulat Hub"</Text>
       
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText1}> Job Completed</Text>
          <Text style={styles.detailText}>
            Agreed Amount: <Text style={styles.bold}>Rs {providerBid}</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 70,
    marginBottom: 10,
    justifyContent: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'black',
  },
  animation: {
    width: 420,
    height: 420,
    padding: -200,
    alignSelf: 'center',
    marginVertical: 10,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    flex: 1,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
    textAlign: 'center',
  },
  detailText1: {
    fontSize: 18,
    color: '#555',
    marginVertical: 10,
    textAlign: 'center',
  },
  detailsContainer: {
    marginTop: 30,
    alignItems: 'center',
    width: '100%',
  },
  detailText: {
    fontSize: 18,
    color: '#555',
    marginVertical: 5,
    textAlign: 'center',
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
  },
});