import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import AccountCreationScreen from '../screens/AccountCreationScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileCreationScreen from '../screens/ProfileCreationScreen';
import VenueDiscoveryScreen from '../screens/VenueDiscoveryScreen';
import CheckInScreen from '../screens/CheckInScreen';
import ProfileBrowsingScreen from '../screens/ProfileBrowsingScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading, needsProfileCompletion } = useAuth();

  if (isLoading) {
    // You can add a loading screen here
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0a0a0a' },
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="AccountCreation" component={AccountCreationScreen} />
        </>
      ) : needsProfileCompletion ? (
        <>
          <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ProfileCreation" component={ProfileCreationScreen} />
          <Stack.Screen name="VenueDiscovery" component={VenueDiscoveryScreen} />
          <Stack.Screen name="CheckIn" component={CheckInScreen} />
          <Stack.Screen name="ProfileBrowsing" component={ProfileBrowsingScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
