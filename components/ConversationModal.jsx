import { Modal, Text,TouchableWithoutFeedback ,TouchableOpacity,Dimensions,StyleSheet ,View } from 'react-native';
import { themeColors } from '../theme';
import Icon, { Icons } from '../components/Icons';

const screenSize = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const ConversationModal = ({ visible, onClose, onRemove, onCopy,title }) => {
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
            <TouchableOpacity onPress={onCopy} style={styles.buttonStyle}>
            <Icon type={Icons.Feather} style={styles.iconStyle} name="copy" color={themeColors.semiBlack} size={screenSize < 768 ? 22 : 24} />
              <Text style={styles.texts}>Copy text</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRemove} 
            style={styles.buttonStyle}>
              <Icon  type={Icons.EvilIcons} name="trash" color={themeColors.invalidColor} size={screenSize < 768 ? 30 : 40} />
              <Text style={{...styles.texts,color:themeColors.invalidColor}}>Remove this message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
  );
};

export default ConversationModal;
const styles = StyleSheet.create({
    iconStyle:{
     marginStart:5,
     marginEnd:10,
      ...Platform.select({
        ios: {
         
        },
        android: {
          height:30
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



 