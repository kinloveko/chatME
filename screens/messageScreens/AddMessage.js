import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  StyleSheet,
  Image,
  Platform,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import Icon, { Icons } from '../../components/Icons';
import { themeColors } from '../../theme';
import { FIREBASE_DB } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore'; // Add these imports

const screenHeight = Dimensions.get('window').height;

export default function AddNewMessage({ navigation }) {
    
  const [searchText, setSearchText] = useState('');
  const [allUsers, setAllUsers] = useState([]); // List to store all users
  const [filteredUsers, setFilteredUsers] = useState([]); // List to store filtered users

  useEffect(() => {
    // Fetch all users from Firebase Firestore and store them in the list
    const fetchAllUsers = async () => {
      try {
        const usersCollection = collection(FIREBASE_DB, 'User');
        const querySnapshot = await getDocs(usersCollection);
        const users = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            firstName: data.firstName,
            lastName: data.lastName,
            profilePic: data.profilePic,
          };
        });

        setAllUsers(users);
      } catch (error) {
        console.error('Error fetching all users:', error);
      }
    };

    fetchAllUsers();
  }, []); // Fetch users when the component mounts

    useEffect(() => {
        // Filter users based on user's input
        const filtered = allUsers.filter((user) =>
        (user.firstName + ' ' + user.lastName).toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchText, allUsers]);
    
    const handleSelectName = (id) => {
        console.log('id',id);
        navigation.navigate('Conversation', { id }); // Navigate to Conversation and pass the id
      };

  const noImage = require('../../assets/images/noprofile.png');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              style={styles.backIcon}
              source={require('../../assets/icons/left.png')}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.headerText}>New Message</Text>
        </View>
      </View>
      <View style={styles.searchStyle}>
        <Icon
          type={Icons.Feather}
          name="edit-3"
          color={themeColors.grey}
          size={screenHeight < 768 ? 20 : 23}
        />
        <Text style={{ color: themeColors.grey, marginLeft: 5 }}>To:</Text>
        <TextInput
          placeholder="Type a name"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {filteredUsers.length === 0 && searchText !== '' ? ( // Check if no results and there's user input
       <View style={styles.emptyResults}>
            <Image style={styles.imageStyle} source={require('../../assets/images/sandbox.png')} />
          <Text style={styles.emptyResultsText}>No results found</Text>
          <Text style={styles.emptyResultsTextSub}>Try again with a different spelling or combination of terms. Complete words usually work best.</Text>
           </View>
      ) : (
        <FlatList
          style={styles.flatListStyles}
          data={filteredUsers} // Display the filtered users
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelectName(item.id)}
            >
              <Image
                style={styles.profilePic}
                source={item.profilePic ? { uri: item.profilePic } : noImage}
              />
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 24,
      backgroundColor: 'white',
    },
    header: {
         flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      ...Platform.select({
        ios: {
          top: screenHeight < 768 ? 0 : 20,
        },
        android: {
          marginTop: 20,
        },
        default: {
          marginTop: 0,
        },
      }),
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
      fontSize: screenHeight < 768 ? 15 : 18,
      fontWeight: '500',
    },
    searchStyle: {
      zIndex:999,
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      paddingHorizontal: 16,
      backgroundColor: themeColors.semiGray,
      borderRadius: 25,
      ...Platform.select({
        ios: {
            top:screenHeight < 768 ? 10 : 30,
          marginTop: 0,
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