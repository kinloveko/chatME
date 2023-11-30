import React,{useState,useEffect} from 'react';
import { View,SafeAreaView,Switch,Text,StyleSheet,Image,Platform,TouchableOpacity, Dimensions} from 'react-native';
import { themeColors } from '../../theme';
import { useUserData } from '../../components/userData';
import {doc, updateDoc,onSnapshot} from 'firebase/firestore'
import { FIREBASE_DB } from '../../config/firebase';
import Toast from 'react-native-root-toast';
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function ActiveStatus({navigation}) {

    const {userData} = useUserData();
    const [isSwitchOn, setIsSwitchOn] = useState(false);
    useEffect(() => {
        if (userData !== null) {
          const onlineStatus = userData.isOnline ? userData.isOnline.toString() : 'false';
          setIsSwitchOn(onlineStatus);
    
          // Listen for real-time updates on the user document
          const userDocRef = doc(FIREBASE_DB, 'User', userData.id);
          const unsubscribe = onSnapshot(userDocRef, (doc) => {
            const newOnlineStatus = doc.data().isOnline ? doc.data().isOnline.toString() : 'false';
            setIsSwitchOn(newOnlineStatus);
          });
    
          return () => unsubscribe(); // Unsubscribe when the component unmounts
        }
      }, [userData]);
    
      const updateFirestore = async (value) => {
        try {
          if (userData) {
            // Assuming you have the user document reference
            const userDocRef = doc(FIREBASE_DB, 'User', userData.id);
            const status = value.toString() === 'true' ? 'Active' : 'Offline'
            
            // Update the isOnline field in Firestore
            await updateDoc(userDocRef, {
              isOnline: value.toString(),
            });
            setIsSwitchOn(value);
            Toast.show(`Status set to ${status}`, {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
                backgroundColor: 'rgba(0,0,0,0.7)',
                textColor: themeColors.bg,
                shadow: false,
                animation: true,
                hideOnPress: true,
                delay: 0,
              });
            console.log(`Firestore updated: isOnline set to ${isSwitchOn}`);
          }
        } catch (error) {
          console.error('Error updating Firestore:', error);
        }
      };

    return(
        <SafeAreaView style={{
            flex: 1,
            backgroundColor:'white',
        }}>
            <View style={styles.header}>
                    <View style={styles.headerLeft}>
                    <TouchableOpacity  onPress={() => navigation.goBack()}>
                    <Image style={{width: screenHeight < 768 ? 25:30,
                                                height: screenHeight < 768 ? 25:30}} 
                                                source={require('../../assets/icons/left.png')}/>
                    </TouchableOpacity>
                    </View>
    
                    <View style={styles.headerCenter}>
                    <Text style={styles.headerText}>Active Status</Text>
    
                    </View>
                    <TouchableOpacity >
                    <View style={styles.headerRight}>
                    <Switch
                    height={1}
                    trackColor={{false: '#767577', true: themeColors.buttonColorPrimary}}
                    thumbColor={isSwitchOn ? 'white' : '#f4f3f4'}
                        value={isSwitchOn === 'true'}
                        onValueChange={(value) => {
                            setIsSwitchOn(value.toString());
                            updateFirestore(value.toString());
                        }}
                        />
                     </View>
                    </TouchableOpacity>
                </View>
                <View style={{alignItems:'center'}}>
                <Image  style={{width: screenWidth * 0.8,
                                                height: screenHeight * 0.4}} 
                                                source={require('../../assets/images/active.png')}  />
                </View>  
                <Text style={styles.textStyle}>Anyone can see when you're active or recently active on this profile. You can see this info about them too. To change setting, turn it off wherever you're using chatME and your active status will no longer be shown. You can still use our app if active status is off.</Text>    
         </SafeAreaView>
    );
    }
    const styles = StyleSheet.create({
    
    textStyle:{
      color:'gray',
      marginLeft:30,
      marginRight:30,
      textAlign:'center',
      marginBottom:20,
      ...Platform.select({
        ios: {
          marginTop:screenHeight < 768 ? -20:-40,
          fontSize:screenHeight < 768 ? 13:14,
        },
        android: {
          marginTop:-20,
        },
        default: {
          top:0,
        },
      }),
    },
    header: {
        ...Platform.select({
            ios: {
              top:screenHeight < 768 ? -2:-10, 
            },
            android: {
              top: 28, 
            },
            default: {
              top:0,
            },
          }),
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
      },
      headerRight:{
        right:10,
        flexDirection: 'row',
        alignItems: 'center',
      },
      headerLeft: {
        zIndex:99,
        left:10,
        alignItems: 'flex-start',
      },
      headerText: {
        fontSize: screenHeight < 768 ? 15: 18,
        fontWeight: '500',
      },
      headerCenter: {
        marginStart:30,
        flex: 1,  // This will make it take up the available horizontal space
        alignItems: 'center',
      },

    });