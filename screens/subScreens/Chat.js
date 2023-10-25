import * as React from 'react';
import { View, Text, SafeAreaView} from 'react-native';
import { themeColors } from '../../theme';
import Colors from '../../constant/Colors';

export default function DashboardScreen({navigation}){
    return(


        <View style={{flex:1,alignItems:'center',
        justifyContent: 'center'}}
        >
            <Text
             onPress={()=> navigation.navigate('Home')}
             style={{fontSize:26,fontWeight:'bold'}}
            >Chat Screen</Text>
            <Text>HELLO</Text>
        </View>
     
    );
}