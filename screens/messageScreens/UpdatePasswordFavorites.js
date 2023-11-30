import { View, Text,TouchableOpacity,ScrollView, Dimensions } from 'react-native'
import React, { useState,useEffect} from 'react';
import { themeColors } from '../../theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/solid'; 
import InputWithIcon from '../../components/InputWithIcon';
 import {FIREBASE_DB} from '../../config/firebase';
import { doc, setDoc,getDoc,updateDoc } from "firebase/firestore";
import CustomModal from '../../components/CustomModal';
import { encode,decode } from 'base-64';
import { useUserData } from '../../components/userData';
import { useRoute } from '@react-navigation/native';

export default function UpdatePasswordFavorites({navigation}) {
   
   
    const route = useRoute();
    const {whereTo} = route.params;
    
    const { userData } = useUserData();
    useEffect(() => {
        console.log('User Data:', userData);
    }, [userData]);

    const userId = userData? userData.id : '';
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [passwordErrors, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [oldPasswordErrors, setOldPasswordError] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState('');
    const [isConfirmPasswordValid, setConfirmPasswordValid] = useState('');
    const [oldPasswordValid, setOldPasswordValid] = useState('');
    const [iconName,setIcon] = useState('');
    const [inValid, InvalidCredential] = useState('');
    const [titleError,setTitle] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [colorPicked,setColorPicked] = useState('');
    const openModalInvalid = () => {
      setModalVisible(true);
    };
   
    const closeModal = () => {
      setModalVisible(false);
    };

    const handleOkayInvalid = () => {
      // Handle 'Okay' button press
      InvalidCredential('');
      closeModal();
      if(iconName === 'checkmark-circle')
      navigation.navigate('FavoritesMessage',{whereTo});
    };

    const handleSignUp = async () => {
        // Password validation
    
        const secondPass = decodeFromBase64(userData.secondPassword);
        let isValid = true; // Flag to check overall password validity
        let isValidConfirm = true;
        let oldPasswordValidBoolean = true;
        if(!oldPassword){
            setOldPasswordError('Current password is required!');
            oldPasswordValidBoolean = false;
        }else if(oldPassword !== secondPass){
            setOldPasswordError('Current password is incorrect');
            oldPasswordValidBoolean = false;
        }
        else{
          oldPasswordValidBoolean = true;
        }

        if (!password) {
          setPasswordError('Password is required!');
          isValid = false;
        } else {
          if (!/(?=.*[a-z])/.test(password)) {
            setPasswordError('Password must contain at least 1 lowercase character');
            isValid = false;
          }
          if (!/(?=.*[A-Z])/.test(password)) {
            setPasswordError('Password must contain at least 1 uppercase character');
            isValid = false;
          }
          if (!/(?=.*[@$!%*?&])/.test(password)) {
            setPasswordError('Password must contain at least 1 special character');
            isValid = false;
          }
          if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            isValid = false;
          }
        }
      
        // Confirm Password validation
        if (!confirmpassword) {
          setConfirmPasswordError('Confirm Password is required!');
          isValidConfirm = false;
        } else if (confirmpassword !== password) {
          setConfirmPasswordError("Passwords don't match");
          isValidConfirm = false;
        } else {
          setConfirmPasswordError('');
          isValidConfirm = true;
        }
      
        if (isValid && isValidConfirm && oldPasswordValidBoolean) {
          // Continue with the rest of your logic
          setPasswordError('');
          setConfirmPasswordError('');
          setOldPasswordError('');
          setIsPasswordValid(true);
          setConfirmPasswordValid(true);
          setOldPasswordValid(true);
 
          try {
            const mainPass = decodeFromBase64(userData.primaryPassword);
           if(mainPass === password){
                InvalidCredential('Password must be unique from your main password!');
                setTitle('Error: Not a unique password');
                setIcon('alert-circle-outline');
                openModalInvalid();
                setColorPicked('');
            }
            else if(secondPass === password){
                InvalidCredential('Password must be unique from your current password!');
                setTitle('Error: Not a unique password');
                setIcon('alert-circle-outline');
                openModalInvalid();
                setColorPicked('');
            }
            else{
              if (oldPassword && password && confirmpassword) {

                    const passEncode = encodeToBase64(password);
                    const userDocRef = doc(FIREBASE_DB, 'User', userId);
                    const userData = {
                      secondPassword: passEncode,
                    };
                    await setDoc(userDocRef, userData, { merge: true });
                   
                    InvalidCredential('You can now logout and use your second password to access favorite messages!');
                    setTitle('Password Updated!');
                    setIcon('checkmark-circle');
                    openModalInvalid();
                    setColorPicked(themeColors.semiBlack);
                }
            }

          } catch (err) {
            console.log('Error:',err.message);
          }
        }
        else{
          return;
        }
      };
      

    // Function to encode to base64
    function encodeToBase64(data) {
      const encodedData = encode(data);
      return encodedData;
    }
    // Function to decode base64 data
       function decodeFromBase64(base64Data) {
        const decodedData = decode(base64Data);
        return decodedData;
    }

    const screenWidth = Dimensions.get('window').height;
    const textSize = screenWidth < 768 ? 'text-xs' : '';
    const buttonText = screenWidth < 768 ? 'py-3' : 'py-4';

  return (
    <ScrollView style={{ flex: 1 , backgroundColor: 'white'}}
    showsVerticalScrollIndicator={false} // Hide vertical scrollbar
    showsHorizontalScrollIndicator={false} >
  <View className="flex-1 bg-white" style={{backgroundColor: themeColors.bg}}>
    <SafeAreaView className="flex">
    <View className="flex flex-row items-center justify-start ml-2 mt-2">
    <TouchableOpacity onPress={() => navigation.goBack()} style={{marginStart:10}}
    className="p-2 rounded-2xl bg-white rounded-bl-2xl md-4 ml-3">
      <ArrowLeftIcon size="20"  color={themeColors.semiBlack} />
    </TouchableOpacity>
    </View>
    </SafeAreaView>
    
    <View className={`flex-1 bg-white px-8`}>
    
    <View style={{borderBottomWidth: 5, 
      marginTop:screenWidth < 768 ? 15: 0,
      borderBottomColor: themeColors.buttonColorPrimary,
      marginRight:screenWidth < 768 ? 275:330,
      marginLeft:10,marginBottom:-8 }} />
    
    
    <Text className={`ml-2`} 
    style={{ color:themeColors.semiBlack,fontWeight: 'bold', fontSize:screenWidth < 768 ? 22: 26, marginTop: 10, marginBottom: 1 }}>
      Change password</Text>
    <Text className={`ml-2`} 
    style={{ fontWeight: 'semibold',color: 'gray', fontSize:screenWidth < 768 ? 15: 17, marginTop: 5, marginBottom: 20 }}>
   Your password must be at least 6 characters and should include a combination of number, letters and special characters. Ensure it's not the same as your main password!
    </Text>
    <View style={{flex:1,alignItems:'center'}}>
     </View>
   
    <View className="form space-y-2">

 
    <Text style={{marginTop:20,}} className={`${textSize} text-gray-700 ml-2`}>Current password</Text>
    <InputWithIcon
      iconName="lock"
      placeholder="New password"
      value={oldPassword}
      onChangeText={value => setOldPassword(value)}
      secureTextEntry={true}
      setError={setOldPasswordError}
      hasError={oldPasswordErrors}
      onTyping={() => setOldPasswordError('')}
      isValid={oldPasswordValid}
      style={{paddingTop: screenWidth < 768 ? -1 : 4,
        paddingBottom: screenWidth < 768 ? -1 : 4}}
    />
    <Text style={{color:themeColors.invalidColor,marginBottom:1,marginStart:5}}>{oldPasswordErrors}</Text>
    <Text style={{marginTop:20,}} className={`${textSize} text-gray-700 ml-2`}>New Password</Text>
    <InputWithIcon
      iconName="lock"
      placeholder="Re-type new Password"
      value={password}
      onChangeText={value => setPassword(value)}
      secureTextEntry={true}
      setError={setPasswordError}
      hasError={passwordErrors}
      onTyping={() => setPasswordError('')}
      isValid={isPasswordValid}
      style={{paddingTop: screenWidth < 768 ? -1 : 4,
        paddingBottom: screenWidth < 768 ? -1 : 4}}
    />
    <Text style={{color:themeColors.invalidColor,marginBottom:1,marginStart:5}}>{passwordErrors}</Text>
    <Text className={`${textSize} text-gray-700 ml-2`}>Confirm Password</Text>
    <InputWithIcon
      iconName="lock"
      placeholder="Confirm password"
      value={confirmpassword}
      onChangeText={value => setConfirmPassword(value)}
      secureTextEntry={true}
      setError={setConfirmPasswordError}
      hasError={confirmPasswordError}
      onTyping={() => setConfirmPasswordError('')}
      isValid={isConfirmPasswordValid}
      style={{paddingTop: screenWidth < 768 ? -1 : 4,
        paddingBottom: screenWidth < 768 ? -1 : 4}}
    />

    <Text style={{color:themeColors.invalidColor,marginBottom:20,marginStart:5}}>{confirmPasswordError}</Text>

    <TouchableOpacity
      className={`${buttonText}  rounded-3xl m-5`}
      style={{ backgroundColor: themeColors.semiBlack }}
      onPress={handleSignUp}
    >
      <Text style={{ fontSize: 17 }} className="font-bold text-center text-white sm:mb-1">
        Submit
      </Text>
    </TouchableOpacity>
      </View>

    </View>
    {inValid && (
      <CustomModal iconName={iconName} colorItem={colorPicked} title={titleError} message={inValid} visible={modalVisible} onClose={closeModal} onOkay={handleOkayInvalid} />
    )}
    </View>
    </ScrollView>
  )
}