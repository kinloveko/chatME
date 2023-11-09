import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { collection,doc, query, where, getDocs,getDoc} from '@firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../../components/userData';
import { themeColors } from '../../theme';
import Icon, { Icons } from '../../components/Icons';
import { FIREBASE_DB } from '../../config/firebase';

const screenHeight = Dimensions.get('window').height;

export default function ChatScreen() {
  const { userData } = useUserData();
  const navigation = useNavigation();
  
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (userData) {
        const messagesCollection = collection(FIREBASE_DB, 'Messages');
        const messagesQuery = query(
          messagesCollection,
          where('participants', 'array-contains', userData.id)
        );
        const querySnapshot = await getDocs(messagesQuery);
        const conversationList = [];

        for (const docx of querySnapshot.docs) {
          const messageData = docx.data();
          const participants = messageData.participants;
          const otherParticipantID = participants.find(
            (participantID) => participantID !== userData.id
          );

          if (otherParticipantID) {
            // Fetch the profile picture of the other participant
            const otherParticipantDoc = doc(FIREBASE_DB, 'User', otherParticipantID);
            const otherParticipantSnapshot = await getDoc(otherParticipantDoc);
            const otherParticipantData = otherParticipantSnapshot.data();

            conversationList.push({
              id: doc.id,
              otherParticipantData,
              profilePic: otherParticipantData?.profilePic,
              firstName: otherParticipantData?.firstName,
              lastName: otherParticipantData?.lastName,
              isOnline: otherParticipantData?.isOnline,
              participantID: otherParticipantData?.id,
            });
          }
        }

        setConversations(conversationList);
      }
    };

    fetchConversations();
  }, [userData]);

  const noImage = require('../../assets/images/noprofile.png');
  const profilePic = userData ? userData.profilePic : '';
  const handleConversationPress = (id) => {
    // Handle navigation to the chat screen with the selected conversation
    navigation.navigate('Conversation', { id }); // Navigate to Conversation and pass the id
  };
  const handleNavigateToAddMessage = () => {
    navigation.navigate('AddNewMessage'); // Navigate to the 'addMessage' screen
  };

  return (
    <View style={styles.containerStyle}>
      <View style={styles.header}>
              <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
              style={styles.userImg}
              source={ profilePic ? { uri: profilePic } : noImage}
              />
              </TouchableOpacity>
              </View>

              <View style={styles.headerCenter}>
              <Text style={styles.headerText}>Chats</Text>

              </View>
              <TouchableOpacity onPress={handleNavigateToAddMessage}>
              <View style={styles.headerRight}>
              <View style={{
                  borderRadius:50,
                  padding:10,
                  backgroundColor:themeColors.semiGray,
              }}>
              <Icon type={Icons.Feather}
               name="edit" 
               color={themeColors.semiBlack} 
               size={screenHeight < 768 ? 20 : 23} />
               </View>
               </View>
              </TouchableOpacity>
          </View>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{
            flex:1,
          }}
          showsVerticalScrollIndicator={false}>
     
      <View
      style={styles.searchStyle}
      >
      <Icon type={Icons.Feather}
                      name="search" 
                      color={themeColors.grey} 
                      size={screenHeight < 768 ? 20 : 23} />
      <TextInput
          placeholder="Search . . . "
          style={{color:themeColors.semiBlack, flex: 1,padding: screenHeight < 768 ? 10 : 11, fontSize: screenHeight < 768 ? 15 : 17 }}
      />                            
   </View>  
   <FlatList
  horizontal
  data={conversations}
  keyExtractor={(item) => item.id} // Specify a unique key
  renderItem={({ item }) => (
    <TouchableOpacity key={item.id} onPress={() => handleConversationPress(item.participantID)}>
      <View style={styles.conversationItem}>
        <Image
          source={{ uri: item.profilePic ? item.profilePic : noImage }}
          style={styles.conversationProfilePic}
        />
        <View style={styles.dot} >
          <View style={{...styles.dotSub,backgroundColor:item.isOnline === "true" ? themeColors.onlineGreen: themeColors.grey}} />
        </View>
        <Text ellipsizeMode='tail' numberOfLines={2} style={styles.conversationName}>
          {item.firstName} {item.lastName}
        </Text>
      </View>
    </TouchableOpacity>
  )}
  contentContainerStyle={{ alignItems: 'flex-start' }} // Align content to start
/>


</ScrollView>                   
</View>

  );
}
const styles = StyleSheet.create({
  dot:{
    ...Platform.select({
      ios: {
        marginTop: screenHeight < 768 ? -17: -20,
      },
      android: {
        marginTop: -17,
      },
      default: {
          paddingTop: 0,
      },
    }),
    alignSelf:'flex-end',
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'white',
    borderRadius:75,
    width: 20,
    height: 20,
  },
  dotSub:{
    borderRadius:75,
    ...Platform.select({
      ios: {
        width: screenHeight < 768 ? 11: 13,
        height: screenHeight < 768 ? 11: 13,
      },
      android: {
        width: screenHeight < 768 ? 12: 15,
        height: screenHeight < 768 ? 12: 15,
      },
      default: {
          paddingTop: 0,
      },
    }),
  },
  containerStyle:{
    ...Platform.select({
      ios: {
          paddingTop: screenHeight < 768 ? 20: 50,
      },
      android: {
          paddingTop: 40,
      },
      default: {
          paddingTop: 0,
      },
    }),
    flex: 1,
    backgroundColor:'white',
  },
  conversationItem: {
    marginStart:30,
    marginTop:20,
    width: screenHeight * 0.07,
    height: screenHeight * 0.07,
    alignItems:'flex-start',
    justifyContent: 'flex-start',
  },
  conversationProfilePic: {
    width:screenHeight * 0.07,
    height: screenHeight * 0.07,
    borderRadius: 60,
  },
  conversationName:{
    textAlign:'center',
    color:themeColors.semiBlack,
    fontWeight:'400',
    ...Platform.select({
      ios: {
        marginStart:screenHeight < 768 ? 0: 10,
        marginEnd:screenHeight < 768 ? 0: 10,
      },
      android: {
        
      },
      default: {
          
      },
    }),
  },
    userImg: {
        borderWidth:1.5,
        borderColor:themeColors.buttonColorPrimary,
        borderRadius: 75,
        height: screenHeight * 0.045,
        width: screenHeight * 0.045,
      },
    searchStyle:{
        flexDirection: 'row',
        alignItems: 'center',
        marginStart:20,
        marginEnd:20,
        paddingHorizontal: 16, // Adjust the padding as needed
        backgroundColor:themeColors.semiGray,
        borderRadius: 25,
        ...Platform.select({
            ios: {
                marginTop:0, 
            },
            android: {
                marginTop: 30, 
            },
            default: {
                marginTop:0,
            },
          }),
    },
    header: {
        ...Platform.select({
            ios: {
                top:screenHeight < 768 ? -8:-12, 
            },
            android: {
              top: 27, 
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
        flex: 1,  // This will make it take up the available horizontal space
        alignItems: 'center',
      },
});