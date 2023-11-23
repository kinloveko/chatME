import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

const MessageItem = ({ item, style }) => {
  const getMessageTime = (timestamp) => {
    const now = new Date();
    const messageDate = timestamp.toDate();
    const timeDifference = now - messageDate;

    // Calculate minutes, hours, days, and weeks
    const minutes = Math.floor(timeDifference / (1000 * 60));
    const hours = Math.floor(timeDifference / (1000 * 60 * 60));
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));

    // Format the message time based on the difference
    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return messageDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
    } else if (weeks < 1) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Text style={style} ellipsizeMode='tail' numberOfLines={1}>
      {getMessageTime(item)}
    </Text>
  );
};

export default MessageItem;
