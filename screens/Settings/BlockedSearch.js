import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Image,SafeAreaView,
  Platform,
  TouchableOpacity,
  Dimensions,
  FlatList,Modal,ActivityIndicator
} from 'react-native';
import Icon, { Icons } from '../../components/Icons';
import { themeColors } from '../../theme';
import { FIREBASE_DB } from '../../config/firebase';
import {collection,doc,arrayUnion,updateDoc, getDoc,getDocs} from 'firebase/firestore'
import ConfirmModal from '../../components/ConfirmModal';
import Toast from 'react-native-root-toast';
import CustomModal from '../../components/CustomModal';
import { useUserData } from '../../components/userData';
import { Skeleton } from 'moti/skeleton';


const screenHeight = Dimensions.get('window').height;


export default function BlockedSearch({navigation}) {
 
    const {userData} = useUserData();
    const [searchText, setSearchText] = useState('');
   const [allUsers, setAllUsers] = useState([]); // List to store all users
   const [filteredUsers, setFilteredUsers] = useState([]); // List to store filtered users
   const noImage = require('../../assets/images/noprofile.png');
   const [selectedConversation, setSelectedConversation] = useState(null);
   const [loading, setLoading] = useState(false);
   const [iconName,setIcon] = useState('');
   const [inValid, InvalidCredential] = useState('');
   const [titleError,setTitle] = useState('');
   const [modalVisibleConfirm, setModalVisibleConfirm] = useState(false);
   const [colorPicked,setColorPicked] = useState('');
   const [showSkeleton, setShowSkeleton] = useState(true);

   useEffect(() => {
     const timer = setTimeout(() => {
       setShowSkeleton(false);
     }, 1500);
 
     return () => clearTimeout(timer);
   }, []); // This effect will run once when the component mounts
 
   const SkeletonCommonProps = Object.freeze({
     colorMode:'light',
     backgroundColor: '#cacaca',
     transition: {
       type: 'timing',
       duration: 1500,
     },
   });
   
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
 
   const userId = userData ? userData.id : '';
  
   useEffect(() => {
    // Fetch all users from Firebase Firestore and store them in the list
    const fetchAllUsers = async () => {
      try {
        const usersCollection = collection(FIREBASE_DB, 'User');
        const querySnapshot = await getDocs(usersCollection);
        const users = querySnapshot.docs.map((doc) => {
          const data = doc.data();
         
          const blockedUsers = userData && userData['blockedUsers'] ? userData['blockedUsers'] : [];
          const blockedByOtherUsers = data && data['blockedUsers'] ? data['blockedUsers'] : [];
          const isBlocked = data.id === userId || blockedUsers?.some(
            (blocked) => blocked.userId === data.id 
          ) || blockedByOtherUsers?.some((blocked)=> blocked.userId === userId );
          // Exclude the user if they are blocked
          
          return !isBlocked ? 
              {
                id: doc.id,
                firstName: data.firstName,
                lastName: data.lastName,
                profilePic: data.profilePic,
              }: '';
        });

        const filteredUsers = users.filter((user) => user !== '');
        setAllUsers(filteredUsers);
       
      } catch (error) {
        console.error('Error fetching all users:', error);
      }
    };
  
    fetchAllUsers();
  }, [userData]); // Fetch users when the component mounts or when userData changes
  
 
     useEffect(() => {
         // Filter users based on user's input
         if(allUsers!==null){
            const filtered = allUsers.filter((user) =>
            (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredUsers(filtered);
         }
         
     }, [searchText, allUsers]);
 
       const [isConfirmBlock, setConfirmBlock] = useState(false);
      
       const onBlockThisPerson = () => {
               setConfirmBlock(true);
       }
 
       const onConfirmButtonBlockThisPerson = async () => {
        setConfirmBlock(false);
        setLoading(true);
     
        try{
          const userDocRefUser = doc(FIREBASE_DB, 'User',userId);
          const userToBlocked = selectedConversation ? selectedConversation.id : '';
          const userIds ={userId:userToBlocked} ;
          await updateDoc(userDocRefUser, {
            blockedUsers:  arrayUnion(userIds),
            
          });
          
          if (userData !== null) {

            try{
                const convoID = selectedConversation.id + '_' + userData.id;
                const convoIDTwo = userData.id + '_' + selectedConversation.id;
                
                const userDocRefMessages = doc(FIREBASE_DB, 'Messages', convoID);
                const docSnapshot = await getDoc(userDocRefMessages);
                
                if (!docSnapshot.exists()) {
                  // If the first combination doesn't exist, try the second one
                  const userDocRefMessagesTwo = doc(FIREBASE_DB, 'Messages', convoIDTwo);
                  const docSnapshotTwo = await getDoc(userDocRefMessagesTwo);
                
                  if (docSnapshotTwo.exists()) {
                    // Use the second combination
                    await updateDoc(userDocRefMessagesTwo, {
                      hideConversation: arrayUnion(userId),
                      blockedUsers: arrayUnion(userIds),
                    });
                  }
                } else {
                  // Use the first combination
                  await updateDoc(userDocRefMessages, {
                    hideConversation: arrayUnion(userId),
                    blockedUsers: arrayUnion(userIds),
                  });
                }

            }catch(error){
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
 
     return(
         <SafeAreaView style={{
             flex: 1,
             backgroundColor:'white',
         }}>
             <View style={styles.header}>
                     <View style={styles.headerLeft}>
                     <TouchableOpacity  onPress={() => navigation.goBack()}>
                     <Image style={{width: screenHeight < 768 ? 25:30,
                                                 height: screenHeight < 768 ? 25:30}} 
                                                 source={require('../../assets/icons/left.png')}/>
                     </TouchableOpacity>
                     </View>
     
                     <View style={styles.headerCenter}>
                     <Text style={styles.headerText}>Block Someone</Text>
     
                     </View>
                     <TouchableOpacity >
                     <View style={styles.headerRight}>
                   
                      </View>
                     </TouchableOpacity>
                 </View>
                 <View style={{flex:1}}>
                 <Text style={styles.textStyle}>
                 When you block someone, they won't be able to see your status, find you or search, or send you messages. It's a way to keep your space peaceful.</Text>    
               
                 <View style={styles.searchStyle}>
                 <Icon
                 style={{marginEnd:8}}
                 type={Icons.Feather}
                 name="search"
                 color={themeColors.grey}
                 size={screenHeight < 768 ? 20 : 23}
                 />
                 <TextInput
                 placeholder="Search here . . ."
                 style={styles.searchInput}
                 value={searchText}
                 onChangeText={setSearchText}
                 />
                </View>
                         
                <FlatList
                         style={styles.flatListStyles}
                         data={filteredUsers} // Display the filtered users
                         renderItem={({ item }) => (
                             <View
                             style={styles.suggestionItem}
                             >
                             <Image
                                 style={styles.profilePic}
                                 source={item.profilePic ? { uri: item.profilePic } : noImage}
                             />
                             <View style={{flex:1,flexDirection:'row',justifyContent:'space-between'}}>
                             <Text style={styles.name}>
                                 {item.firstName} {item.lastName}
                             </Text>
                             <TouchableOpacity onPress={() => {
                                 onBlockThisPerson();
                                 setSelectedConversation(item);
                             }} 
                             style={{marginTop:-3,paddingTop:3,paddingBottom:3,paddingEnd:15,borderRadius:10,backgroundColor:'#f4f4f4'}}>
                             <Text style={{...styles.name,fontWeight:'400'}}>
                                Block
                             </Text>
                             </TouchableOpacity>
                             </View>
                             </View>
                         )}
                         keyExtractor={(item) => item.id}
                         />
 
                 {isConfirmBlock && (
                     <ConfirmModal
                     visible={isConfirmBlock}
                     onClose={onCloseConfirmButtonBlock}
                     onConfirm={onConfirmButtonBlockThisPerson}
                     buttonName={'Block it!'}
                     bgColor={themeColors.semiBlack}
                     title={`Block ${selectedConversation.firstName} ${selectedConversation.lastName}?`}
                     message={`Blocking this person hides it from your message list.`}
                     /> 
                     )}
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
        </SafeAreaView>
     );
     }
 
   const styles = StyleSheet.create({
     textStyle:{
       color:'gray',
       marginLeft:30,
       marginTop:10,
       marginEnd:15,
       ...Platform.select({
         ios: {
           fontSize:screenHeight < 768 ? 13:14,
         },
         android: {
             fontSize:13,
         },
       }),
     },
     header: {
         ...Platform.select({
             ios: {
               top:screenHeight < 768 ? -2:-10, 
             },
             android: {
               top: 28, 
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
         zIndex:99,
         left:10,
         alignItems: 'flex-start',
       },
       headerText: {
         fontSize: screenHeight < 768 ? 15: 18,
         fontWeight: '500',
       },
       headerCenter: {
         marginStart:-25,
         flex: 1,  // This will make it take up the available horizontal space
         alignItems: 'center',
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
         color: themeColors.buttonColorPrimary,
         left: 15,
       },
       searchStyle: {
         marginBottom:5,
         flexDirection: 'row',
         alignItems: 'center',
         marginHorizontal: 20,
         paddingHorizontal: 16,
         backgroundColor: '#fafafa',
         borderRadius: 25,
         ...Platform.select({
           ios: {
               top:screenHeight < 768 ? 10 : 30,
             marginTop: 10,
           },
           android: {
             marginTop: 20,
           },
           default: {
             marginTop: 0,
           },
         }),
       },
       flatListStyles:{
           ...Platform.select({
               ios: {
                   marginTop: screenHeight < 768 ? 20: 45,
               },
               android: {
                   marginTop: 25,
               },
               default: {
                   marginTop: 25,
               },
             }),
       },
       searchInput: {
         zIndex:999,
         color: themeColors.semiBlack,
         flex: 1,
         paddingVertical: screenHeight < 768 ? 10 : 11,
         fontSize: screenHeight < 768 ? 15 : 17,
       },
       backIcon: {
         width: screenHeight < 768 ? 25 : 30,
         height: screenHeight < 768 ? 25 : 30,
       },
       
       suggestionItem: {
         marginTop:5,
         flexDirection: 'row',
         alignItems: 'center',
         padding: 10,
         borderBottomWidth: 1,
         borderBottomColor: themeColors.semiGray,
         left:10,
         marginStart:10,
         marginEnd:30,
       },
       profilePic: {
         width: screenHeight * 0.05,
         height: screenHeight * 0.05,
         borderRadius: 25,
       },
       name: {
         marginLeft: 16,
         color: themeColors.semiBlack,
         fontSize: screenHeight < 768 ? 15 : 17,
       },
       emptyResults: {
           alignItems: 'center',
           justifyContent: 'center',
           marginTop:70,
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
     });