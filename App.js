import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';

import LoginPage from './components/LoginPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Continoueas from './components/Continoueas';
import Mapbox from './components/Mapbox';
import Description from './components/Description';
import ServiceSignup from './components/serviceprovider/ServiceSignup';
import ServiceProviderLogin from './components/serviceprovider/ServiceProviderLogin';  
import SelectCategory from './components/serviceprovider/SelectCategory';
import ProviderVerificationForm from './components/serviceprovider/ProviderVerificationForm';
import BiddingScreen from './components/serviceprovider/BiddingScreen';
import HomeServiceProvider from './components/serviceprovider/HomeServiceProvider';
import ServiceProviderProfile from './components/serviceprovider/ServiceProviderProfile'; 
import IncomingJobs from './components/serviceprovider/IncomingJobs';
import MapScreen from './components/serviceprovider/MapScreen';

//import ChatScreen from './components/chat-server/ChatScreen';
import ChatUI from './components/ChatUI';
// import JobDone from './components/JobDone';

import JobComplete from './components/JobComplete';



import { auth } from './components/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <React.Fragment>
              <Stack.Screen name="Continoueas" component={Continoueas} />
              <Stack.Screen name="Mapbox" component={Mapbox} />
              <Stack.Screen name="Description" component={Description} />
              <Stack.Screen name="ServiceSignup" component={ServiceSignup} />
              <Stack.Screen name="ServiceProviderLogin" component={ServiceProviderLogin} />
              <Stack.Screen name="SelectCategory" component={SelectCategory} />
              <Stack.Screen name="ProviderVerificationForm" component={ProviderVerificationForm} />
              <Stack.Screen name="BiddingScreen" component={BiddingScreen} />
              <Stack.Screen name="HomeServiceProvider" component={HomeServiceProvider} />
              <Stack.Screen name="ServiceProviderProfile" component={ServiceProviderProfile} />
              <Stack.Screen name="IncomingJobs" component={IncomingJobs} />
              <Stack.Screen name="MapScreen" component={MapScreen} />
              {/* <Stack.Screen name="ChatScreen" component={ChatScreen} /> */}
              <Stack.Screen name="ChatUI" component={ChatUI} />
              {/* <Stack.Screen name="JobDone" component={JobDone} />  */}
              <Stack.Screen name="JobComplete" component={JobComplete} />

            </React.Fragment>
          ) : (
            <React.Fragment>
              <Stack.Screen name="LoginPage" component={LoginPage} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} />
            </React.Fragment>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}