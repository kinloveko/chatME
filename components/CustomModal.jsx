import React from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Import an appropriate icon
import { themeColors } from '../theme';

const screenSize = Dimensions.get('window').height;
const CustomModal = ({ visible, onClose, onOkay, message,title, iconName}) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible} onRequestClose={onClose}>
      
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{ backgroundColor:'white', width:screenSize < 768 ? 300 : 320, height: screenSize < 768 ? 200:220, paddingTop: 10, borderRadius: 20 }}>
       
          <View style={{ alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
            <Icon name={iconName} color={themeColors.invalidColor} size={42} />
            <Text style={{ textAlign: 'center',
           fontSize: 18,
           fontWeight: '500',
           color:themeColors.semiBlack,
           }}>{title}</Text>
          </View>
          <View style={{borderRadius:10,margin:10}}>
        
          <Text style={{ textAlign: 'center', 
           marginStart: 15,
           marginEnd: 15,
           marginBottom: 30, 
           fontSize: 15,
           fontWeight: '300',
           color:'gray'
           }}>{message}
           </Text>
          </View>
          <TouchableOpacity onPress={onOkay} style={{marginTop:-15, backgroundColor: themeColors.invalidColor, padding: 10, borderRadius: 20, marginStart: 50, marginEnd: 50 }}>
              <Text style={{ color: themeColors.bg, fontWeight: 'bold', textAlign: 'center' }}>Got it!</Text>
            </TouchableOpacity>
         
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
