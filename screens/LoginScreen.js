import { View, Text,Image,StyleSheet,Dimensions,Modal,ActivityIndicator,TouchableOpacity } from 'react-native'
import React, {useState} from 'react'
import {themeColors} from '../theme'
import { SafeAreaView } from 'react-native-safe-area-context';
import {ArrowLeftIcon} from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import InputWithIcon from '../components/InputWithIcon';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {FIREBASE_AUTH,FIREBASE_DB} from '../config/firebase';
import CustomModal from '../components/CustomModal';
import { getDocs,doc,updateDoc,where,collection,query } from 'firebase/firestore';
import { decode, encode } from 'base-64';

export default function LoginScreen() {

  const navigation = useNavigation();
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const screenWidth = Dimensions.get('window').height;
  const marginTop = screenWidth < 768 ? 'mt-3': 'mt-1';
  const [iconName,setIcon] = useState('');
  const [inValid, InvalidCredential] = useState('');
  const [titleError,setTitle] = useState('');

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
 
 

  const handleOkayInvalid = () => {
      // Handle 'Okay' button press
      setModalVisible(false);
      
  };
  
  const handleLogin = async () => {
  
    try {
      // Check if email and password are provided
      if (email && password) {
        const userCollectionRef = collection(FIREBASE_DB, 'User');
        const userQuery = query(userCollectionRef, where('email', '==', email));
        const userQuerySnapshot = await getDocs(userQuery);
  
        // Check if user with the given email exists
        if (userQuerySnapshot.docs.length > 0) {
          const userData = userQuerySnapshot.docs[0].data();
          
          // Check primary password
          const primaryCheck = await isPrimaryPassword(password, userData.primaryPassword);
  
          // Check secondary password if available
          if (userData.secondPassword) {
            setLoading(true);
            const secondaryCheck = await isSecondaryPassword(password, userData.secondPassword);
  
            if (secondaryCheck) {
              // Hide user after successful login
              const conversationDocRef = doc(FIREBASE_DB, 'User', userData.id);
              await updateDoc(conversationDocRef, {
                loggedAs: 'hidden',
              });
  
              // Delay for a better user experience
              await new Promise((resolve) => setTimeout(resolve, 2000));
              setLoading(false);
  
              // Sign in with primary password
              await signInWithEmailAndPassword(FIREBASE_AUTH, email, decodeFromBase64(userData.primaryPassword));
            }
          } 
          
          if (primaryCheck) {
            setLoading(true);
            // Show user as normal after successful login
            const conversationDocRef = doc(FIREBASE_DB, 'User', userData.id);
            await updateDoc(conversationDocRef, {
              loggedAs: 'normal',
            });
          }
          
          try{
            //if not primary nor secondpassword check only the password if it's the current password of the user
            //maybe it is the reset password
            setLoading(true);
            const conversationDocRef = doc(FIREBASE_DB, 'User', userData.id);
            await updateDoc(conversationDocRef, {
              primaryPassword: encode(password),
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setLoading(false);
            await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);

          }catch{
            setLoading(false);
            showLoginError('Account not found. Double-check your login details.');
          }
           
          setLoading(false);
          showLoginError('Account not found. Double-check your login details.');
       
        } else {
          // User not found
          setLoading(false);
          showLoginError('Account not found. Double-check your login details.');
        }
      } else {
        // Empty fields
        setLoading(false);
        showLoginError('Enter your credentials to log in.');
      }
     
    } catch (err) {
      // General login error
      setLoading(false);
      showLoginError('Double-check your login details. Account not found.');
    }
  };
  const showLoginError = (message) => {
    setModalVisible(true);
    InvalidCredential(`Tip: ${message}`);
    setTitle('Login Error');
    setIcon('alert-circle-outline');
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

// Function to check if the entered password matches the primary password
async function isPrimaryPassword(enteredPassword, storedPrimaryPassword) {
  try {
    // Decode base64-encoded primary password
    const decodedPrimaryPassword = decodeFromBase64(storedPrimaryPassword);
    // Compare entered password with the decoded primary password
    const result = enteredPassword === decodedPrimaryPassword ? true : false;
    console.log('result primary:',result);
    return result;
  } catch (error) {
    console.error('Error decoding or comparing passwords:', error);
    return false;
  }
}

async function isSecondaryPassword(enteredPassword, storedSecondaryPassword) {
  try {
    // Decode base64-encoded secondary password
    const decodedSecondaryPassword = decodeFromBase64(storedSecondaryPassword);
    const result = enteredPassword === decodedSecondaryPassword ? true : false;
    console.log('result secondary:',result);
    return result;
  } catch (error) {
    console.error('Error decoding or comparing passwords:', error);
    return false;
  }
}

  return (
    <View className="flex-1 bg-white" 
    style={{backgroundColor:themeColors.bg}}>
     <SafeAreaView className={`${marginTop} flex`}>
     <View style={{zIndex: 999}} className="flex flex-row items-center justify-start ml-2 mt-2">
      <TouchableOpacity onPress={() => navigation.goBack()} 
      className="p-2 rounded-2xl bg-white rounded-bl-2xl md-4 ml-2">
        <ArrowLeftIcon  size={screenWidth < 768 ? 30 :32}  color={themeColors.semiBlack} />
      </TouchableOpacity>
      </View>
        
        <View style={{marginTop:-50,
          marginBottom:screenWidth < 768 ? 30: -20}} className="flex-row  justify-center">
          <Image source={require('../assets/images/logo.png')} 
          style={{width: screenWidth < 768 ? screenWidth * 0.5 :screenWidth * 0.4,
           height: screenWidth < 768 ? screenWidth * 0.4 :screenWidth * 0.4}}/>

        </View>
     </SafeAreaView>
     <View  style={{marginTop:-80,borderTopLeftRadius: 50, borderTopRightRadius: 50}} 
     className="flex-1 bg-white px-8 pt-8">
        <Text className="text-gray-700 ml-4 mb-1 ">Email Address</Text>
        <InputWithIcon
        iconName="envelope"
        placeholder="Email"
        value={email}
        onChangeText={value => setEmail(value)}
        secureTextEntry={false}
        setError={InvalidCredential}
        hasError={inValid}
        onTyping={() => InvalidCredential('')}
        style={{paddingTop: screenWidth < 768 ? -1 : 4,
        paddingBottom: screenWidth < 768 ? -1 : 4}}
      />
     <Text className="text-gray-700 ml-4 mt-5 mb-1 ">Password</Text>
     <InputWithIcon
        iconName="lock"
        placeholder="Password"
        value={password}
        onChangeText={value => setPassword(value)}
        secureTextEntry={true}
        setError={InvalidCredential}
        hasError={inValid}
        onTyping={() => InvalidCredential('')}
        style={{paddingTop: screenWidth < 768 ? -1 : 4,
          paddingBottom: screenWidth < 768 ? -1 : 4}}
      />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} className="flex items-end">
            <Text className="text-gray-700 mb-5 my-3"
             style={{...styles.text,
             color:themeColors.semiBlack,marginBottom:20,fontSize:14}}>
              Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogin}
              className="py-2.5 rounded-3xl" style={{backgroundColor: themeColors.semiBlack}}>
                <Text 
                    className="text-xl font-bold text-center text-white"
                >
                        Login
                </Text>
             </TouchableOpacity>
             <View className="flex-row justify-center mt-4">
              <Text className="text-gray-500 font-semibold">
                  Don't have an account?
              </Text>
              <TouchableOpacity onPress={()=> navigation.navigate('SignUp')}>
                  <Text className="font-semibold " style={{color:themeColors.buttonColorPrimary}}> Sign Up</Text>
              </TouchableOpacity>
          </View>
     </View>
     {loading && ( 
    <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={{backgroundColor:'rgba(0, 0, 0, 0.5)',flex:1,justifyContent:'center'}}>
        <View style={{ backgroundColor: 'white',marginLeft:15,marginRight:15 , paddingLeft: 25,paddingRight:25,paddingBottom:20,paddingTop:30, borderRadius: 20 }}>
          <ActivityIndicator size="large" color="gray" />
          <Text style={{textAlign:'center',color:themeColors.semiBlack,marginTop:10,fontWeight:'bold'}}>Loading...</Text>
        </View>
        </View>
    </Modal> )}  
    <CustomModal iconName={iconName} title={titleError} message={inValid} visible={modalVisible}  onOkay={handleOkayInvalid} />
    </View>
  );
}
const styles = StyleSheet.create({
  text: {
    color: themeColors.bg,
  },
});