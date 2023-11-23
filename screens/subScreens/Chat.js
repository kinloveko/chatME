import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import {Timestamp,onSnapshot,arrayUnion, collection,doc, query, where,updateDoc, getDoc} from '@firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../../components/userData';
import { themeColors } from '../../theme';
import Icon, { Icons } from '../../components/Icons';
import { FIREBASE_DB } from '../../config/firebase';
import MessageItem from '../../components/MessageItem';
import CustomModalBottom from '../../components/CustomModalBottom';
import ConfirmModal from '../../components/ConfirmModal';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
export default function ChatScreen() {
 
  const { userData } = useUserData();
  useEffect(() => {
    console.log('User Data:', userData);
  }, [userData]);
   const userId = userData? userData.id : '';
  const navigation = useNavigation();
  const [profileInfo, setProfileInfo] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const fetchProfileInfo = async () => {
      if (userData !== null) {

        const messagesCollection = collection(FIREBASE_DB, 'Messages');
        const messagesQuery = query(
          messagesCollection,
          where('participants', 'array-contains', userId)
        );

        const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
          const profileInfoMap = new Map();

          for (const docx of querySnapshot.docs) {
            const messageData = docx.data();
           
          const isConversationType = messageData.type.some(typeObj => typeObj.type === 'conversation' 
          && typeObj.userId === userId);

          if (isConversationType){
            const participants = messageData.participants;
            const otherParticipantID = participants.find(
              (participantID) => participantID !== userId
            );

            if (otherParticipantID) {
              const otherParticipantDocRef = doc(FIREBASE_DB, 'User', otherParticipantID);

              const participantSnapshot = await getDoc(otherParticipantDocRef);

              if (participantSnapshot.exists()) {
                const otherParticipantData = participantSnapshot.data();

                profileInfoMap.set(docx.id, {
                  id: docx.id,
                  otherParticipantData,
                  participantID: otherParticipantData?.id,
                  profilePic: otherParticipantData?.profilePic,
                  firstName: otherParticipantData?.firstName,
                  lastName: otherParticipantData?.lastName,
                  isOnline: otherParticipantData?.isOnline,
                  hideConversation: messageData?.hideConversation,
            
                });
              }
            }
          }
          else{
            continue;
          }
          }
          setProfileInfo(Array.from(profileInfoMap.values()));
        });

        return () => unsubscribe();
      }
    };

    fetchProfileInfo();
  }, [userData]);

  useEffect(() => {
  const fetchConversations = async () => {
    if (userData !==null) {
      const messagesCollection = collection(FIREBASE_DB, 'Messages');
      const messagesQuery = query(
        messagesCollection,
        where('participants', 'array-contains', userData.id)
      );

      const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
        const profileInfoMap = new Map();
        for (const docx of querySnapshot.docs) {
          const messageData = docx.data();
         
        const isConversationType = messageData.type.some(typeObj => typeObj.type === 'conversation' 
        && typeObj.userId === userId);
         
        if(!isConversationType){
            continue;
        }
        else{
                   
          const messages = messageData?.messages;
          const participants = messageData.participants;
          const otherParticipantData = participants.find(
            (participantID) => participantID !== userId
          );
          console.log("messageData:",messageData);
       
          // Find the latest message that doesn't have the current user's ID in deletedBy
          let latestMessage = null;
          for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            if (!message.deletedBy || !message.deletedBy.includes(userData.id)) {
              latestMessage = message;
              break;
            }
          }
  
          if (otherParticipantData) {
            const otherParticipantDocRef = doc(
              FIREBASE_DB,
              'User',
              otherParticipantData
            );
  
            const participantSnapshot = await getDoc(otherParticipantDocRef);
  
            if (participantSnapshot.exists()) {
              const otherParticipantData = participantSnapshot.data();
  
              profileInfoMap.set(docx.id, {
                id: docx.id,
                otherParticipantData,
                profilePic: otherParticipantData?.profilePic,
                firstName: otherParticipantData?.firstName,
                lastName: otherParticipantData?.lastName,
                isOnline: otherParticipantData?.isOnline,
                participantID: otherParticipantData?.id,
                latestMessage: latestMessage?.text,
                messageTime: latestMessage?.timestamp, // Access timestamp of the latest message
                isSeen: latestMessage?.isSeen,
                sender: latestMessage?.sender,
                messagesArray: messageData?.messages,
                hideConversation: messageData?.hideConversation,
              });
            }
          }
        }
        }

        // Filter out conversations where the current user is in hideConversation
        const filteredConversations = Array.from(profileInfoMap.values()).filter(
          (conversation) =>
            !conversation.hideConversation ||
            !conversation.hideConversation.includes(userData.id)
        );
        setConversations(filteredConversations);
      });

      return () => unsubscribe();
    }
    else{
      setConversations([]);
    }
  };

  fetchConversations();
}, [userData]);

  const handleLongPress = (conversation) => {
    setSelectedConversation(conversation);
    setModalVisible(true);
  };

  const onDeleteConversation = () => {
    setModalVisible(false);
    setConfirmModalVisible(true);
  };
  
const onConfirmDelete = async () => {
  // Close the confirmation modal
  setConfirmModalVisible(false);

  // Close the main modal
  setModalVisible(false);

  try {
    const conversationDocRef = doc(FIREBASE_DB, 'Messages', selectedConversation.id);

    // Get the current conversation data
    const conversationSnapshot = await getDoc(conversationDocRef);
    const conversationData = conversationSnapshot.data();
    
    const isUserDeletedIndex = conversationData.deletedAt?.findIndex(item => item.userId === userData.id);

    if (isUserDeletedIndex !== -1) {
      // User is already in the deletedAt array, update the timestamp
      const updatedDeletedAt = [...conversationData.deletedAt];
      updatedDeletedAt[isUserDeletedIndex] = {
        userId: userData.id,
        timestamp: Timestamp.now(),
      };
    
      await updateDoc(conversationDocRef, {
        hideConversation: arrayUnion(userData.id),
        deletedAt: updatedDeletedAt,
      });
    } else {
      // User is not in the deletedAt array, add a new item
      await updateDoc(conversationDocRef, {
        hideConversation: arrayUnion(userData.id),
        deletedAt: arrayUnion({
          userId: userData.id,
          timestamp: Timestamp.now(),
        }),
      });
    }
   

  } catch (error) {
    console.error('Error updating conversation:', error);
    // Handle error as needed
  }
};

  const onCloseConfirmModal = () => {
    // Close the confirmation modal
    setConfirmModalVisible(false);
  };

  const noImage = require('../../assets/images/noprofile.png');
  const profilePic = userData ? userData.profilePic : '';

  const handleNavigateToAddMessage = () => {
    navigation.navigate('AddNewMessage'); // Navigate to the 'addMessage' screen
  };

  const handleConversationPress = (id,convoID) => {
    // Handle navigation to the chat screen with the selected conversation
    navigation.navigate('Conversation', { id,convoID }); // Navigate to Conversation and pass the id
  };

  return (
    <View style={styles.containerStyle}>
      <View style={styles.header}>
              <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile Settings')}>
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
      <TouchableWithoutFeedback styles={{backgroundColor:'yellow',flex:1,zIndex:999,}} onPress={() => navigation.navigate('Search')} >
      <View style={styles.searchStyle}>
        <Icon type={Icons.Feather} name="search" color={themeColors.grey} size={screenHeight < 768 ? 20 : 23} />
        <TextInput
          placeholder="Search . . . "
          style={{
            color: themeColors.semiBlack,
            flex: 1,
            padding: screenHeight < 768 ? 10 : 11,
            fontSize: screenHeight < 768 ? 15 : 17,
          }}
          pointerEvents="none"
          onFocus= {() => {
            navigation.navigate('Search')
          }}
          editable={false}
        />
      </View>
    </TouchableWithoutFeedback> 

    <FlatList  style={{flexGrow:0,height:'17%',marginTop:10}}
    horizontal
    data={profileInfo.filter(item => !item.hideConversation?.includes(userData.id))}
    keyExtractor={(item, index) => `${item.id}-${index}`} // Combine item.id with index for a unique key
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => handleConversationPress(item.participantID)}>
      <View style={styles.conversationItem}>
      <Image
        style={styles.conversationProfilePic}
        source={item.profilePic ? { uri: item.profilePic } : require('../../assets/images/noprofile.png')}
      />
        <View style={styles.dot}>
          <View style={{ ...styles.dotSub, backgroundColor: item.isOnline === "true" ? themeColors.onlineGreen : themeColors.grey }} />
        </View>
        
        <Text ellipsizeMode='tail' numberOfLines={2} style={styles.conversationName}>
          {item.firstName} {item.lastName}
        </Text>
      </View>
    </TouchableOpacity>
  )}
  contentContainerStyle={{ alignItems: 'flex-start' }} // Align content to start
/>
  {conversations.length === 0 ? (
    <View style={styles.emptyResults}>
    <Image style={styles.imageStyle} source={require('../../assets/images/nomessage.png')} />
  <Text style={styles.emptyResultsText}>No messages</Text>
  <Text style={styles.emptyResultsTextSub}>"Time to chat it up! Initiate friendly conversations with everyone and build those connections!"</Text>
    </View>
  ): (
    <FlatList
      style={{ marginTop: -10 }}
      data={conversations.filter(item => !item.hideConversation?.includes(userData.id))}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item }) => {


        return (
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={() => handleConversationPress(item.participantID,item.id)}
            onLongPress={() => handleLongPress(item)}
          >
            
            <View style={styles.verticalConversationItem}>
              <Image
                  source={item.profilePic ? { uri: item.profilePic } : require('../../assets/images/noprofile.png')}
                  style={styles.verticalConversationProfilePic}
              />
              <View style={styles.verticalDot}>
                <View style={{ ...styles.verticalDotSub, backgroundColor: item.isOnline === "true" ? themeColors.onlineGreen : themeColors.grey }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={item.sender === userData.id ? styles.verticalConversationName :
                  (item.isSeen ? styles.verticalConversationName : styles.verticalConversationNameBlack)}>
                  {item.firstName} {item.lastName}
                </Text>
                <View style={{ flexDirection: 'row', paddingEnd: 70 }}>
                <Text numberOfLines={1} ellipsizeMode='tail'
                    style={item.sender === userData.id ? styles.verticalConversationMessage :
                      (item.isSeen ? styles.verticalConversationMessage : styles.verticalConversationNameBlack)}>
                    {item.latestMessage}
                  </Text> 
                  <MessageItem
                    style={item.sender === userData.id ? styles.timeStampStyle : (item.isSeen ? styles.timeStampStyle : styles.timeStampIsNotSeenStyle)}
                    item={item.messageTime}
                  />
              </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={{ alignItems: 'flex-start' }}
    />
  )}

 


{selectedConversation && (
      <CustomModalBottom
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onDeleteConversation={onDeleteConversation}
        onBlockPerson={() => {
          // Implement your logic for blocking the person
          setModalVisible(false);
        }}
        title="Choose an option"
      />
    )}
    <ConfirmModal
      visible={isConfirmModalVisible}
      onClose={onCloseConfirmModal}
      onConfirm={onConfirmDelete}
      buttonName={'Delete'}
      bgColor={themeColors.invalidColor}
      title="Delete this entire conversation?"
      message="Once you delete your copy of the conversation, it can't be undone."
    />
</View>
  );
}


const styles = StyleSheet.create({
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:-20,
  },
  emptyResultsText: {
    marginTop:-25,
    color: themeColors.semiBlack,
    fontSize: screenHeight < 768 ? 18 : 20,
    fontWeight: '500',
  },  
  emptyResultsTextSub: {
    color: themeColors.grey,
    paddingTop:10,
    paddingLeft:45,
    paddingRight:45,
    textAlign:'center',
    fontSize: screenHeight < 768 ? 15 : 17,
    fontWeight: '400',
  },
  imageStyle:{
    marginTop:-25,
    opacity:0.8,
    height:screenHeight * 0.31,
    width:screenHeight * 0.31,
  },
  timeStampIsNotSeenStyle:{
    ...Platform.select({
      ios: {
        fontSize:screenHeight < 768 ? 13:14,
      },
      android: {
        fontSize:13,
      },
    }),
    color:themeColors.semiBlack,
    alignSelf:'flex-end',
    marginStart:10,
  },
  timeStampStyle:{
    ...Platform.select({
      ios: {
        fontSize:screenHeight < 768 ? 13:14,
      },
      android: {
        fontSize:13,
      },
    }),
   
   color:'gray',
   alignSelf:'flex-end',
   marginStart:10,
  },
  buttonStyle:{
    width: screenWidth,
    ...Platform.select({
      ios: {
        marginTop:screenHeight < 768 ? 10: 0,
        paddingTop: screenHeight < 768 ? 10: 0,
      },
      android: {
       marginTop:10,
      },
      default: {
          paddingTop: 0,
      },
    }),
  },
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
    backgroundColor:'white',
    ...Platform.select({
      ios: {
          paddingTop: screenHeight < 768 ? 20: 50,
      },
      android: {
          paddingTop: 0,
      },
      default: {
          paddingTop: 0,
      },
    }),
    flex: 1,
  
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
  verticalConversationItem: {
    flexDirection:'row',
    marginStart:20,
    height: screenHeight * 0.09,
    alignItems:'flex-start',
    justifyContent: 'flex-start',
  },
  verticalConversationProfilePic: {
    ...Platform.select({
      ios: {
        width: screenHeight < 768 ? screenHeight * 0.09:screenHeight * 0.07,
        height: screenHeight < 768 ? screenHeight * 0.09:screenHeight * 0.07,
      },
      android: {
        width: screenHeight * 0.09,
        height: screenWidth * 0.18,
      },
    }),
    borderRadius: 60,
  },
  verticalConversationName: {
    color:'#7A7675',
    marginTop:5,
    marginStart:10,
    fontWeight:'500',
    ...Platform.select({
      ios: {
        fontSize:screenHeight < 768 ? 15:17,
       },
      android: {
        fontSize:screenHeight < 768 ? 15:17,
      },
      default: {
          
      },
    }),
  },
  verticalConversationMessage:{
    color:'gray',

    marginTop:5,
    marginStart:10,
    ...Platform.select({
      ios: {
        fontSize:screenHeight < 768 ? 15:16,
       },
      android: {
        fontSize:screenHeight < 768 ? 15:16,
      },
      default: {
          
      },
    }),
  },
  verticalConversationNameBlack: {
    marginTop:5,
    marginStart:10,
    fontWeight:'600',
    color:themeColors.semiBlack,
    ...Platform.select({
      ios: {
        fontSize:screenHeight < 768 ? 15:16,
       },
      android: {
        fontSize:screenHeight < 768 ? 15:16,
      },
      default: {
          
      },
    }),
  },
  verticalDot:{
    ...Platform.select({
      ios: {
       marginStart:screenHeight < 768 ? -20:-20,
       marginBottom: screenHeight < 768 ? 0:20,
      },
      android: {
        marginStart:-20,
      },
      default: {
          paddingTop: 0,
      },
    }),
    justifyContent:'center',
    alignItems:'center',
    alignSelf:'flex-end',
    backgroundColor:'white',
    borderRadius:75,
    width: 20,
    height: 20,
  },
  verticalDotSub:{
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