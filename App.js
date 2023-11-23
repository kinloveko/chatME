import React from 'react';
import AppNavigation from './navigation/appNavigation';
import * as SplashScreen from 'expo-splash-screen'; // Import SplashScreen from expo-splash-screen
import { useFonts } from 'expo-font';
import { RootSiblingParent } from 'react-native-root-siblings';

export default function App() {
  let [fontsLoaded] = useFonts({
    'CS Gorgon': require('./assets/fonts/csgorgonregular.ttf'),
    'Betm Regular' : require('./assets/fonts/betmroundedregular.otf'),
    'Betm Light' :require('./assets/fonts/betmroundedlight.otf'),
    'League Spartan' :require('./assets/fonts/leaguespartan.ttf'),
    'League Spartan Black' :require('./assets/fonts/leaguespartanblack.ttf'),
  });

  // Prevent auto-hiding of the splash screen while fonts are loading
  SplashScreen.preventAutoHideAsync();

  if (!fontsLoaded) {
    return null; // Return null to keep the splash screen visible
  }

  // Once fonts are loaded, hide the splash screen
  SplashScreen.hideAsync();

  return (
    <RootSiblingParent>
        <AppNavigation />
    </RootSiblingParent>

  ) ;
}
