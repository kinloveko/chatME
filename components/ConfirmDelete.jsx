// ConfirmModal.js
import React from 'react';
import { View, Text, TouchableOpacity,TouchableWithoutFeedback, Modal, Dimensions, StyleSheet } from 'react-native';
import { themeColors } from '../theme';

const screenSize = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const ConfirmDelete = ({ visible, onClose, onConfirm, message,title }) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor: 'white',width:screenWidth,marginLeft:15,marginRight:15 , paddingLeft: 25,paddingRight:25,paddingBottom:20,paddingTop:30, borderRadius: 20 }}>
          <View style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
            <Text style={styles.texts}>
              {title}
            </Text>
            <Text style={styles.message}>
              {message}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={{...styles.buttonStyle,backgroundColor:themeColors.semiGray}}>
              <Text style={{ color: themeColors.semiBlack, fontWeight: 'bold', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={{ ...styles.buttonStyle, backgroundColor: themeColors.invalidColor }}>
              <Text style={{ color: themeColors.bg, fontWeight: 'bold', textAlign: 'center' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  message:{
    textAlign: 'center',
      fontWeight: '300',
       color: 'gray',
        margin: 10,
        ...Platform.select({
          ios: {
            fontSize: screenSize < 768 ? 14:15,
             },
          android: {
            fontSize: 18,
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
        fontSize: 18,
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

export default ConfirmDelete;
