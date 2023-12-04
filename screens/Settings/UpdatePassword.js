import { View, Text,TouchableOpacity,ScrollView, Dimensions } from 'react-native'
import React, { useState,useEffect} from 'react';
import { themeColors } from '../../theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/solid'; 
import InputWithIcon from '../../components/InputWithIcon';
 import {FIREBASE_DB} from '../../config/firebase';
import { doc, setDoc  } from "firebase/firestore";
import CustomModal from '../../components/CustomModal';
import { encode,decode } from 'base-64';
import { useUserData } from '../../components/userData';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

export default function UpdatePassword({navigation}) {
  
    
    const { userData } = useUserData();
    useEffect(() => {
        console.log('User Data:', userData);
    }, [userData]);
    const auth = getAuth();
    const userId = userData? userData.id : '';
    const secondPass = userData ? userData.secondPassword : null;
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
      navigation.navigate('AccountSettings');
    };

    const handleSignUp = async () => {
    
        const primaryPassword = decodeFromBase64(userData.primaryPassword);
        let isValid = true; // Flag to check overall password validity
        let isValidConfirm = true;
        let oldPasswordValidBoolean = false;

        if(!oldPassword){
            setOldPasswordError('Current password is required!');
            oldPasswordValidBoolean = false;
        }else if(oldPassword !== primaryPassword){
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
          else{
            isValid = true;
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
          
            if(secondPass){
              console.log("has 2nd pass:",userData.secondPassword);
                const secondPrimary = decodeFromBase64(userData.secondPassword);
                if(secondPrimary === password){
                     InvalidCredential('Password must be unique from your second password!');
                     setTitle('Error: Not a unique password');
                     setIcon('alert-circle-outline');
                     openModalInvalid();
                     setColorPicked('');
                     return;
                 }
            }
             if(primaryPassword === password){
                InvalidCredential('Password must be unique from your current password!');
                setTitle('Error: Not a unique password');
                setIcon('alert-circle-outline');
                openModalInvalid();
                setColorPicked('');
                return;
            }
            else{
              if (oldPassword && password && confirmpassword) {

                const user = auth.currentUser;

                // Create a credential with the user's email and old password
                const credentials = EmailAuthProvider.credential(user.email, oldPassword);
                  // Reauthenticate the user with the provided credentials
                await reauthenticateWithCredential(user, credentials);

                // If reauthentication is successful, update the password
                await updatePassword(user, password);
              
                InvalidCredential('Your password has been update. Please click the button to continue.');
                setTitle('Password Updated!');
                setIcon('checkmark-circle');
                openModalInvalid();
                setColorPicked(themeColors.semiBlack);

                // Update the password in Firestore or any other necessary actions
                const passEncode = encodeToBase64(password);
                const userDocRef = doc(FIREBASE_DB, 'User', userId);
                const userData = {
                  primaryPassword: passEncode,
                };
                await setDoc(userDocRef, userData, { merge: true });
              }
            }
          } catch (err) {
            console.log('Error:',err.message);
          }
        }
        else{
          console.log('Error');
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
   Your password must be at least 6 characters and should include a combination of number, letters and special characters.
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