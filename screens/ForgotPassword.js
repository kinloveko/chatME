import React, {useState} from 'react'
import { View,SafeAreaView,Modal,ActivityIndicator ,Text,StyleSheet,Image,Platform,TouchableOpacity, Dimensions} from 'react-native';
import { themeColors } from '../theme';
import InputWithIcon from '../components/InputWithIcon';
import CustomModal from '../components/CustomModal';
import {getAuth,sendPasswordResetEmail} from 'firebase/auth';
import { FIREBASE_DB,FIREBASE_AUTH } from '../config/firebase';
import { query,getDocs,doc,collection,where } from 'firebase/firestore';


const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function ForgotPassword({navigation}) {
  
  const auth = getAuth();
  const [email, setEmail] = useState('');
  const [iconName,setIcon] = useState('');
  const [inValid, InvalidCredential] = useState('');
  const [titleError,setTitle] = useState('');
  const [colorPicked,setColorPicked] = useState('');

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
 
  const handleLogin = async () => {
   
    try{
     
      if(email){
        const userCollectionRef = collection(FIREBASE_DB, 'User');
        const userQuery = query(userCollectionRef, where('email', '==', email));
        const userQuerySnapshot = await getDocs(userQuery);
  
        if (userQuerySnapshot.docs.length > 0){
          setLoading(true);
          await sendPasswordResetEmail(auth,email);
          
          await new Promise((resolve) => setTimeout(resolve, 2000));
          setLoading(false);
          setModalVisible(true);
          InvalidCredential(`We have sent an reset password link at ${email}. Please see your email inbox.`);
          setTitle('Email Sent!');
          setIcon('checkmark-circle');
          setColorPicked(themeColors.semiBlack);
        }
        else{
          setLoading(false);
          showLoginError('Email not found. Double-check your email address.');
        }
    
      }
      else{
        setLoading(false);
        showLoginError('Email field is empty. Please input you email address.');
      }
    }catch(error){
      setLoading(false);
      console.error('An error occurred:', error);
      
    }
    }

  const handleOkayInvalid = () => {
    // Handle 'Okay' button press
    setModalVisible(false);
    navigation.navigate('Login');
};
  const showLoginError = (message) => {
    setModalVisible(true);
    InvalidCredential(`${message}`);
    setTitle('Email Error');
    setIcon('alert-circle-outline');
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
                                            source={require('../assets/icons/left.png')}/>
                </TouchableOpacity>
                </View>

                <View style={styles.headerCenter}>
                <Text style={styles.headerText}>Forgot password</Text>

                </View>
                <TouchableOpacity >
                <View style={styles.headerRight}>
                 </View>
                </TouchableOpacity>
            </View>
            <View style={{alignItems:'center'}}>
            <Image  style={{width: screenWidth * 0.8,
                                            height: screenHeight * 0.4}} 
                                            source={require('../assets/images/forgotpassword.png')}  />
            </View>  
            <Text style={styles.textStyle}>Enter the email address associated with your account. We will email you a link to reset your password.</Text>    
            <View style={{flex:1,marginTop:0,marginLeft:30,marginRight:30}}>
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

            <TouchableOpacity onPress={handleLogin}
              className="py-2.5 mt-5 ml-5 mr-5 rounded-3xl" style={{backgroundColor: themeColors.semiBlack}}>
                <Text 
                    className="text-xl font-bold text-center text-white"
                >
                       Send 
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
    <CustomModal colorItem={colorPicked} iconName={iconName} title={titleError} message={inValid} visible={modalVisible}  onOkay={handleOkayInvalid} />
  
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
    marginStart:-25,
    flex: 1,  // This will make it take up the available horizontal space
    alignItems: 'center',
  },
  buttonContainer: {
    padding:10,
    marginLeft:20,
    marginRight:20,
    marginBottom:10,
    borderRadius:20,
    backgroundColor:themeColors.semiGrayTwo,
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