import React from 'react';
import { Modal,Platform, TouchableOpacity,Dimensions, Text, StyleSheet, View, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { themeColors } from '../theme';
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const DatePickerPopup = ({ showDatePicker, selectedDate, onClose, onDateChange, onSetPress }) => {

  return (
    <Modal transparent visible={showDatePicker} animationType="fade">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="inline"
            themeVariant='light'
            onChange={onDateChange}
            maximumDate={new Date()}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>CLOSE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ marginStart: 10 }} onPress={onSetPress}>
              <Text style={styles.setButton}>SET</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    ...Platform.select({
      ios: {
        width:screenHeight < 768 ? screenWidth * 1:screenWidth * 0.9,
        height:screenHeight < 768 ? screenHeight * 0.6 : screenHeight * 0.5,
       
       },
      android: {
        fontSize:screenHeight < 768 ? 15:17,
      },
      default: {
          
      },
    }),
  
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent:'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  setButton: {
    fontSize:16,
    fontWeight:'bold',
    color: themeColors.semiBlack,
  },
  closeButton: {
    fontWeight:'normal',
    fontSize:16,
    color: themeColors.grey,
  },
});

export default DatePickerPopup;
