import React, { useState, useEffect } from 'react';
import {
  View,TextInput,
  Text,
  StyleSheet,
  Image,TouchableWithoutFeedback,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon, { Icons } from '../../components/Icons';
import {Timestamp,onSnapshot,arrayUnion, collection,doc, query, where,updateDoc, getDoc} from '@firebase/firestore';import { useUserData } from '../../components/userData';
import { themeColors } from '../../theme';
import { FIREBASE_DB } from '../../config/firebase';
import ConfirmModal from '../../components/ConfirmModal';
import MessageItem from '../../components/MessageItem';
import CustomModalBottom from '../../components/CustomModalBottom';
import { useRoute } from '@react-navigation/native';
import { Skeleton } from 'moti/skeleton';
import Animated, {FadeIn ,Layout } from 'react-native-reanimated';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
export default function FavoritesMessage({navigation}) {

    const { userData } = useUserData();
    
    const route = useRoute();
    const { whereTo } = route.params;

    useEffect(() => {
        console.log('User Data:', userData);
      }, [userData]);
   
      const [profileInfo, setProfileInfo] = useState([]);
      const [conversations, setConversations] = useState([]);
      const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
      const [isModalVisible, setModalVisible] = useState(false);
      const [selectedConversation, setSelectedConversation] = useState(null);
      const userLoggedAs = userData ? userData.loggedAs : '';
      const [showSkeleton, setShowSkeleton] = useState(true);


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []); // This effect will run once when the component mounts

  const SkeletonCommonProps = Object.freeze({
    colorMode:'light',
    backgroundColor: '#cacaca',
    transition: {
      type: 'timing',
      duration: 2000,
    },
  });
  
  const heightConst = screenHeight < 768 ? screenHeight * 0.09:screenHeight * 0.07;
 
      useEffect(() => {
        const fetchProfileInfo = async () => {
          if (userData && userData.secondPassword !== null) {

            const messagesCollection = collection(FIREBASE_DB, 'Messages');
            const messagesQuery = query(
              messagesCollection,
              where('participants', 'array-contains', userData.id)
            );
    
            const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
              const profileInfoMap = new Map();
    
              for (const docx of querySnapshot.docs) {
                const messageData = docx.data();
               
              // Check if the message is of type 'conversation' and doesn't include the current user's ID
              const isConversationType = messageData.type.some(typeObj => typeObj.type === 'favorites' 
              && typeObj.userId === userData.id);

              if (!isConversationType) {
                continue;
              }
              else{
                const participants = messageData.participants;
                const otherParticipantID = participants.find(
                  (participantID) => participantID !== userData.id
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
              }
              setProfileInfo(Array.from(profileInfoMap.values()));
            });
    
            return () => unsubscribe();
          }
          else{
             setProfileInfo([]);
          }
        };
    
        fetchProfileInfo();
    }, [userData]);
    
    useEffect(() => {
      const fetchConversations = async () => {
        if (userData) {
          const messagesCollection = collection(FIREBASE_DB, 'Messages');
          const messagesQuery = query(
            messagesCollection,
            where('participants', 'array-contains', userData.id)
          );
    
          const unsubscribe = onSnapshot(messagesQuery, async (querySnapshot) => {
            const profileInfoMap = new Map();
            if(userData.loggedAs === 'normal'){
              setConversations([]);
            }
            else{
            for (const docx of querySnapshot.docs) {
              const messageData = docx.data();
              
              // Check if the message is of type 'conversation' and doesn't include the current user's ID
              const isConversationType = messageData.type.some(typeObj => typeObj.type === 'favorites' 
              && typeObj.userId === userData.id);
              
              if (!isConversationType) {
                continue;
            }
            else{
              console.log('isConversationType',isConversationType);
              const messages = messageData?.messages;
              const participants = messageData.participants;
              const otherParticipantData = participants.find(
                (participantID) => participantID !== userData.id
              );
      
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
           }
            // Filter out conversations where the current user is in hideConversation
            const filteredConversations = Array.from(profileInfoMap.values()).filter(
              (conversation) =>
                !conversation.hideConversation ||
                !conversation.hideConversation.includes(userData.id)
            );
    
            //console.log('filteredConversations:', filteredConversations);
              
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
      const handleConversationPress = (id,convoID) => {
        // Handle navigation to the chat screen with the selected conversation
        navigation.navigate('Conversation', { id,convoID }); // Navigate to Conversation and pass the id
      };

    const handleBack = () => {
        if(whereTo === 'Profile'){
        navigation.navigate('Profile Settings')
        }
      else{
        navigation.navigate('Chat')
      }
      }

      
  return (
    <View style={styles.containerHolder}>
    <View style={styles.container} />
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity  onPress={handleBack}>
          <Image
            style={styles.backIcon}
            source={require('../../assets/icons/left.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={{alignItems:'center',flex:1}} >
        <Text style={styles.texts} >Favorites</Text>
      </View>
      <TouchableOpacity onPress={()=> navigation.navigate('UpdatePasswordFavorites',{whereTo})}  >
      <Icon type={Icons.Feather}
               name="settings" 
               color={themeColors.semiBlack} 
               size={screenHeight < 768 ? 20 : 23} 
               style={{marginEnd:10,marginStart:-35}}/>
     </TouchableOpacity>
    </View>
    <View style={{marginTop:10}} />
    <TouchableWithoutFeedback styles={{backgroundColor:'yellow',flex:1,zIndex:999}} onPress={() => {
                 if(!userData.isVerified){
                 return setVerificationModalVisible(true);
                }
                else
                navigation.navigate('SearchFavorites')
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

  {conversations.length === 0 || userLoggedAs === 'normal' ? (
    <View style={styles.emptyResults}>
    <Image style={styles.imageStyle} source={require('../../assets/images/nomessage.png')} />
  <Text style={styles.emptyResultsText}>Favorites is empty!</Text>
  <Text style={styles.emptyResultsTextSub}>"Time to chat it up! Initiate friendly conversations with everyone and build those connections!"</Text>
    </View>
  ) : (
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
                      entering={FadeIn.duration(1500)}
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
                        entering={FadeIn.duration(1500)}
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
                        entering={FadeIn.duration(1500)}
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
        isInFavorites={true}
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
  )

}

const styles = StyleSheet.create({
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
  emptyResults: {
    zIndex:-999,
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:-150,
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
    buttonContainer: {
        padding:10,
        marginLeft:20,
        marginRight:20,
        marginBottom:10,
        flexDirection: 'row', // Make the columns side by side
        alignItems: 'center', // Align items vertically in the center
        justifyContent: 'space-between', // Space the columns evenly
        paddingHorizontal: 10, // Add padding as needed
      },
      buttonColumn: {
        flex: 1, // Make each column take equal horizontal space
        alignItems: 'center', // Align items vertically in the center
        flexDirection: 'row', // Elements inside columns should be in a row
      },
      buttonText : {
        fontSize: 15,
        fontWeight: '500',
        color: themeColors.semiBlack,
        left: 15,
      },
    texts:{
        color:themeColors.semiBlack,
        ...Platform.select({
            ios: {
                marginStart: screenHeight < 768 ? -24:-20,
                fontSize: screenHeight < 768 ? 15: 18,
            },
            android: {
            fontSize:15,
            },
            default: {
            },
          }),
          fontWeight:'500',
    },
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
    backIcon: {
      width: screenHeight < 768 ? 25 : 30,
      height: screenHeight < 768 ? 25 : 30,
    },
    profilePic: {
        marginTop:20,
        width: screenHeight * 0.17,
        height: screenHeight * 0.17,
        borderRadius: 95,
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
  });