// appNavigation.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SplashScreen from '../screens/SplashScreen';
import useAuth from '../hooks/useAuth';
import AddNewMessage from '../screens/messageScreens/AddMessage/';
import Conversation from '../screens/messageScreens/Conversation/';
import ConversationSettings from '../screens/messageScreens/ConversationSettings';
import FavoritesMessage from '../screens/messageScreens/FavoritesMessage';
import OnboardingScreen from '../screens/messageScreens/OnboardingScreen';
import AddPasswordFavorites from '../screens/messageScreens/AddPasswordFavorites';
import Search from '../screens/messageScreens/Search';

const Stack = createNativeStackNavigator();

export default function AppNavigation() {
  const { user, loading } = useAuth();

  if (loading) {
    // You can render a loading indicator here if needed
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Home' : 'Splash'}>
        {user ? (
          // Authenticated user views
          <>
          <Stack.Screen name="Home" options={{ headerShown: false }} component={HomeScreen} />
          <Stack.Screen name="AddNewMessage" options={{ headerShown: false }} component={AddNewMessage} />
          <Stack.Screen name="Conversation" options={{ headerShown: false }} component={Conversation} />
          <Stack.Screen name="ConversationSettings" options={{ headerShown: false }} component={ConversationSettings} />
          <Stack.Screen name="FavoritesMessage" options={{ headerShown: false }} component={FavoritesMessage} />
          <Stack.Screen name="OnboardingScreen" options={{ headerShown: false }} component={OnboardingScreen} />
          <Stack.Screen name="AddPasswordFavorites" options={{ headerShown: false }} component={AddPasswordFavorites} />
          <Stack.Screen name="Search" options={{ headerShown: false }} component={Search} />
         
          </>
          ) : (
          // Non-authenticated user views
          <>
            <Stack.Screen name="Splash" options={{ headerShown: false }} component={SplashScreen} />
            <Stack.Screen name="Welcome" options={{ headerShown: false }} component={WelcomeScreen} />
            <Stack.Screen name="Login" options={{ headerShown: false }} component={LoginScreen} />
            <Stack.Screen name="SignUp" options={{ headerShown: false }} component={SignUpScreen} />
           
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
