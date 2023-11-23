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
import { decode } from 'base-64';

export default function LoginScreen() {

  const navigation = useNavigation();
 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [primaryPassword, setPrimaryPassword] = useState('');
 
  const [iconName,setIcon] = useState('');
  const [inValid, InvalidCredential] = useState('');
  const [titleError,setTitle] = useState('');

  const screenWidth = Dimensions.get('window').height;
  const marginTop = screenWidth < 768 ? 'mt-3': 'mt-1';
  const [loading, setLoading] = useState(false);
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
  
  const handleLogin = async () => {
  
    try {
      setLoading(true);
      if (email && password) {
        const userCollectionRef = collection(FIREBASE_DB, 'User');
        const userQuery = query(userCollectionRef, where('email', '==', email));
        const userQuerySnapshot = await getDocs(userQuery);
        
        if (userQuerySnapshot.docs.length > 0) {
          // Assuming there's only one user with a given email
          const userData = userQuerySnapshot.docs[0].data();
  
          if (userData.secondPassword) {
            // Assuming you have a function like isSecondaryPassword for checking the secondary password
            const secondaryCheck =  await isSecondaryPassword(password, userData.secondPassword);
              
            if (secondaryCheck === true) {
              const conversationDocRef = doc(FIREBASE_DB, 'User', userData.id);
              await updateDoc(conversationDocRef, {
                loggedAs: 'hidden',
              });
              await new Promise((resolve) => setTimeout(resolve, 2000));
               setLoading(false);
              await signInWithEmailAndPassword(FIREBASE_AUTH, email, decodeFromBase64(userData.primaryPassword)); // Use password here, not primaryPassword
            }
          }

          const primaryCheck = await isPrimaryPassword(password, userData.primaryPassword);
          if (primaryCheck) {
            const conversationDocRef = doc(FIREBASE_DB, 'User', userData.id);
            await updateDoc(conversationDocRef, {
              loggedAs: 'normal',
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setLoading(false);
            await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
          }
          setLoading(false);
          openModalInvalid();
          InvalidCredential('Tip: Double-check your login details.');
          setTitle('Account not found.');
          setIcon('alert-circle-outline');
        }
      } else {
        setLoading(false);
        console.log('Login error: Empty fields');
        openModalInvalid();
        InvalidCredential('Tip: Enter your credentials to log in.');
        setTitle('Empty fields');
        setIcon('alert-circle-outline');
      }
    } catch (err) {
      setLoading(false);
      console.log('Login error:', err.message);
      openModalInvalid();
      InvalidCredential('Tip: Double-check your login details.');
      setTitle('Account not found.');
      setIcon('alert-circle-outline');
    }
  };
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

            <TouchableOpacity className="flex items-end">
            <Text className="text-gray-700 mb-5 my-3" style={styles.text}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogin}
              className="py-3 rounded-3xl" style={{backgroundColor: themeColors.semiBlack}}>
                <Text 
                    className="text-xl font-bold text-center text-white"
                >
                        Login
                </Text>
             </TouchableOpacity>
             <View className="flex-row justify-center mt-7">
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
     {inValid && (
        <CustomModal iconName={iconName} title={titleError} message={inValid} visible={modalVisible} onClose={closeModal} onOkay={handleOkayInvalid} />
      )}
    </View>
  
  )

}
const styles = StyleSheet.create({
  text: {
    color: themeColors.bg,
  },
});