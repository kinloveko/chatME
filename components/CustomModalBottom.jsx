import React from 'react';
import { View, Text,StyleSheet,Platform ,TouchableOpacity,TouchableWithoutFeedback, Modal, Dimensions } from 'react-native';
import Icon, { Icons } from '../components/Icons';
import { themeColors } from '../theme';

const screenSize = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const CustomModalBottom = ({ visible, onClose, onDeleteConversation, onBlockPerson, title }) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
     <TouchableWithoutFeedback onPress={onClose}>

      <View   style={{ flex: 1, justifyContent:'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white', width: screenWidth, height: screenSize * 0.26, paddingTop: 10, borderTopEndRadius: 20,borderTopStartRadius: 20  }}>
        <View style={{paddingTop:10, flexDirection: 'row', paddingStart:15,justifyContent:'center' }}>
             <Text style={{fontSize:screenSize < 768 ? 16:17,fontWeight:'400',color:'gray'}}>{title}</Text>
             <Icon type={Icons.EvilIcons} name="chevron-right" color='gray' size={screenSize < 768 ? 26 : 28} />
          </View>
          <View style={styles.container}>
            <TouchableOpacity onPress={onDeleteConversation} 
            style={styles.buttonStyle}>
              <Icon  type={Icons.EvilIcons} name="trash" color={themeColors.semiBlack} size={screenSize < 768 ? 30 : 40} />
              <Text style={styles.texts}>Delete Conversation</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBlockPerson} style={styles.buttonStyle}>
            <Icon type={Icons.EvilIcons} style={styles.iconStyle} name="minus" color={themeColors.invalidColor} size={screenSize < 768 ? 30 : 40} />
              <Text style={{...styles.texts,color:themeColors.invalidColor}}>Block this Person</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
const styles = StyleSheet.create({
  iconStyle:{
   
    ...Platform.select({
      ios: {
       
      },
      android: {
        height:40
      },
    }),
  },
    container:{
     
        marginTop:-10,
       padding:20,
        ...Platform.select({
            ios: {
                flexGrow:screenSize < 768 ? 1: 0.7,  
            },
            android: {
                flexGrow:1,
            },
          }),
    },
 buttonStyle:  {
        flex: 1,
        borderRadius: 20,
        justifyContent:'flex-start',
        flexDirection:'row',
        alignItems:'center',
    
        marginBottom:10,
 },
 texts:{
    color: themeColors.semiBlack,
     fontWeight: '400',
     ...Platform.select({
        ios: {
          fontSize:screenSize < 768 ? 17:19,
          paddingTop:screenSize < 768 ? 1:3,
        },
        android: {
          fontSize:15,
        },
      }),
},
});


export default CustomModalBottom;