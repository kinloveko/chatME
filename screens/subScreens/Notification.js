import * as React from 'react';
import { View,SafeAreaView,ScrollView, Text,StyleSheet,Image,Platform,TouchableOpacity, Dimensions} from 'react-native';
import Icon, { Icons } from '../../components/Icons';
import { themeColors } from '../../theme';



const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

export default function Notification({navigation}){
    return(
        <SafeAreaView style={{
            flex: 1,
            backgroundColor:'white',
        }}>
            <View style={styles.header}>
                    <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Image style={{width: screenHeight < 768 ? 25:30,
                                                height: screenHeight < 768 ? 25:30}} 
                                                source={require('../../assets/icons/left.png')}/>
                    </TouchableOpacity>
                    </View>

                    <View style={styles.headerCenter}>
                    <Text style={styles.headerText}>Notification</Text>
    
                    </View>
                    <TouchableOpacity >
                    <View style={styles.headerRight}>
                    <View style={{
                        borderRadius:50,
                        padding:10,
                        backgroundColor:'#F4F4F4'
                    }}>
                    <Icon type={Icons.Feather} name="trash-2" color={themeColors.invalidColor} size={screenHeight < 768 ? 19 : 21} />
                     </View>
                     </View>
                    </TouchableOpacity>
                </View>
                <ScrollView
                style={styles.container}
                contentContainerStyle={{
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                showsVerticalScrollIndicator={false}>
                </ScrollView>                   

        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    header: {
        ...Platform.select({
            ios: {
              top:screenHeight < 768 ? -8:-10, 
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
        left:10,
        alignItems: 'flex-start',
      },
      headerText: {
        fontSize: screenHeight < 768 ? 15: 18,
        fontWeight: '500',
      },
      headerCenter: {
        left: 10,
        flex: 1,  // This will make it take up the available horizontal space
        alignItems: 'center',
      },
});