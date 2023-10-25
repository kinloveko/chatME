// import React, { useEffect, useState } from 'react'
// import { StyleSheet, Text, View } from 'react-native'
// import * as Animatable from 'react-native-animatable'
// import Styles from '../constant/Styles';
// import Colors from '../constant/Colors';
// import MyHeader from '../components/MyHeader';

// import Chat from '../screens/subScreens/Chat';
// import Notification from '../screens/subScreens/Notification';
// import Settings from '../screens/subScreens/Settings';

// const chat = 'Chat';
// const notif = 'Notification';
// const settingsName = 'Settings';

// export default function ColorScreen({ route, navigation }) {
//   const viewRef = React.useRef(null);
//   const [bgColor, setBgColor] = useState();
//   useEffect(() => {
//     switch (route.name) {
//       case chat: { setBgColor(Colors.primary); break; }
//       case notif: { setBgColor(Colors.green); break; }
//       case settingsName: { setBgColor(Colors.red); break; }
//       default: setBgColor(Colors.white);
//     }
//   }, [])
//   useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       viewRef.current.animate({ 0: { opacity: 0.5, }, 1: { opacity: 1 } });
//     })
//     return () => unsubscribe;
//   }, [navigation])
//   return (
//     <View style={Styles.container}>

//       <Animatable.View
//         ref={viewRef}
//         easing={'ease-in-out'}
//         style={Styles.container}>
//         <View style={{backgroundColor: bgColor, flex: 1}} />
//       </Animatable.View>
//     </View>
//   )
// }

// const styles = StyleSheet.create({})