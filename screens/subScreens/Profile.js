import React, { useState, useEffect } from 'react';
import { View, Text, Image,Platform, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useUserData } from '../../components/userData';
import { themeColors } from '../../theme';
import Icon, { Icons } from '../../components/Icons';
import 'firebase/compat/storage';
import {ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {  doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { FIREBASE_DB,FIREBASE_STORAGE } from '../../config/firebase'; // Replace with the correct path to your firebase.js file
import { getAuth, signOut } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
export default function ProfileScreen({ navigation }) {

    const { userData } = useUserData();
    useEffect(() => {
        console.log('User Data:', userData);
    }, [userData]);
    const auth = getAuth();
    const handleLogout = async () => {
      try {
     // Get the user's Firestore document reference
      const userDocRef = doc(FIREBASE_DB, 'User', userData.id);

      // Update the isOnline field to "false"
      await updateDoc(userDocRef, {
        isOnline: 'false',
      });

        await signOut(auth); // Sign the user out
        navigation.navigate('Splash'); // Navigate to the login screen or any other screen you prefer
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
    const name = userData ? userData.firstName + ' ' + userData.lastName : 'Unknown';
    const email = userData ? userData.email : 'Unknown email';
    const isVerified = userData ? userData.isVerified : false;
    console.log("isVerified:",isVerified);
    const noImage = require('../../assets/images/noprofile.png');
    const profilePic = userData ? userData.profilePic : '';
    const [image, setImage] = useState(null);
    const hasSecondPassword = userData ? userData.secondPassword : null;


    const handlePress = async () => {
        // Request permission to access the gallery (camera roll)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (status === 'granted') {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
            });
    
            if (result) { // Check if result is not undefined
                if (!result.canceled) { // Use "cancelled" instead of "canceled"
                    const imageUri = result.assets[0].uri;
                    setImage(imageUri);
                    console.log('Selected Image URI:', imageUri);
                    try {
                        // Upload the image to Firebase Storage and update Firestore
                        const downloadURL = await uploadImageAndSetProfilePic(userData.id, imageUri);
                        console.log('Image uploaded to Firebase:', downloadURL);
                    } catch (error) {
                        console.error('Error uploading image:', error);
                    }
                } else {
                    console.log('User cancelled');
                }
            } else {
                console.log('Image picker returned undefined result');
            }
        } else {
            console.log('Permission denied to access the gallery.');
        }
    };
 
    const handleEditIconPress = () => {
        handlePress();
    };

    const uploadImageAndSetProfilePic = async (userId, selectedImageUri) => {
        // Define the path where you want to store the image in Firebase Storage
        const storageRef = ref(FIREBASE_STORAGE, `User/${userId}/profile.jpg`);
        
        // Convert the selected image to a Blob
        const imageBlob = await fetch(selectedImageUri).then((response) => response.blob());
    
        try {
            // Upload the image to Firebase Storage
            const snapshot = await uploadBytes(storageRef, imageBlob);
    
            // Get the download URL of the uploaded image
            const downloadURL = await getDownloadURL(snapshot.ref);
    
            // Update the Firestore document with the download URL
            const userDocRef = doc(FIREBASE_DB, 'User', userId);
            const userData = { profilePic: downloadURL }; // Field to update
    
            const userDocSnapshot = await getDoc(userDocRef);
    
            if (userDocSnapshot.exists()) {
                // Update the field if the document exists
                await updateDoc(userDocRef, userData);
            } else {
                // Create the document and set the field if it doesn't exist
                await setDoc(userDocRef, userData);
            }
    
            // Return the download URL in case you want to display the updated image
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image to Firebase:', error);
            throw error;
        }
    };

    const handleFavoritePress = () => {
     if(hasSecondPassword){
      const whereTo = "Profile";
      navigation.navigate('FavoritesMessage',{whereTo}); // Navigate to Conversation and pass the id
     }else{
      navigation.navigate('OnboardingScreen',{from:"Profile"});
     }
    }
    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor:'white',
            }}>

<View style={styles.header}>
  <View style={styles.headerLeft}>
    <TouchableOpacity style={{ zIndex:999,}} onPress={() => navigation.goBack()}>
    <Image style={{width: screenHeight < 768 ? 25:30,
                                height: screenHeight < 768 ? 25:30}} 
                                source={require('../../assets/icons/left.png')}/>
     </TouchableOpacity>
  </View>
  <View style={styles.headerCenter}>
    <Text style={styles.headerText}>My Profile</Text>
  </View>
  <TouchableOpacity onPress={handleLogout} >
      <Icon type={Icons.Feather}
               name="log-out" 
               color={themeColors.semiBlack} 
               size={screenHeight < 768 ? 20 : 25} 
               style={{marginEnd:10,marginStart:-35,marginTop:-2}}/>
     </TouchableOpacity>
</View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                showsVerticalScrollIndicator={false}>
                
                <View style={styles.rowContainer}>
                <View style={styles.column}> 
                 <TouchableOpacity style={styles.imageContainer} onPress={handlePress}>
                    <Image
                    style={styles.userImg}
                    source={profilePic ? { uri: userData.profilePic } : noImage}
                    />
                    <TouchableOpacity style={styles.editIconContainer} onPress={handleEditIconPress}>
                    <Icon type={Icons.Entypo} name="camera" color={themeColors.prima} size={screenHeight < 768 ? 17 : 22} />
                    </TouchableOpacity>
                </TouchableOpacity>
                </View>

                <View style={styles.column}>
                <Text style={styles.userName}>{name}</Text>
                <Text style={styles.aboutUser}>{email}</Text>
                
                <View style={{ display: isVerified  === false ? 'flex' : 'none' }}>
               
                  <TouchableOpacity style={styles.userBtn} onPress={() => navigation.navigate('')}>
                  <Text style={styles.userBtnTxt}>Verify email</Text>
                  </TouchableOpacity>
                
                </View> 
              </View>
              </View>
              <View style={styles.firstLine} />
              <View style={{width:'100%',marginTop:20}}>
                    
                       <TouchableOpacity onPress={handleFavoritePress} style={styles.buttonContainer}>
                          <View style={styles.buttonColumn}>
                            <Icon type={Icons.Feather} name="heart" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                              <Text style={styles.buttonText}>Favorites</Text>
                          </View>
                              <Image style={{width: screenHeight < 768 ? 25:30,
                                height: screenHeight < 768 ? 25:30}} 
                                source={require('../../assets/icons/right.png')}/>
                      </TouchableOpacity> 
                      <TouchableOpacity style={styles.buttonContainer}>
                          <View style={styles.buttonColumn}>
                            <Icon type={Icons.Feather} name="bell" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                              <Text style={styles.buttonText}>Notification</Text>
                          </View>
                              <Image style={{width: screenHeight < 768 ? 25:30,
                                height: screenHeight < 768 ? 25:30}} 
                                source={require('../../assets/icons/right.png')}/>
                      </TouchableOpacity> 
                      <TouchableOpacity style={styles.buttonContainer}>
                      
                      <View style={styles.buttonColumn}>
                        <Icon type={Icons.Feather} name="moon" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                          <Text style={styles.buttonText}>Dark Mode</Text>
                      </View>
                          <Image style={{width: screenHeight < 768 ? 25:30,
                            height: screenHeight < 768 ? 25:30}} 
                            source={require('../../assets/icons/right.png')}/>
                  </TouchableOpacity> 
              </View>
              <View style={styles.line} />
              <View style={{width:'100%',marginTop:30}}>
                    
                    <TouchableOpacity style={styles.buttonContainer}>
                       <View style={styles.buttonColumn}>
                         <Icon type={Icons.Feather} name="settings" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                           <Text style={styles.buttonText}>Account Settings</Text>
                       </View>
                           <Image style={{width: screenHeight < 768 ? 25:30,
                             height: screenHeight < 768 ? 25:30}} 
                             source={require('../../assets/icons/right.png')}/>
                   </TouchableOpacity> 
                   <TouchableOpacity style={styles.buttonContainer}>
                       <View style={styles.buttonColumn}>
                         <Icon type={Icons.Feather} name="lock" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                           <Text style={styles.buttonText}>Privacy Settings</Text>
                       </View>
                           <Image style={{width: screenHeight < 768 ? 25:30,
                             height: screenHeight < 768 ? 25:30}} 
                             source={require('../../assets/icons/right.png')}/>
                   </TouchableOpacity> 
                  
           </View>
           <View style={styles.line} />
        
           <View style={{width:'100%',marginTop:30}}>
           <TouchableOpacity style={styles.buttonContainer}>
                       <View style={styles.buttonColumn}>
                         <Icon type={Icons.Feather} name="info" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                           <Text style={styles.buttonText}>About</Text>
                       </View>
                           <Image style={{width: screenHeight < 768 ? 25:30,
                             height: screenHeight < 768 ? 25:30}} 
                             source={require('../../assets/icons/right.png')}/>
                   </TouchableOpacity> 
          
           <TouchableOpacity onPress={handleLogout} style={styles.buttonContainer}>
                   <View style={styles.buttonColumn}>
                     <Icon type={Icons.Feather} name="log-out" color={themeColors.invalidColor} size={screenHeight < 768 ? 22 : 25} />
                       <Text style={{...styles.buttonText,color:themeColors.invalidColor}}>Logout</Text>
                   </View>
                       <Image style={{width: screenHeight < 768 ? 25:30,
                         height: screenHeight < 768 ? 25:30,tintColor:themeColors.invalidColor}} 
                         source={require('../../assets/icons/right.png')}/>
               </TouchableOpacity> 
               </View>
         
  </ScrollView>
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 70,
  },
  line: {
    top:10,
    height: 1, 
    borderRadius: 25,
    width: screenWidth * 0.9, 
    backgroundColor: '#ccc',
  },
  firstLine: {
    height: 1, 
    borderRadius: 25,
    width: screenWidth * 0.9, 
    backgroundColor: '#ccc',
    ...Platform.select({
      ios: {
        marginTop:30,
      },
      android: {
        marginTop:60,
      },
      default: {
           marginTop:0,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    ...Platform.select({
      ios: {
          top: screenHeight < 768 ? 0:-5, 
      },
      android: {
        top: screenHeight < 768 ? 20:35, 
      },
      default: {
        top:10,
      },
    }),
  },
  headerLeft: {
    left:10,
    alignItems: 'flex-start',
  },
  headerText: {
    right:14,
    fontSize: screenHeight < 768 ? 15: 18,
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,  // This will make it take up the available horizontal space
    alignItems: 'center',
  },
  userImg: {
   
    borderRadius: 75,
    height: screenHeight * 0.11,
    width: screenHeight * 0.11,
    ...Platform.select({
      ios: {
        left:0,
        right:0,
      },
      android: {
        left:10,
        right:10,
      },
      default: {
        left:0,
        right:0,
      },
    }),
  },
  userName: {
    fontSize: screenHeight < 768 ? 15 : 17,
    fontWeight: '400',
    marginTop: 5,
    marginBottom: 5,

  },

  aboutUser: {
    fontSize: screenHeight < 768 ? 12 : 14,
    fontWeight: '600',
    color: themeColors.grey,
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: themeColors.buttonColorPrimary,
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 0,
  },
  userBtnTxt: {
    color: themeColors.buttonColorPrimary,
    fontWeight:'600'
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    padding:7,
    borderRadius:25,
    backgroundColor: themeColors.bg, // Set a background color if you want to make the icon clickable
  },
  rowContainer: {
    ...Platform.select({
      ios: {
       top:0,
      },
      android: {
        top:40,
      },
      default: {
        top:0,
      },
    }),
    padding:10,
    flexDirection: 'row',
    justifyContent: 'space-between', // Adjust as needed
    alignItems: 'center', // Adjust as needed
  },
  column: {
    right:30,
    alignItems: 'flex-start',
    marginHorizontal: 10, // Adjust margin as needed
  },
  buttonContainer: {
    padding:10,
    marginLeft:20,
    marginRight:20,
    marginBottom:10,
    flexDirection: 'row', // Make the columns side by side
    alignItems: 'center', // Align items vertically in the center
    justifyContent: 'space-between', // Space the columns evenly
    paddingHorizontal: 10, // Add padding as needed
  },
  buttonColumn: {
    flex: 1, // Make each column take equal horizontal space
    alignItems: 'center', // Align items vertically in the center
    flexDirection: 'row', // Elements inside columns should be in a row
  },
  buttonText : {
    fontSize: 15,
    fontWeight: '500',
    color: themeColors.semiBlack,
    left: 15,
  },
});