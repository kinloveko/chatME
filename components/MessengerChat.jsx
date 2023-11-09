import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';



const MessengerChat = ({ messages , userData }) => {
  const renderMessage = ({ item }) => {
    return (

      <View style={item.sender === userData.id ? styles.senderMessage : styles.receiverMessage}>
        <Image source={{ uri: item.userImage }} style={styles.avatar} />
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={messages}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderMessage}
      inverted={true} // To display messages from bottom to top
    />
  );
};

const styles = StyleSheet.create({
  senderMessage: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 5,
  },
  receiverMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    marginLeft: 10,
  },
  messageContent: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ECECEC',
    borderRadius: 10,
  },
  messageText: {
    color: 'black',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
});

export default MessengerChat;
