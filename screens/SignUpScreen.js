import { View, Text, TouchableOpacity,ScrollView, Dimensions } from 'react-native'
import React, { useState } from 'react';
import { themeColors } from '../theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/solid'; 
import { useNavigation } from '@react-navigation/native'; 
import InputWithIcon from '../components/InputWithIcon';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import {FIREBASE_AUTH} from '../config/firebase';
import CustomModal from '../components/CustomModal';

export default function SignUpScreen() {

    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordErrors, setPasswordError] = useState('');
   
    const [isFirstNameValid, setIsFirstNameValid] = useState('');
    const [isLastNameValid, setIsLastNameValid] = useState('');
    const [isEmailValid, setIsEmailValid] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState('');
   
    const [iconName,setIcon] = useState('');
    const [inValid, InvalidCredential] = useState('');
    const [titleError,setTitle] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
   
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
    };

    const handleSignUp = async () => {
  
    // First Name validation
    const isFirstNameValid = firstName && firstName.length >= 2;

      if(!firstName){
        setFirstNameError(' First name is required!');
      }
      else if ( firstName.length < 2) {
        setFirstNameError(' First name must have 2 characters or more!');
      } else {
        setFirstNameError('');
      }
     
      if(!lastName) {
        setLastNameError(' Last name is required!');
      }
      else if ( lastName.length < 2) {
        setLastNameError('Last name must have 2 characters or more!');
      } else {
        setLastNameError('');
      }
  
      // Last Name validation
       const isLastNameValid = lastName && lastName.length >= 2;

       const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
      if (!email) {
        setEmailError('Email is required!');
      } else if (!emailRegex.test(email)) {
        setEmailError('Invalid email format (example@gmail.com)');
      } else {
        setEmailError('');
      }

      // Email validation
      const isEmailValid = email && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);

      // Password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
     
      let passwordError = 'Password must meet the following criteria:\n';
      if (!password) {
        setPasswordError(' Password is required!');
      } else {
        if (!/(?=.*[a-z])/.test(password)) {
          passwordError += ' At least 1 Lowercase\n';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
          passwordError += ' At least 1 Uppercase\n';
        }
        
        if (!/(?=.*[@$!%*?&])/.test(password)) {
          passwordError += ' At least 1 Symbol\n';
        }
        if (password.length < 6) {
          passwordError += ' Minimum of 6 characters\n';
        }

        if (passwordError === 'Password must meet the following criteria:\n') {
          setPasswordError('');
          setIsPasswordValid(true);
        } else {
          setPasswordError(passwordError);
        }
      }

      setIsFirstNameValid(isFirstNameValid);
      setIsLastNameValid(isLastNameValid);
      setIsEmailValid(isEmailValid);
    
      // Continue with sign-up logic if all inputs are valid
      if (firstName && lastName && email && password) {
          
        try {
          await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
          console.log('User created successfully.');
        } catch (err) {
          if (err.code === 'auth/email-already-in-use') {
            // Email is already in use
            InvalidCredential('Please double-check the email address or use a different one');
            setTitle('Email already exists');
            setIcon('alert-circle-outline')
            setEmailError('Email already exists');
            openModalInvalid();
            console.log('Email already exists');
          } else {
            console.log('Error creating user:', err.message);
          }
        }
       
      }
    };


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
      <TouchableOpacity onPress={() => navigation.goBack()} 
      className="p-2 rounded-2xl bg-white rounded-bl-2xl md-4 ml-3">
        <ArrowLeftIcon size="25"  color={themeColors.semiBlack} />
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
        Create an acount</Text>
      <Text className={`ml-2`} 
      style={{ fontWeight: 'semibold',color: 'gray', fontSize:screenWidth < 768 ? 15: 17, marginTop: 5, marginBottom: 20 }}>
        Enter your details to Register
      </Text>
      
      <View className="form space-y-2">
      <Text className={`${textSize} text-gray-700 ml-2`}>First Name</Text>
      
      <InputWithIcon
        iconName="user"
        placeholder="First name"
        value={firstName}
        onChangeText={value => setFirstName(value)}
        isNameInput={true}
        setError={setFirstNameError}
        hasError={firstNameError}
        onTyping={() => setFirstNameError('')}
        isValid={isFirstNameValid}
        style={{paddingTop: screenWidth < 768 ? -1 : 4,
        paddingBottom: screenWidth < 768 ? -1 : 4}}
        />

     <Text style={{color:themeColors.invalidColor ,marginStart:5}}>{firstNameError}</Text>

      <Text className={`${textSize} text-gray-700 ml-2`}>Last Name</Text>
     
      <InputWithIcon
        iconName="user"
        placeholder="Last name"
        value={lastName}
        onChangeText={value => setLastName(value)}
        isNameInput={true}
        setError={setLastNameError}
        hasError={lastNameError}
        onTyping={() => setLastNameError('')}
        isValid={isLastNameValid}
        style={{paddingTop: screenWidth < 768 ? -1 : 4,
        paddingBottom: screenWidth < 768 ? -1 : 4}}
      />
      
     <Text style={{color:themeColors.invalidColor,marginStart:5}}>{lastNameError}</Text> 
      <Text className={`${textSize} text-gray-700 ml-2`}>Email Address</Text>
      <InputWithIcon
        iconName="envelope"
        placeholder="Email"
        value={email}
        onChangeText={value => setEmail(value)}
        secureTextEntry={false}
        setError={setEmailError}
        hasError={emailError}
        onTyping={() => setEmailError('')}
        isValid={isEmailValid}
        style={{paddingTop: screenWidth < 768 ? -1 : 4,
        paddingBottom: screenWidth < 768 ? -1 : 4}}
      />
      <Text style={{color:themeColors.invalidColor,marginStart:5}}>{emailError}</Text>

      <Text className={`${textSize} text-gray-700 ml-2`}>Password</Text>
      
      <InputWithIcon
        iconName="lock"
        placeholder="Password"
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

      <Text style={{color:themeColors.invalidColor,marginBottom:5,marginStart:5}}>{passwordErrors}</Text>


      <TouchableOpacity
        className={`${buttonText}  rounded-3xl m-5`}
        style={{ backgroundColor: themeColors.semiBlack }}
        onPress={handleSignUp}
      >
        <Text style={{ fontSize: 17 }} className="font-bold text-center text-white sm:mb-1">
          Sign Up
        </Text>
      </TouchableOpacity>
        </View>
        <View className="flex-row justify-center ml-2 mt-1 sm:mb-1" style={{marginBottom:20}}>
            <Text>Already have an account?</Text>
            <TouchableOpacity onPress={()=> navigation.navigate('Login')}>
                <Text className="font-semibold" style={{color:themeColors.buttonColorPrimary}}> Login</Text>
            </TouchableOpacity>
        </View>
      </View>
      {inValid && (
        <CustomModal iconName={iconName} title={titleError} message={inValid} visible={modalVisible} onClose={closeModal} onOkay={handleOkayInvalid} />
      )}
      </View>
      </ScrollView>
  )
}