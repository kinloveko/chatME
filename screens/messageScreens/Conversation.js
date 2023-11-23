import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList,  Platform, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon, { Icons } from '../../components/Icons';
import { themeColors } from '../../theme';
import { useRoute } from '@react-navigation/native';
import { FIREBASE_DB } from '../../config/firebase';
import { format } from 'date-fns';
import {
  Timestamp,
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  setDoc,
  arrayRemove,
  arrayUnion,
} from 'firebase/firestore';
import { useUserData } from '../../components/userData';
import ConversationModal from '../../components/ConversationModal';
import Toast from 'react-native-root-toast';
import * as Clipboard from 'expo-clipboard';
import ConfirmModal from '../../components/ConfirmModal';


const screenHeight = Dimensions.get('window').height;

export default function Conversation({ navigation }) {
 
const route = useRoute();
const { id, convoID } = route.params;
const [chatIDUseState, setChatID] = useState(null);
const [userDataReceiver, setUserDataReceiver] = useState(null);
const [newMessage, setMessage] = useState('');
const [messages, setMessages] = useState([]);
const [modalVisible, setModalVisible] = useState(false);
const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
const [selectedMessage, setSelectedMessage] = useState(null);

const onCloseConfirmModal = () => {
  // Close the confirmation modal
  setConfirmDeleteVisible(false);
};

const { userData } = useUserData();
useEffect(() => {
  console.log('User Data:', userData);
}, [userData]);


useEffect(() => {
  const userRef = doc(FIREBASE_DB, 'User', id);
  const unsubscribe = onSnapshot(userRef, (userSnapshot) => {
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      setUserDataReceiver(userData);
      console.log('User Found!!!');
    } else {
      console.log('User not found.');
      // Handle the case where the user is not found, e.g., show an error message or navigate back.
    }
  });

  return () => unsubscribe();
}, [id]);

useEffect(() => {
  if (userDataReceiver && userData) {
    const messagesCollection = collection(FIREBASE_DB, 'Messages');
    const unsubscribe = onSnapshot(messagesCollection, async (querySnapshot) => {
      const updatedMessages = [];

      for (const messageDoc of querySnapshot.docs) {
        const messageData = messageDoc.data();
        setChatID(messageData.id);
        if (
          messageData.participants.includes(userData.id) &&
          messageData.participants.includes(userDataReceiver.id)
        ) {
          const deletionInfo = messageData['deletedAt']?.find(
            (deleteInfo) => deleteInfo.userId === userData.id
          );

          // Clone the messages array to avoid modifying the original array
          const updatedMessagesArray = [...messageData.messages];

          // Update isSeen field in the first message if the sender is not the current user
          if (updatedMessagesArray.length > 0 && updatedMessagesArray[0].sender !== userData.id && !updatedMessagesArray[0].isSeen) {
            updatedMessagesArray[0].isSeen = true;

            // Reference to the specific message document
            const messageDocRef = doc(FIREBASE_DB, 'Messages', messageDoc.id);

            try {
              // Update the document with the modified messages array
              await updateDoc(messageDocRef, { messages: updatedMessagesArray });
            } catch (error) {
              console.error('Error updating Firestore:', error);
            }
          }

          // Filter messages based on the deletion timestamp
          const filteredMessages = updatedMessagesArray.filter(
            (msg) => !deletionInfo || (deletionInfo && msg.timestamp > deletionInfo.timestamp)
          );
                // Update the state with the new messages data using unshift()
                updatedMessages.push({
                  ...messageData,
                  messages: filteredMessages,
                });
        }
      }
       setMessages(updatedMessages);
       console.log("new Array:  ",updatedMessages);
    });

    return () => unsubscribe();
  }
}, [userDataReceiver]);

const sendMessage = async () => {
  const message = newMessage;
  setMessage('');
  try {
    if (message.trim() !== '') {
      // Reference to the 'Messages' collection
      const conversationRef = collection(FIREBASE_DB, 'Messages');

      // Define the participants array for the query
      const participantsArray = [userDataReceiver.id, userData.id];

      // Create a unique chat ID based on user IDs
      const chatID = participantsArray.sort().join('_');

      // Get the chat document
      const chatDocRef = doc(conversationRef, chatID);
      const chatDoc = await getDoc(chatDocRef);

      if (chatDoc.exists()) {
        // Chat document already exists, check if current user is in hideConversation
        const hideConversationArray = chatDoc.data().hideConversation || [];

        if (hideConversationArray.includes(userData.id) || hideConversationArray.includes(userDataReceiver.id)) {
          // Either the current user or the receiver is in hideConversation
          // Update the document to remove both users from hideConversation
          await updateDoc(chatDocRef, {
            hideConversation: arrayRemove(userData.id, userDataReceiver.id),
          });
          // User is not in hideConversation, proceed with updating the document
          const existingMessages = chatDoc.data().messages || [];
          // Update the document with the new message and update the latestMessage
          await updateDoc(chatDocRef, {
            messages: [
              {
                isSeen: false,
                sender: userData.id,
                text: message,
                timestamp: Timestamp.now(),
                deletedBy: [],
              },
              ...existingMessages, // Spread existing messages after the new one
            ],
          });
          // Your other update logic here, if needed
        } else {
          // User is not in hideConversation, proceed with updating the document
          const existingMessages = chatDoc.data().messages || [];

          // Update the document with the new message and update the latestMessage
          await updateDoc(chatDocRef, {
            messages: [
              {
                isSeen: false,
                sender: userData.id,
                text: message,
                timestamp: Timestamp.now(),
                deletedBy: [],
              },
              ...existingMessages, // Spread existing messages after the new one
            ],
          });
        }
      } else {
        // Chat document does not exist, create it
        const chatData = {
          id: chatID,
          hideConversation: [],
          deletedAt: [],
          type:[
            { userId: userData.id, type: 'conversation'},
            { userId: userDataReceiver.id, type: 'conversation' },
          ],
          participants: participantsArray,
          messages: [
            {
              isSeen: false,
              sender: userData.id,
              text: message,
              timestamp: Timestamp.now(),
              deletedBy: [],
            },
          ],
        };

        await setDoc(chatDocRef, chatData);
      }
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

const onConfirmDelete = async () => {
  try {
    if (selectedMessage) {
      const { conversation } = selectedMessage;
      const selectedMessageText = conversation.messages[selectedMessage.messageIndex]?.text || '';
      const itemSender =  conversation.messages[selectedMessage.messageIndex]?.sender || '';   
      const  messageIndex = selectedMessage.messageIndex;
      // Check if item is not null and has a sender property
      
      console.log('selected Index:',messageIndex,"selected text:",selectedMessageText,"sender:",itemSender);

      if (!selectedMessageText || !itemSender) {
        console.error('Invalid selected message:', selectedMessageText);
        return;
      }

      // Assuming chatIDUseState is set correctly elsewhere in your component
      const chatId = chatIDUseState ? chatIDUseState : null;

      console.log('Sender ID:', itemSender);

      // Check if chatID is available
      if (!chatId) {
        console.error('Chat ID is not available');
        return;
      }

       const messageDocRef = doc(FIREBASE_DB, 'Messages', chatId);

      // Fetch the current state of the document
      const docSnapshot = await getDoc(messageDocRef);

      if (!docSnapshot.exists()) {
        console.error('Message document does not exist');
        return;
      }

      const currentDoc = docSnapshot.data();

      // Get the sender of the selected message
      const messageSender = itemSender;

      // Create a copy of the messages array to avoid modifying the original array
      const updatedMessages = [...currentDoc.messages];
     console.log('Updated Messages:', updatedMessages);
      //console.log('Selected Item Timestamp:', item.timestamp);

      
      if (messageIndex !== -1) {
        // Check if the current user is the sender of the selected message
        if (messageSender === userData.id) {
          // The current user is the sender, add both user IDs to deletedBy
          updatedMessages[messageIndex].deletedBy = Array.isArray(updatedMessages[messageIndex].deletedBy)
            ? Array.from(new Set([...updatedMessages[messageIndex].deletedBy, userDataReceiver.id, userData.id]))
            : [userDataReceiver.id, userData.id];
        } else {
          // The current user is not the sender, add only the current user's ID to deletedBy
          updatedMessages[messageIndex].deletedBy = Array.isArray(updatedMessages[messageIndex].deletedBy)
            ? Array.from(new Set([...updatedMessages[messageIndex].deletedBy, userData.id]))
            : [userData.id];
        }

        // Update the document with the modified messages array
        await setDoc(messageDocRef, { messages: updatedMessages }, { merge: true });
      } else {
        console.error('Selected message not found in the messages array');
      }

      setConfirmDeleteVisible(false);
    }
  } catch (error) {
    console.error('Error deleting message:', error);
  }
};
 
  const firstName = userDataReceiver ? userDataReceiver.firstName : '';
  const lastName = userDataReceiver ? userDataReceiver.lastName : '';
  const profilePic = userDataReceiver ? userDataReceiver.profilePic : '';
  const noImage = require('../../assets/images/noprofile.png');
  const userOnline =userDataReceiver ? userDataReceiver.isOnline : 'false';
  const isOnline = userOnline === 'true' ? 'Active now' : 'Offline';
  const [showTimestamp, setShowTimestamp] = useState([]);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);

  const handleProfileSettings = () => {
    // Handle navigation to the chat screen with the selected conversation
    navigation.navigate('ConversationSettings', { id,convoID }); // Navigate to Conversation and pass the id
  };

  return (
    <View style={styles.containerHolder}>
      <View style={styles.container} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              style={styles.backIcon}
              source={require('../../assets/icons/left.png')}
            />
          </TouchableOpacity>
        </View>
        <Image
          style={styles.profilePic}
          source={profilePic ? { uri: profilePic } : noImage}
        />
        <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={styles.headerText}>{firstName} {lastName}</Text>
            <Text style={styles.headerTextSub}>{isOnline}</Text>
          </View>
          <TouchableOpacity onPress={handleProfileSettings} style={{ marginEnd: 20 }}>
            <Icon
              type={Icons.Feather}
              name="info"
              color={themeColors.semiBlack}
              size={screenHeight < 768 ? 20 : 30}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
  data={messages}
  keyExtractor={(item, index) => `${item.id}-${index}`}
  renderItem={({ item: conversation,index }) => {
  
    return (
      <View style={styles.chatContainer}>
        <View style={styles.messagesContainer}>
          {conversation.messages.map((message, msgIndex) => {
            const isUserDeleted = message.deletedBy && message.deletedBy.includes(userData.id);
    
            // If the current user deleted the message, render null to hide the message
            if (isUserDeleted) {
              return null;
            }
    
            return (
              <TouchableOpacity
                key={`${conversation.id}-${msgIndex}`}
                style={[
                  styles.messageContainer,
                  message.sender === userData.id ? styles.receiverMessage : styles.senderMessage,
                ]}
                onPress={() => {
                  // Toggle the showTimestamp state for the tapped message
                  const updatedShowTimestamps = [...showTimestamp];
                  const key = `${conversation.id}-${msgIndex}`;
    
                  if (selectedTimestamp === key) {
                    // If the selected timestamp is already shown, reset it
                    setSelectedTimestamp(null);
                  } else {
                    // Otherwise, toggle the state
                    updatedShowTimestamps[key] = !updatedShowTimestamps[key];
                    setSelectedTimestamp(key);
                  }
                  setShowTimestamp(updatedShowTimestamps);
                }}
                onLongPress={() => {
                  setModalVisible(true);
                  setSelectedMessage({ conversation, messageIndex: msgIndex });
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {message.sender === userData.id ? (
                    <View style={styles.textContainer}>
                      <Text style={styles.messageTextSender}>
                        {message.text}
                      </Text>
                    </View>
                  ) : (
                    <>
                      <Image
                        source={userDataReceiver.profile ? { uri: userDataReceiver.profile } : require('../../assets/images/noprofile.png')}
                        style={styles.avatar}
                      />
                      <View style={styles.textContainer}>
                        <Text style={styles.messageTextReceiver}>
                          {typeof message.text === 'string' ? message.text : ''}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
                {showTimestamp[`${conversation.id}-${msgIndex}`] && (
                  <Text
                    style={
                      message.sender === userData.id
                        ? styles.timestampTextSender
                        : styles.timestampTextReceiver
                    }
                  >
                    {message.timestamp
                      ? format(message.timestamp.toDate(), "MMM d 'AT' h:mm a")
                      : 'Invalid Timestamp'}
                  </Text>
                )}
              </TouchableOpacity>
            );
          }).reverse()}
          {modalVisible && (
            <ConversationModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onRemove={() => {
                setModalVisible(false);
                setConfirmDeleteVisible(true);
              }}
              onCopy={async () => {
                if (selectedMessage) {
                  const { conversation, messageIndex } = selectedMessage;
                  const selectedMessageText = conversation.messages[messageIndex]?.text || '';
                  console.log('Selected:', selectedMessageText, 'at index:', messageIndex);
    
                  // Use Clipboard from 'react-native-clipboard' package
                  await Clipboard.setStringAsync(selectedMessageText);
    
                  // Optionally, you can show a notification or perform other actions
                  // to indicate that the text has been copied.
                  if (Platform.OS === 'ios') {
                    Toast.show('Copied to clipboard.', {
                      duration: Toast.durations.LONG,
                      position: Toast.positions.BOTTOM,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      textColor: themeColors.bg,
                      shadow: false,
                      animation: true,
                      hideOnPress: true,
                      delay: 0,
                    });
                  }
                }
                setModalVisible(false);
              }}
              title={'Choose an option'}
            />
          )}
          {confirmDeleteVisible && (
            <ConfirmModal
              visible={confirmDeleteVisible}
              onClose={onCloseConfirmModal}
              onConfirm={onConfirmDelete}
              title="Delete this message?"
              buttonName={'Delete'}
              bgColor={themeColors.invalidColor}
              message={selectedMessage.conversation.messages[selectedMessage.messageIndex]?.text || ''}
            />
          )}
        </View>
      </View>
    );
    
  }}
  inverted={true}
/>
     
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message. . ."
          value={newMessage}
          multiline={true}
          onChangeText={(text) => setMessage(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Icon
            type={Icons.Ionicons}
            name="send"
            color={themeColors.semiBlack}
            size={screenHeight < 768 ? 30 : 35}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    containerHolder:{
        flex: 1,
        backgroundColor:'white',
    },
    container: {
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
      backgroundColor:'white',
    },
    header: {
        backgroundColor:'white',
         flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
    },
    
    headerLeft: {
      zIndex:999,
      left: 10,
      alignItems: 'flex-start',
    },
    headerCenter: {
      right:10,
      flex: 1,
      alignItems: 'center',
    },
    headerText: {
      marginTop:-15,
     fontWeight: '500',
      ...Platform.select({
        ios: {
            fontSize: screenHeight < 768 ? 12 : 16,
        },
        android: {
        fontSize: screenHeight < 768 ? 12 : 14,
        },
        default: {
          
        },
      }),
    },
    headerTextSub: {
        marginBottom:-12,
        color:'darkgray',
        ...Platform.select({
            ios: {
                fontSize: screenHeight < 768 ? 12 : 14,
            },
            android: {
            fontSize: screenHeight < 768 ? 11 : 12,
            },
            default: {
              
            },
          }),fontWeight: '400',
      },
    backIcon: {
      width: screenHeight < 768 ? 25 : 30,
      height: screenHeight < 768 ? 25 : 30,
    },
    name: {
      marginLeft: 16,
      color: themeColors.semiBlack,
      fontSize: screenHeight < 768 ? 15 : 17,
    },
    profilePic: {
        marginStart:25,
        marginEnd:10,
        width: screenHeight * 0.047,
        height: screenHeight * 0.047,
        borderRadius: 25,
      },
  // Add other styles for message rendering
  inputContainer: {

      borderTopEndRadius:10,
      borderTopStartRadius:10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor:'white',
  },
  messageInput: {
    flex: 1,
   
    height: '90%',
    fontSize:17,
    ...Platform.select({
        ios: {
            paddingTop: screenHeight < 768 ? 8:10,
        },
        android: {
            paddingTop: 0,  
         },
      }),
    paddingHorizontal: 10,
    paddingStart: 20,
    borderRadius: 20,
    backgroundColor: themeColors.semiGray,
    alignItems: 'center', // Center the content both horizontally and vertically
},
  sendButton: {
    marginStart:10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'black',
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: themeColors.semiGray,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  messageText: {
    color: 'black',
  },
  backIcon: {
    width: screenHeight < 768 ? 25 : 30,
    height: screenHeight < 768 ? 25 : 30,
  },
  profilePic: {
    marginStart:20,
    marginEnd:5,
    width: screenHeight * 0.047,
    height: screenHeight * 0.047,
    borderRadius: 25,
  },
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginVertical: 5,
  },
  messagesContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    
  },
  messageContainer: {
    margin: 5,
  },
  messageTextSender:{
    padding:10,
   
  },
  messageTextReceiver:{
    padding:10,
  },
  textContainer:{
    backgroundColor:themeColors.semiGray,
    borderRadius:20,
  },
  senderMessage: {
    maxWidth: '80%',
    alignSelf: 'flex-start', // Style for sender's messages on the left
     wordWrap: 'break-word',
     
  },
  receiverMessage: {
    justifyContent:'flex-end',
     maxWidth: '80%',
     wordWrap:'break-word',
    alignItems:'flex-end',
    alignSelf:'flex-end',
    marginEnd:15,
  },
  avatar:{
    height:screenHeight * 0.04,
    width:screenHeight * 0.04,
    borderRadius:50,
    margin:10,
  },
  timestampTextReceiver:{
    color:'gray',
    fontWeight:'300',
    marginStart:50,
    marginTop:2,
    fontSize:12,
  },
  timestampTextSender:{
    color:'gray',
    fontWeight:'300',
    marginTop:2,
    fontSize:12,
  },
  });