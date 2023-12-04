import React from 'react';
import { View, Text, TouchableOpacity,TouchableWithoutFeedback, Modal, Dimensions, StyleSheet } from 'react-native';
import { themeColors } from '../theme';
import Icon from 'react-native-vector-icons/Ionicons';

const screenSize = Dimensions.get('window').height;

const EmailModal = ({iconName,disable ,visible, onClose, onConfirm,onResendEmail, message,title,buttonName, bgColor,resendEmailName,hide}) => {
  const resend = resendEmailName? resendEmailName : 'Resend Email Verification';
  const hideResend = hide ? hide : false;
  const isDisable =disable? disable : false;
  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
     
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white',marginLeft:15,marginRight:15 , paddingLeft: 45,paddingRight:45,paddingBottom:20,paddingTop:30, borderRadius: 20 }}>
          <View style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
          
          <Icon style={{marginTop:-10}} name={iconName} color={themeColors.semiBlack} size={30} />
          
            <Text numberOfLines={1} style={styles.texts}>
              {title}
            </Text>
            <Text numberOfLines={3} style={styles.message}>
              {message}
            </Text>
            
          </View>
          <View style={{...styles.buttonContainer,marginTop:20}}>
            <TouchableOpacity onPress={onConfirm} style={{ ...styles.buttonStyle, backgroundColor: bgColor }}>
              <Text style={{ color: themeColors.bg, fontWeight: 'bold', textAlign: 'center' }}>{buttonName}</Text>
            </TouchableOpacity>
          </View>
          <View style={{display:hideResend === false ? 'flex': 'none',alignItems:'center',marginTop:10}}>
          <TouchableOpacity onPress={onResendEmail} disabled={isDisable}>
                  <Text className="font-semibold "  style={{color:'darkgray'}}> {resend}</Text>
              </TouchableOpacity>
          </View>
          
        </View>
      </View>
     
    </Modal>
  );
};

const styles = StyleSheet.create({
  message:{
    textAlign: 'center',
      fontWeight: '300',
       color: 'gray',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
        marginBottom: 5,
        ...Platform.select({
          ios: {
            fontSize: screenSize < 768 ? 14:15,
             },
          android: {
            fontSize: 15,
           },
        }),

  },
  texts:{
    textAlign: 'center',
     
     ...Platform.select({
      ios: {
        fontSize: screenSize < 768 ? 16:18,
         },
      android: {
        fontSize: 16,
       },
    }),
     fontWeight: '500',
     color: themeColors.semiBlack
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
  },
  buttonStyle: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: themeColors.grayish,
    padding: 10,
    margin: 5,
  },
});

export default EmailModal;
