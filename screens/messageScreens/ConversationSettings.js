import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions, Modal, ActivityIndicator,
} from 'react-native';
import {Timestamp,onSnapshot,arrayUnion,doc,updateDoc, getDoc} from '@firebase/firestore';
import { useUserData } from '../../components/userData';
import { themeColors } from '../../theme';
import Icon, { Icons } from '../../components/Icons';
import { FIREBASE_DB } from '../../config/firebase';
import ConfirmModal from '../../components/ConfirmModal';
import { useRoute } from '@react-navigation/native';
const screenHeight = Dimensions.get('window').height;

export default function ConversationSettings({navigation}) {
    
    const route = useRoute();
    const { id, convoID } = route.params;
    const { userData } = useUserData();
    const userId = userData? userData.id : '';

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
      
    const noImage = require('../../assets/images/noprofile.png');
    const [userDataReceiver, setUserDataReceiver] = useState(null);
    const profilePic = userDataReceiver ? userDataReceiver.profilePic : '';
    const firstName = userDataReceiver ? userDataReceiver.firstName : '';
    const lastName = userDataReceiver ? userDataReceiver.lastName : '';
    const userOnline =userDataReceiver ? userDataReceiver.isOnline : 'false';
    const isOnline = userOnline === 'true' ? 'Active now' : 'Offline';
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  
    const [loading, setLoading] = useState(false);
    const [isFavorite, setIsFavorite] = useState('');

    useEffect(() => {
      const conversationDocRef = doc(FIREBASE_DB, 'Messages', convoID);
    
      const unsubscribe = onSnapshot(conversationDocRef, (doc) => {
        const conversationData = doc.data();
    
        if (conversationData && userId) {
          const isUserDeletedIndex = conversationData.type.findIndex(item => item.userId === userId);
    
          if (isUserDeletedIndex !== -1) {
            const getType = [...conversationData.type];
    
            if (getType[isUserDeletedIndex]) {
              const type = getType[isUserDeletedIndex].type;
              const userId = getType[isUserDeletedIndex].userId;
              setIsFavorite(type);
              console.log('User ID:', userId, 'Type:', type);
            } else {
              console.log('Invalid index in getType array');
            }
          }
        }
      });
    
      // Return a cleanup function to unsubscribe when the component is unmounted
      return () => unsubscribe();
    }, [convoID, userId]); 
    
    const addOrRemove = isFavorite === 'conversation' ? 'Add to favorites' : 'Remove to favorites';
    const updateFavorites = isFavorite === 'conversation' ? 'favorites' : 'conversation';
    const buttonText = isFavorite === 'conversation' ? 'Add it!' : 'Removed it!'
    const titleConfirm = isFavorite === 'conversation' ? `Add ${firstName} ${lastName}?`: `Remove ${firstName} ${lastName}?` ;
    const messageConfirm = isFavorite === 'conversation' ? `Adding ${firstName} to your favorites excludes it from the message list and places it directly in the favorites list.`: 
    `Removing ${firstName} to your favorites excludes it from your favorite list and places it back to your message list.` ;
    const bgColorFav = isFavorite === 'conversation' ? themeColors.semiBlack: themeColors.invalidColor;
    

    const onDeleteConversation = () => {
        setConfirmModalVisible(true);
      };
      const onConfirmDelete = async () => {
        // Close the confirmation modal
        setConfirmModalVisible(false);
        setLoading(true);
      
        try {
          const conversationDocRef = doc(FIREBASE_DB, 'Messages', convoID);
          // Get the current conversation data
          const conversationSnapshot = await getDoc(conversationDocRef);
          const conversationData = conversationSnapshot.data();
          const isUserDeletedIndex = conversationData.deletedAt?.findIndex(item => item.userId === userData.id);
      
          if (isUserDeletedIndex !== -1) {
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
          gotoHome();
        } catch (error) {
          console.error('Error updating conversation:', error);
          // Handle error as needed
        }
      };
      const onCloseConfirmModal = () => {
        // Close the confirmation modal
        setConfirmModalVisible(false);
      };
      const gotoHome = () => {
        // Perform your action here...
    
        // Reset the navigation stack and navigate to the 'home' screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      };
      const [isConfirmBlock, setConfirmBlock] = useState(false);
      const onBlockThisPerson = () => {
        setConfirmBlock(true);
      }
      const onConfirmButtonBlockThisPerson = () => {
        setConfirmBlock(false);
      }
      const onCloseConfirmButtonBlock = () => {
        setConfirmBlock(false);
      }
      const [isConfirmFav, setConfirmFav] = useState(false);
      const onFavThisPerson = () => {
        setConfirmFav(true);
      }
      const onConfirmFav = async () => {
        setConfirmFav(false);
        const hasSecondPass = userData ? userData.secondPassword : null;
        if(hasSecondPass){
          setLoading(true);
          const whereTo= "ConversationSettings";
          const conversationDocRef = doc(FIREBASE_DB, 'Messages', convoID);
          try{
            const conversationSnapshot = await getDoc(conversationDocRef);
            if (conversationSnapshot.exists()) {
              const conversationData = conversationSnapshot.data();
        
              // Check if 'type' field is defined in the document
              if (conversationData && conversationData.type) {
                const isUserTypeIndex = conversationData.type.findIndex(item => item.userId === userId);
                
                if (isUserTypeIndex !== -1) {
                   const updatedType = [...conversationData.type];
                  updatedType[isUserTypeIndex] = {
                    type: updateFavorites,
                    userId: userId,
                  };
        
                  await updateDoc(conversationDocRef, {
                    type: updatedType,
                  });
                }
                await new Promise((resolve) => setTimeout(resolve, 2000));
                setLoading(false);
                if(isFavorite === 'conversation')
                navigation.navigate('FavoritesMessage',{whereTo});
                else navigation.navigate('Chat');
              }
            }
          }catch(err){
            setLoading(false);
            console.error('Error updating document:', error);
          }
        } 
        else{
          const from = "ConversationSettings";
          navigation.navigate('OnboardingScreen',{from,convoID}); 
          setConfirmFav(false);
        }
       
      }
      const onCloseFav = () => {
        setConfirmFav(false);
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

      <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent:'flex-end' }}>
        <TouchableOpacity style={{ marginEnd: 20 }}>
          <Icon
            type={Icons.Feather}
            name="settings"
            color={themeColors.semiBlack}
            size={screenHeight < 768 ? 20 : 30}
          />
        </TouchableOpacity>
      </View>
    </View>
    <View style={{
        flex:1,
        alignSelf:'center',
    }}>
        <Image
            style={styles.profilePic}
            source={profilePic ? { uri: profilePic } : noImage}
        />
        <View style={{ flexDirection: 'column' }}>
            <Text style={styles.headerText}>{firstName} {lastName}</Text>
            <Text style={styles.headerTextSub}>{isOnline}</Text>
            </View>
        </View>
    <View style={{ marginTop:-120,flexDirection:'row'}}>
          <Icon style={{marginStart:20,}}
                type={Icons.Feather}
                name="tool"
                color="grey"
                size={screenHeight < 768 ? 17 : 20}
            />
        <Text style={styles.texts}>Actions</Text>        
    </View>
    <View style={{width:'100%',flex:1,marginTop:10}}>
                    
                       <TouchableOpacity onPress={onFavThisPerson} style={styles.buttonContainer}>
                          <View style={styles.buttonColumn}>
                            <Icon type={Icons.Feather} name="heart" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                              <Text style={styles.buttonText}>{addOrRemove}</Text>
                          </View>
                              <Image style={{width: screenHeight < 768 ? 25:30,
                                height: screenHeight < 768 ? 25:30}} 
                                source={require('../../assets/icons/right.png')}/>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={onDeleteConversation} style={styles.buttonContainer}>
                          <View style={styles.buttonColumn}>
                            <Icon type={Icons.Feather} name="trash" color={themeColors.semiBlack} size={screenHeight < 768 ? 22 : 25} />
                              <Text style={styles.buttonText}>Delete Conversation</Text>
                          </View>
                              <Image style={{width: screenHeight < 768 ? 25:30,
                                height: screenHeight < 768 ? 25:30}} 
                                source={require('../../assets/icons/right.png')}/>
                      </TouchableOpacity> 
                      <View style={{display:isFavorite === 'conversation'? 'flex':'none'}}>
                      <TouchableOpacity onPress={onBlockThisPerson} style={styles.buttonContainer}>
                            <View style={styles.buttonColumn}>
                                <Icon type={Icons.Feather} name="minus-circle" color={themeColors.invalidColor} size={screenHeight < 768 ? 22 : 25} />
                                <Text style={{...styles.buttonText,color:themeColors.invalidColor}}>Block this person</Text>
                            </View>
                            <Image style={{width: screenHeight < 768 ? 25:30,tintColor:themeColors.invalidColor,
                                height: screenHeight < 768 ? 25:30}} 
                                source={require('../../assets/icons/right.png')}/>
                     </TouchableOpacity> 
                     </View>            
              </View>

     {isConfirmModalVisible && (
     <ConfirmModal
      visible={isConfirmModalVisible}
      onClose={onCloseConfirmModal}
      onConfirm={onConfirmDelete}
      bgColor={themeColors.invalidColor}
      buttonName={'Delete it!'}
      title="Delete this entire conversation?"
      message="Once you delete your copy of the conversation, it can't be undone."
    /> 
    )}
    {loading && ( 
    <Modal transparent={true} animationType="fade" visible={loading}>
        <View style={{backgroundColor:'rgba(0, 0, 0, 0.5)',flex:1,justifyContent:'center'}}>
        <View style={{ backgroundColor: 'white',marginLeft:15,marginRight:15 , paddingLeft: 25,paddingRight:25,paddingBottom:20,paddingTop:30, borderRadius: 20 }}>
          <ActivityIndicator size="large" color="gray" />
          <Text style={{textAlign:'center',color:themeColors.semiBlack,marginTop:10,fontWeight:'bold'}}>Loading...</Text>
        </View>
        </View>
    </Modal> )}  

    {isConfirmBlock && (
     <ConfirmModal
      visible={isConfirmBlock}
      onClose={onCloseConfirmButtonBlock}
      onConfirm={onConfirmButtonBlockThisPerson}
      buttonName={'Block it!'}
      bgColor={themeColors.invalidColor}
      title={`Block ${firstName} ${lastName}?`}
      message={`Blocking this person hides them from your message list. Unblock ${firstName} anytime by going to your privacy settings.`}
    /> 
    )}
     { isConfirmFav && (
        <ConfirmModal
        visible={isConfirmFav}
        onClose={onCloseFav}
        onConfirm={onConfirmFav}
        buttonName={buttonText}
        bgColor={bgColorFav}
        title={titleConfirm}
        message={messageConfirm}
      /> 
     )}
    </View>
  )
};

const styles = StyleSheet.create({
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
        color:'gray',
        ...Platform.select({
            ios: {
                fontSize: screenHeight < 768 ? 15: 17,
            },
            android: {
            fontSize: screenHeight < 768 ? 11 : 15,
            },
            default: {
            },
          }),
          fontWeight:'500',
          marginStart:5,
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
    headerCenter: {
      right:10,
      flex: 1,
      alignItems: 'center',
    },
    headerText: {
     marginTop:10,
     fontWeight: '700',
     color:themeColors.semiBlack,
      ...Platform.select({
        ios: {
            fontSize: screenHeight < 768 ? 18 : 19,
        },
        android: {
        fontSize: screenHeight < 768 ? 12 : 15,
        },
        default: {
          
        },
      }),
      textAlign:'center',
    },
    headerTextSub: {
        marginTop:3,
        textAlign:'center',
        color:'darkgray',
        ...Platform.select({
            ios: {
                fontSize: screenHeight < 768 ? 14 : 18,
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
    profilePic: {
        marginTop:20,
        width: screenHeight * 0.17,
        height: screenHeight * 0.17,
        borderRadius: 95,
      },
  });