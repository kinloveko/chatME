import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, ScrollView, Platform, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
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
} from 'firebase/firestore';
import { useUserData } from '../../components/userData';

const screenHeight = Dimensions.get('window').height;

export default function Conversation({ navigation }) {
  const route = useRoute();
  const { id } = route.params;

  const [userDataReceiver, setUserDataReceiver] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

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
      } else {
        console.log('User not found.');
        // Handle the case where the user is not found, e.g., show an error message or navigate back.
      }
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (userDataReceiver && userData) {
     // Define the Firestore collection where messages are stored
     const messagesCollection = collection(FIREBASE_DB, 'Messages');

     // Create a subscription to listen for changes in the Firestore query
     const unsubscribe = onSnapshot(messagesCollection, (querySnapshot) => {
       // Initialize an array to store updated message data
       const updatedMessages = [];
 
       // Loop through the documents in the Firestore query result
       querySnapshot.forEach((doc) => {
         const messageData = doc.data();
         
         // Check if both userData.id and userDataReceiver.id are participants
         if (
           messageData.participants.includes(userData.id) &&
           messageData.participants.includes(userDataReceiver.id)
         ) {
           updatedMessages.push(messageData);
         }
       });
 
       // Update the state with the new messages data
       setMessages(updatedMessages);
     });
 
     // Return a cleanup function to unsubscribe from the Firestore listener when the component unmounts
     return () => unsubscribe();
   }
 }, [userDataReceiver]);

  const sendMessage = async () => {
    try {
      if (message.trim() !== '') {
        // Create the new message data with the sender, text, and timestamp using Timestamp.now()
        const newMessage = {
          sender: userData.id,
          text: message,
          timestamp: Timestamp.now(),
        };

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
          // Chat document already exists, update it

          // Get the existing messages
          const existingMessages = chatDoc.data().messages || [];

          // Update the document with the new message and update the latestMessage
          await updateDoc(chatDocRef, {

            messages: [
              ...existingMessages,
              newMessage,
            ],
            latestMessage: {
              sender: userData.id,
              text: message,
              timestamp: Timestamp.now(),
            },
          });
        } else {
          // Chat document does not exist, create it
          const chatData = {
            show: true,
            type:'conversation',
            participants: participantsArray,
            latestMessage: {
              sender: userData.id,
              text: message,
              timestamp: Timestamp.now(),
            },
            messages: [newMessage],
          };

          await setDoc(chatDocRef, chatData);
        }

        setMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const firstName = userDataReceiver ? userDataReceiver.firstName : '';
  const lastName = userDataReceiver ? userDataReceiver.lastName : '';
  const profilePic = userDataReceiver ? userDataReceiver.profilePic : '';
  const noImage = require('../../assets/images/noprofile.png');
 
  const [showTimestamp, setShowTimestamp] = useState(null);
  function formatTimestamp(timestamp) {
    // Parse the timestamp (you may need to adjust this based on your timestamp format)
    const parsedTimestamp = new Date(timestamp);
    
    // Get the date and time components
    const date = parsedTimestamp.toLocaleDateString();
    const time = parsedTimestamp.toLocaleTimeString();
  
    return `${date} at ${time}`;
  }
  
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
            <Text style={styles.headerTextSub}>Online</Text>
          </View>
          <TouchableOpacity style={{ marginEnd: 20 }}>
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
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.chatContainer}>
          <View style={styles.messagesContainer}>
            {item.messages.map((message, msgIndex) => (
                console.log('TIME:',message.timestamp),
              <TouchableOpacity
                key={msgIndex}
                style={[
                  styles.messageContainer,
                  message.sender === userData.id
                    ? styles.receiverMessage
                    : styles.senderMessage,
                ]}
                onPress={() => {
                  // Toggle the showTimestamp state for the tapped message
                  setShowTimestamp(msgIndex === showTimestamp ? null : msgIndex);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {/* Check if the sender is the current user */}
                  {message.sender === userData.id ? (
                    <View style={styles.textContainer}>
                      <Text style={styles.messageTextSender}>{message.text}</Text>
                    </View>
                  ) : (
                    <>
                      <Image
                        source={{ uri: userDataReceiver.profilePic }}
                        style={styles.avatar}
                      />
                      <View style={styles.textContainer}>
                        <Text style={styles.messageTextReceiver}>{message.text}</Text>
                      </View>
                    </>
                  )}
                </View>
          
                {/* Render the timestamp if the showTimestamp state matches the message index */}
                {msgIndex === showTimestamp && (
                  <Text style={message.sender === userData.id ? 
                    styles.timestampTextSender : styles.timestampTextReceiver}> {message.timestamp
                    ? format(message.timestamp.toDate(), 'MMM d \'AT\' h:mm a')
                    : 'Invalid Timestamp'}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      inverted={true}
    />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message. . ."
          value={message}
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