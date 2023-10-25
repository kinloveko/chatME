import { View, Text, Image, Dimensions,TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { themeColors } from '../theme'
import { useNavigation } from '@react-navigation/native'
import QuoteCard from '../components/QuoteCard'

const screenWidth = Dimensions.get('window').height;

export default function WelcomeScreen() {
    const navigation = useNavigation();
    const marginTopScreen = screenWidth < 768 ? 'mt-2' : 'mt-0'; 
    const textSize = screenWidth < 768 ? 20 : 25; 
  return (
    <SafeAreaView className="flex-1" style={{backgroundColor: 'white'}}>
        <View className={`flex-1 flex justify-around ${marginTopScreen}`}>
            <Text 
                className="text-black font-bold text-4xl text-center">
                Let's Get Started!
            </Text>
          
           
            <View className="flex-row justify-center">
                <Image source={require("../assets/images/welcome.png")}
                    style={{width: screenWidth < 768 ? 250 : 310, 
                    height: screenWidth < 768 ? 250 : 300,
                    marginTop:screenWidth < 768 ? -50:-100,
                    marginBottom:screenWidth < 768 ? -40:-70}} />
            </View>

            <View className="flex-row justify-center">
                <Image source={require("../assets/images/Image.png")}
                    style={{width: screenWidth < 768 ? 220 : 290, 
                    height: screenWidth < 768 ? 70 : 90,
                    marginTop:screenWidth < 768 ? -10 :-20,
                    marginBottom:screenWidth < 768 ? -70 : -90}} />
            </View>
          <QuoteCard text="&apos;&apos;Safe Talk for All Hearts&apos;&apos;" textSize={textSize} screenWidth={screenWidth} />
            <View className="space-y-4">
                <TouchableOpacity
                    onPress={()=> navigation.navigate('SignUp')}
                    className="py-3 mx-7 rounded-3xl" style={{backgroundColor:themeColors.semiBlack}}>
                        <Text 
                            className="text-xl text-white font-bold
                             text-center"
                           >
                            Sign Up
                        </Text>
                </TouchableOpacity>
                <View className="flex-row justify-center">
                    <Text className="text-black font-semibold">Already have an account?</Text>
                    <TouchableOpacity onPress={()=> navigation.navigate('Login')}>
                        <Text className="font-semibold " style={{color:themeColors.buttonColorPrimary}}> Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </SafeAreaView>
  )
}
