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
  Dimensions, Modal, ActivityIndicator,
} from 'react-native';
import Toast from 'react-native-root-toast';
import {Timestamp,onSnapshot,arrayUnion, collection,doc, query, where,updateDoc, getDoc} from '@firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { useUserData } from '../../components/userData';
import { themeColors } from '../../theme';
import Icon, { Icons } from '../../components/Icons';
import { FIREBASE_DB } from '../../config/firebase';
import MessageItem from '../../components/MessageItem';
import CustomModalBottom from '../../components/CustomModalBottom';
import ConfirmModal from '../../components/ConfirmModal';
import CustomModal from '../../components/CustomModal';
import EmailModal from '../../components/EmailModal';
import { getAuth,sendEmailVerification } from 'firebase/auth';
import { Skeleton } from 'moti/skeleton';
import Animated, {FadeIn ,Layout } from 'react-native-reanimated';


const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
export default function ChatScreen() {
  const auth = getAuth();
  const navigation = useNavigation();
  const { userData } = useUserData();
  useEffect(() => {
    console.log('User Data:', userData);
  }, [userData]);
  const userId = userData? userData.id : '';
  const [isVerificationModalVisible, setVerificationModalVisible] = useState(false);
  const [profileInfo, setProfileInfo] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [iconName,setIcon] = useState('');
  const [inValid, InvalidCredential] = useState('');
  const [titleError,setTitle] = useState('');
  const [modalVisibleConfirm, setModalVisibleConfirm] = useState(false);
  const [colorPicked,setColorPicked] = useState('');
  const [verificationComplete,setVerificationComplete] = useState(false);
  const [resendTitle, setResendTitle] = useState('Resend Email Verification');
  const [disableSent, setDisableSent] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []); // This effect will run once when the component mounts


  const handleVerificationComplete =()=>{
    setVerificationComplete(false);
  };
  const handleVerificationCompleteClose = () =>{
    setVerificationComplete(false);
  }

useEffect(() => {
  if (userData && !userData.isVerified) {
    // If the user is not verified, show the verification modal
    setVerificationModalVisible(true);
  }
}, [userData]);

    const handleVerificationConfirm = async () => {
      auth.currentUser.reload();
      if(auth.currentUser.emailVerified === true){
        const userDocRef = doc(FIREBASE_DB, 'User', userId);
          await updateDoc (userDocRef,{
            isVerified: true,
          });
        setVerificationModalVisible(false);
        setVerificationComplete(true);
      }
      else{
        auth.currentUser.reload();
        console.log('auth.currentUser.emailVerified:',auth.currentUser.emailVerified);
        setVerificationModalVisible(true);
      }
    };

    const handleResendEmail = async () => {
      setVerificationModalVisible(true);
     await sendEmailVerification(auth.currentUser);
      setResendTitle('Email Sent (disabled)');
      setDisableSent(true);
     
    }

    const handleVerificationClose = () => {
        setVerificationModalVisible(false);
    };
  const openModalInvalid = () => {
    setModalVisibleConfirm(true);
  };
 
  const closeModal = () => {
    setModalVisibleConfirm(false);
  };
  const handleOkayInvalid = () => {
    InvalidCredential('');
    closeModal();
  };

  useEffect(() => {
    const fetchProfileInfo = async () => {
      if (userData !== null) {

        const messagesCollection = collection(FIREBASE_DB, 'Messages');
        const messagesQuery = query(
          messagesCollection,
          where('participants', 'array-contains', userId)
        );

        const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
          if (querySnapshot.empty || querySnapshot === null) {
            console.log('No messages found or querySnapshot is null');
            // You can handle this case as needed, e.g., setConversations([]) or return
            setConversations([]);
            return;
          }
          
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

                const blockedUsers = userData && userData['blockedUsers'] ? userData['blockedUsers'] : [];
                const blockedByOtherUsers = otherParticipantData && otherParticipantData['blockedUsers'] ? otherParticipantData['blockedUsers'] : [];
                const isBlocked = blockedUsers?.some(
                  (blocked) => blocked.userId === otherParticipantData.id 
                ) || blockedByOtherUsers?.some((blocked)=> blocked.userId === userId );
                // Exclude the user if they are blocked
                if(!isBlocked){
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
              else{
                profileInfoMap.set(docx.id, {
                  id: docx.id,
                  otherParticipantData,
                  participantID: otherParticipantData?.id,
                  profilePic: null,
                  firstName: 'Chatme',
                  lastName: 'User',
                  isOnline: 'false',
                  hideConversation: messageData?.hideConversation,
            
                });
              }
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
    if (userData !== null) {
      const messagesCollection = collection(FIREBASE_DB, 'Messages');
     
      const messagesQuery = query(
        messagesCollection,
        where('participants', 'array-contains', userData.id)
      );

      const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
       
        if (querySnapshot.empty || querySnapshot === null) {
          console.log('No messages found or querySnapshot is null');
          // You can handle this case as needed, e.g., setConversations([]) or return
          setConversations([]);
          return;
        }
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
            if (!message.deletedBy || !message.deletedBy.includes(userId)) {
              latestMessage = message;
              break;
            } else if (i === messages.length - 1) {
              latestMessage = {text:'. . . . . . .',timestamp:message.timestamp,isSeen:true};
            }
          }
          console.log('latestMessage:',latestMessage);

          if (otherParticipantData) {
            const otherParticipantDocRef = doc(
              FIREBASE_DB,
              'User',
              otherParticipantData
            );
  
            const participantSnapshot = await getDoc(otherParticipantDocRef);
  
            if (participantSnapshot.exists()) {
              const otherParticipantData = participantSnapshot.data();
  
              const blockedUsers = userData && userData['blockedUsers'] ? userData['blockedUsers'] : [];
              const blockedByOtherUsers = otherParticipantData && otherParticipantData['blockedUsers'] ? otherParticipantData['blockedUsers'] : [];
              const isBlocked = blockedUsers?.some(
                (blocked) => blocked.userId === otherParticipantData.id 
              ) || blockedByOtherUsers?.some((blocked)=> blocked.userId === userId );
              // Exclude the user if they are blocked
              if(!isBlocked){
                profileInfoMap.set(docx.id, {
                  id: docx.id,
                  otherParticipantData,
                  profilePic: otherParticipantData?.profilePic,
                  firstName: otherParticipantData?.firstName,
                  lastName: otherParticipantData?.lastName,
                  isOnline: otherParticipantData?.isOnline,
                  participantID: otherParticipantData?.id,
                  latestMessage: latestMessage ? latestMessage.text : null,
                  messageTime: latestMessage?.timestamp, // Access timestamp of the latest message
                  isSeen: latestMessage?.isSeen,
                  sender: latestMessage?.sender,
                  messagesArray: messageData?.messages,
                  hideConversation: messageData?.hideConversation,
                });
              }
              else{
                profileInfoMap.set(docx.id, {
                  id: docx.id,
                  otherParticipantData,
                  profilePic: null,
                  firstName: 'Chatme',
                  lastName: 'User',
                  isOnline: 'Offline',
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
        }

        // Filter out conversations where the current user is in hideConversation
        const filteredConversations = Array.from(profileInfoMap.values()).filter(
          (conversation) =>
            !conversation.hideConversation ||
            !conversation.hideConversation.includes(userData.id)
        );
       // Sort the conversations based on the timestamp of the latest message
      const sortedConversations = filteredConversations.sort((a, b) => {
        const timestampA = a.messageTime || 0; // Use 0 if messageTime is undefined
        const timestampB = b.messageTime || 0; // Use 0 if messageTime is undefined

     return timestampB - timestampA; // Sort in descending order (latest first)
     });
     setConversations(sortedConversations);
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
    setLoading(true);
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

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoading(false);

      InvalidCredential('Conversation is now deleted, you can still message ');
      setTitle('Deleted Successfully!');
      setIcon('checkmark-circle');
      openModalInvalid();
      setColorPicked(themeColors.semiBlack);

    } catch (error) {
      console.error('Error deleting conversation:', error);
      Toast.show('Error:Please try again!', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.BOTTOM,
        backgroundColor: 'rgba(0,0,0,0.7)',
        textColor: themeColors.bg,
        shadow: false,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  };

 const onCloseConfirmModal = () => {
        // Close the confirmation modal
        setConfirmModalVisible(false);
      };
      const [isConfirmBlock, setConfirmBlock] = useState(false);
            const onBlockThisPerson = () => {
              setConfirmBlock(true);
      }

      const onConfirmButtonBlockThisPerson = async () => {
        setConfirmBlock(false);
        setLoading(true);
     
        try{
          const userDocRefUser = doc(FIREBASE_DB, 'User',userId);
          const userToBlocked = selectedConversation ? selectedConversation.participantID : '';
          const userIds ={userId:userToBlocked} ;
          await updateDoc(userDocRefUser, {
            blockedUsers:  arrayUnion(userIds),
          });
         
          const convoID = selectedConversation ? selectedConversation.id : '';
          const userDocRefMessages = doc(FIREBASE_DB, 'Messages',convoID);
          console.log('convoID',convoID);
       
          await updateDoc(userDocRefMessages, {
            hideConversation: arrayUnion(userId),
            blockedUsers:  arrayUnion(userIds),
          });

          await new Promise((resolve) => setTimeout(resolve, 2000));
          setLoading(false);
          InvalidCredential('User has been blocked you can check it in your blocking settings');
          setTitle('Blocked Successfully!');
          setIcon('checkmark-circle');
          openModalInvalid();
          setColorPicked(themeColors.semiBlack);

        }
        catch(error){
          setLoading(false);
          console.error('Error blocking the user:', error);
          Toast.show('Error:Please try again!', {
            duration: Toast.durations.SHORT,
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
      const onCloseConfirmButtonBlock = () => {
        setConfirmBlock(false);
      }

  const noImage = require('../../assets/images/noprofile.png');
  const profilePic = userData ? userData.profilePic : '';

  const handleNavigateToAddMessage = () => {
    if(!userData.isVerified){
      return setVerificationModalVisible(true);
     }
     else
    navigation.navigate('AddNewMessage'); // Navigate to the 'addMessage' screen
  };

  const handleConversationPress = (id,convoID) => {
    if(!userData.isVerified){
      return setVerificationModalVisible(true);
     }
     else
    navigation.navigate('Conversation', { id,convoID }); // Navigate to Conversation and pass the id
    
  };
 const heightConst = screenHeight < 768 ? screenHeight * 0.09:screenHeight * 0.07;
 
 const SkeletonCommonProps = Object.freeze({
  colorMode:'light',
  backgroundColor: '#cacaca',
  transition: {
    type: 'timing',
    duration: 2000,
  },
});

 return (

    <View style={styles.containerStyle}>
      <View style={styles.header}>
              <View style={styles.headerLeft}>
              <TouchableOpacity onPress={() => {
                 if(!userData.isVerified){
                  return setVerificationModalVisible(true);
                 }
                 else
                navigation.navigate('Profile Settings')
              }}>
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
      <TouchableWithoutFeedback styles={{backgroundColor:'yellow',flex:1,zIndex:999,}} onPress={() => {
                 if(!userData.isVerified){
                 return setVerificationModalVisible(true);
                }
                else
                navigation.navigate('Search')
        }} >
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
          editable={false}
        />
      </View>
    </TouchableWithoutFeedback> 


  {conversations.length === 0 ? (
    <View style={styles.emptyResults}>
    <Image style={styles.imageStyle} source={require('../../assets/images/nomessage.png')} />
  <Text style={styles.emptyResultsText}>No messages</Text>
  <Text style={styles.emptyResultsTextSub}>"Time to chat it up! Initiate friendly conversations with everyone and build those connections!"</Text>
    </View>
  ): (
    <View style={{flex:1}} >
          <FlatList  style={{flexGrow:0,height:'20%',marginTop:10}}
    horizontal
    data={profileInfo.filter(item => !item.hideConversation?.includes(userData.id))}
    keyExtractor={(item, index) => `${item.id}-${index}`} // Combine item.id with index for a unique key
    renderItem={({ item }) => (
      <TouchableOpacity onPress={() => handleConversationPress(item.participantID,item.id)}>
      <View style={styles.conversationItem}>
      <Skeleton 
                show={showSkeleton}
                 height={screenHeight * 0.07} 
                 width={screenHeight * 0.07}
                   radius={'round'}
                  {...SkeletonCommonProps}
                >
                  
      <Animated.Image layout={Layout} 
        entering={FadeIn.duration(1500)}
        style={styles.conversationProfilePic}
        source={item.profilePic ? { uri: item.profilePic } : require('../../assets/images/noprofile.png')}
      />
      </Skeleton>
        <View style={styles.dot}>
        <Skeleton 
                 show={showSkeleton}
                 height={screenHeight < 768 ? 11: 13} 
                 width={screenHeight < 768 ? 11: 13}
                   radius={'round'}
                  {...SkeletonCommonProps}
                >
          <Animated.View 
          layout={Layout} 
          entering={FadeIn.duration(1500)}
          style={{ ...styles.dotSub, backgroundColor: item.isOnline === "true" ? themeColors.onlineGreen : themeColors.grey }} />
          </Skeleton>
        </View>
        <View height={1} />
        <Skeleton 
                 show={showSkeleton}
                 height={screenHeight < 768 ? 35: 40} 
                 width={screenHeight < 768 ? 46: 65}
                  {...SkeletonCommonProps}
                >
        <Animated.Text 
        layout={Layout} 
        entering={FadeIn.duration(1500)}
         ellipsizeMode='tail' numberOfLines={2} style={styles.conversationName}>
          {item.firstName} {item.lastName}
        </Animated.Text>
        </Skeleton>
      </View>
    </TouchableOpacity>
  )}
  contentContainerStyle={{ alignItems: 'flex-start' }} // Align content to start
/>
    <FlatList
            style={{ marginTop: -5 }}
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
                    <Skeleton 
                    show={showSkeleton}
                    height={heightConst} 
                    width={heightConst}
                      radius={'round'}
                      {...SkeletonCommonProps}
                    >
                    <Animated.Image
                      layout={Layout} 
                      entering={FadeIn.duration(2500)}
                        source={item.profilePic ? { uri: item.profilePic } : require('../../assets/images/noprofile.png')}
                        style={styles.verticalConversationProfilePic}
                    />
                    </Skeleton>

                    <View style={styles.verticalDot}>

                    <Skeleton 
                    show={showSkeleton}
                    height={screenHeight < 768 ? 11: 13} 
                    width={screenHeight < 768 ? 11: 13}
                      radius={'round'}
                      {...SkeletonCommonProps}
                    >
                      <Animated.View
                        layout={Layout} 
                        entering={FadeIn.duration(2500)}
                      style={{ ...styles.verticalDotSub, backgroundColor: item.isOnline === "true" ? themeColors.onlineGreen : themeColors.grey }} />
                    </Skeleton>
                    </View>

                    <View style={{ flex: 1 }}>

                    <Skeleton
                    show={showSkeleton}
                    height={screenHeight < 768 ? 23:25} 
                    width={'60%'}
                      radius={'round'}
                      {...SkeletonCommonProps}
                      >
                      <Animated.Text
                        layout={Layout} 
                        entering={FadeIn.duration(2500)}
                      style={item.sender === userData.id ? styles.verticalConversationName :
                        (item.isSeen ? styles.verticalConversationName : styles.verticalConversationNameBlack)}>
                        {item.firstName} {item.lastName}
                      </Animated.Text>
                    </Skeleton>

                    <View style={{padding:1}}>
                    <Skeleton 
                    show={showSkeleton}
                    height={screenHeight < 768 ? 22:24} 
                    width={'95%'}
                      radius={'round'}
                      {...SkeletonCommonProps}
                      >
                      <View style={{ flexDirection: 'row', paddingEnd: 100 }}>
                      <Animated.Text
                        layout={Layout} 
                        entering={FadeIn.duration(1500)}
                      numberOfLines={1} ellipsizeMode='tail'
                          style={item.sender === userData.id ? styles.verticalConversationMessage :
                            (item.isSeen ? styles.verticalConversationMessage : styles.verticalConversationNameBlack)}>
                          {item.latestMessage}
                        </Animated.Text> 
                        <MessageItem
                          style={item.sender === userData.id ? styles.timeStampStyle : (item.isSeen ? styles.timeStampStyle : styles.timeStampIsNotSeenStyle)}
                          item={item.messageTime}
                        />
                    </View>
                    </Skeleton>
                  </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={{ alignItems: 'flex-start' }}
          />
    </View>
   
  )}

{selectedConversation && (
      <CustomModalBottom
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onDeleteConversation={onDeleteConversation}
        onBlockPerson={() => {
          setModalVisible(false);
          onBlockThisPerson();
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
     {isConfirmBlock && (
     <ConfirmModal
      visible={isConfirmBlock}
      onClose={onCloseConfirmButtonBlock}
      onConfirm={onConfirmButtonBlockThisPerson}
      buttonName={'Block it!'}
      bgColor={themeColors.invalidColor}
      title={`Block ${selectedConversation.firstName} ${selectedConversation.lastName}?`}
      message={`Blocking this person hides them from your message list. Unblock ${selectedConversation.firstName} anytime by going to your privacy settings.`}
    /> 
    )}

      <EmailModal
        hide={false}
        onResendEmail={handleResendEmail}
        visible={isVerificationModalVisible}
        onClose={handleVerificationClose}
        onConfirm={handleVerificationConfirm}
        title={"Verification Required"}
        message={"Your email is not verified. Please verify your email to continue and click  the button once done."}
        buttonName={"Click to refresh!"}
        bgColor={themeColors.buttonColorPrimary}
        resendEmailName={resendTitle}
        disable={disableSent}
      />

      <EmailModal
         disable={true}
       resendEmailName={''}
        hide={true}
        visible={verificationComplete}
        onClose={handleVerificationCompleteClose}
        onConfirm={handleVerificationComplete}
        iconName={'checkmark-circle-outline'}
        title={"Verification Complete"}
        message={"Thank you verifying your email. You can now start a conversation to anyone."}
        buttonName={"Got it!"}
        bgColor={themeColors.semiBlack}
      />    
    
    {loading && ( 
    <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={{backgroundColor:'rgba(0, 0, 0, 0.5)',flex:1,justifyContent:'center'}}>
        <View style={{ backgroundColor: 'white',marginLeft:15,marginRight:15 , paddingLeft: 25,paddingRight:25,paddingBottom:20,paddingTop:30, borderRadius: 20 }}>
          <ActivityIndicator size="large" color="gray" />
          <Text style={{textAlign:'center',color:themeColors.semiBlack,marginTop:10,fontWeight:'bold'}}>Please wait...</Text>
        </View>
        </View>
    </Modal> 
    )}  
    {inValid && (
      <CustomModal iconName={iconName} colorItem={colorPicked} title={titleError} message={inValid} visible={modalVisibleConfirm} onClose={closeModal} onOkay={handleOkayInvalid} />
    )}
  

    </View>
  );
}


const styles = StyleSheet.create({
  index:{
    zIndex:999,
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:80,
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