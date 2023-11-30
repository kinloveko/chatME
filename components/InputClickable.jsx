import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { themeColors } from '../theme';

const InputClickable = ({
  iconColor,
  iconName,
  placeholder,
  value,
  onChangeText,
  hasError,
  onTyping,
  isValid,
  style,
  onClick,
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handlePress = () => {
    setIsClicked(!isClicked);
    if (onClick) {
      onClick();
    }
  };
  const borderColor = isClicked ? themeColors.semiBlack : hasError ? themeColors.invalidColor :isValid ? themeColors.validColor : '#ccc';
 
  const handleTyping = () => {
    if (hasError) {
      onTyping(); // Call the provided callback to clear the error
    }
  };

  return (
    <TouchableOpacity   onPress={handlePress}>
      <View style={[styles.inputContainer, { borderColor }, style]}>
        <Icon name={iconName} size={20} color={iconColor} style={styles.icon} />
        <TextInput
          onPressIn={handlePress}
          onClick={handlePress}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
          onFocus={handlePress}
          onBlur={handlePress}
          onChange={handleTyping}
          autoCapitalize="none"
          editable={false} // Set editable to false to make it not editable
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = {
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 4,
    borderRadius: 20,
    paddingLeft: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    height: 40, // Adjust the height as needed
  },
};

export default InputClickable;
