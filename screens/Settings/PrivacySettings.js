import * as React from 'react';
import { View,SafeAreaView, Text,StyleSheet,Image,Platform,TouchableOpacity, Dimensions} from 'react-native';
import Icon, { Icons } from '../../components/Icons';
import { themeColors } from '../../theme';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function PrivacySettings({navigation}) {
  
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
                <Text style={styles.headerText}>Privacy Settings</Text>

                </View>
                <TouchableOpacity >
                <View style={styles.headerRight}>
                 </View>
                </TouchableOpacity>
            </View>
            <View style={{alignItems:'center'}}>
            <Image  style={{width: screenWidth * 0.8,
                                            height: screenHeight * 0.4}} 
                                            source={require('../../assets/images/settingsvector.png')}  />
            </View>  
            <Text style={styles.textStyle}>You have the ability to control who can contact you and view your status, allowing for personalized privacy settings.</Text>    
            <View style={{flex:1,marginTop:10}}>
                <TouchableOpacity  onPress={() => navigation.navigate('BlockingSettings')} style={styles.buttonContainer}>
                   <View style={styles.buttonColumn}>
                     <Icon type={Icons.Feather} name="user" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                       <Text style={styles.buttonText}>Blocking</Text>
                   </View>
                       <Image style={{width: screenHeight < 768 ? 25:30,
                         height: screenHeight < 768 ? 25:30}} 
                         source={require('../../assets/icons/right.png')}/>
               </TouchableOpacity> 
               <TouchableOpacity onPress={()=> navigation.navigate('ActiveStatus')} style={styles.buttonContainer}>
                   <View style={styles.buttonColumn}>
                     <Icon type={Icons.Feather} name="lock" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                       <Text style={styles.buttonText}>Active Status</Text>
                   </View>
                       <Image style={{width: screenHeight < 768 ? 25:30,
                         height: screenHeight < 768 ? 25:30}} 
                         source={require('../../assets/icons/right.png')}/>
               </TouchableOpacity>                  
       </View>  

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