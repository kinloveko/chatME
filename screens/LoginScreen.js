import { View, Text,Image,StyleSheet,Dimensions, TouchableOpacity, TextInput } from 'react-native'
import React, {useState} from 'react'
import {themeColors} from '../theme'
import { SafeAreaView } from 'react-native-safe-area-context';
import {ArrowLeftIcon} from 'react-native-heroicons/solid';
import { useNavigation } from '@react-navigation/native';
import InputWithIcon from '../components/InputWithIcon';
import { signInWithEmailAndPassword } from 'firebase/auth';
import {FIREBASE_AUTH} from '../config/firebase';
import CustomModal from '../components/CustomModal';

export default function LoginScreen() {

  const navigation = useNavigation();

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [iconName,setIcon] = useState('');
  const [inValid, InvalidCredential] = useState('');
  const [titleError,setTitle] = useState('');

  const screenWidth = Dimensions.get('window').height;
  const marginTop = screenWidth < 768 ? 'mt-3': 'mt-1';

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

    if (email && password) {
      try {
        //login auth
        await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
        
      } catch (err) {
        console.log('Sign-in error:', err.message);
        InvalidCredential('Tip : Double-check your login details.');
        setTitle('Account not found.');
        setIcon('alert-circle-outline')
        openModalInvalid();
      }
    } else {
      console.log('Sign-in error:Empty fields');
      setTitle('Empty fields');
      setIcon('alert-circle-outline')
      InvalidCredential('Tip : Enter your credentials to log in.');
      openModalInvalid();
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
            <TouchableOpacity onPress={handleSignUp}
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