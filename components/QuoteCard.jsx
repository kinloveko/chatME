import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { themeColors } from '../theme';

const QuoteCard = ({ text, textSize, screenWidth }) => {
  return (
    <View style={{...styles.cardContainer,
    marginBottom:screenWidth < 768 ? -20 : -70,
    marginTop:screenWidth < 768 ? 0 : -55}}>
      <Text
        style={{
          fontFamily: 'League Spartan',
          fontSize: textSize,
          fontWeight: 'bold',
          color: 'black',
          textAlign: 'center',

        }}
      >
        {text}
      </Text>
      <View style={styles.quotationContainer}>
        <View style={styles.quotationDot} />
        <View style={styles.quotationDot} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 1,
    shadowColor: 'gray',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity:0,
    shadowRadius: 3,
    marginEnd: 30,
    marginStart: 30,
  },
  quotationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  quotationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: themeColors.buttonColorPrimary,
    margin: 5,
  },
});

export default QuoteCard;
