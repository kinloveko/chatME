import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef } from 'react'
import { StyleSheet, TouchableOpacity, View,Dimensions } from 'react-native'
import Icon, { Icons } from '../components/Icons';
import Colors from '../constant/Colors';
import {themeColors} from '../theme'
import * as Animatable from 'react-native-animatable';
import Chat from './subScreens/Chat';
import Notification from './subScreens/Notification';
import Settings from './subScreens/Settings';

const TabArr = [
  { route: 'Chat', label: 'Chat', type: Icons.Feather, icon: 'message-circle', component: Chat },
  { route: 'Notification', label: 'Notification', type: Icons.Feather, icon: 'bell', component: Notification },
  { route: 'Settings', label: 'Profile', type: Icons.Feather, icon: 'user', component: Settings },
];
const screenHeight = Dimensions.get('window').height;
const Tab = createBottomTabNavigator();

const animate1 = { 0: { scale: .2, translateY: 1 }, .52: { translateY: -10 }, 1: { scale: 1.0, translateY: -10 } }
const animate2 = { 0: { scale: .7, translateY: -20 }, 1: { scale: 1, translateY: 7 } }

const circle1 = { 0: { scale: 0}, 0.3: { scale: 0 }, 0.5: { scale: .2 }, 0.8: { scale: .7 }, 1: { scale: 1 } }
const circle2 = { 0: { scale: 1 }, 1: { scale: 0 } }

const TabButton = (props) => {
  const { item, onPress, accessibilityState } = props;
  const focused = accessibilityState.selected;

  const viewRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (focused) {
      viewRef.current.animate(animate1);
      circleRef.current.animate(circle1);
      textRef.current.transitionTo({ scale: 1 });
    } else {
      viewRef.current.animate(animate2);
      circleRef.current.animate(circle2);
      textRef.current.transitionTo({ scale: 0 });
    }
  }, [focused])

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1}  style={styles.container}>
      <Animatable.View  ref={viewRef}  duration={1000}  style={styles.container}>
        <View style={styles.btn}>
          <Animatable.View
            ref={circleRef}
            style={styles.circle} />
          <Icon type={item.type} name={item.icon} color={focused ? Colors.white : themeColors.semiBlack} />

        </View>
        <Animatable.Text
          ref={textRef}
          style={styles.text}>
          
          {item.label}
        </Animatable.Text>
        {focused && <View style={styles.dot} />}
      </Animatable.View>
    </TouchableOpacity>
  )
}

export default function AnimTab1() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {TabArr.map((item, index) => {
        return (
          <Tab.Screen key={index} name={item.route} component={item.component}
            options={{
              tabBarShowLabel: false,
              tabBarButton: (props) => <TabButton {...props} item={item} />
            }}
          />
        )
      })}
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    height: screenHeight < 768 ? 50 : 80,
    position: 'absolute',
    borderRadius: 16,
  },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: themeColors.bg,
    backgroundColor: themeColors.bg,
    justifyContent: 'center',
    alignItems: 'center'
  },
  circle: {
    ...StyleSheet.absoluteFillObject, 
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: themeColors.semiBlack,
    borderRadius: 25,
  },
  activeCircle: {
    position: 'absolute',
    bottom: 5, // Position the dot at the bottom of the button
    height: 8, // Adjust the size of the dot as needed
    width: 8, // Adjust the size of the dot as needed
    borderRadius: 4, // Make it a circle
    backgroundColor: Colors.primary, // Color of the dot
  },
  text: {
    top:screenHeight < 768 ? 0 : 7,
    fontSize: 13,
    fontFamily:'Betm Regular',
    textAlign: 'center',
    color: themeColors.semiBlack,
  },
   dot: {
    width: 10,
    height: 5,
    backgroundColor: themeColors.buttonColorPrimary, // Change to your desired color
    borderRadius: 3,
    position: 'absolute',
    top:2, // Adjust this to position the dot above the selected tab
  },
  
})