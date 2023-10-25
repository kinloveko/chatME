import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { themeColors } from '../theme';

const InputWithIcon = ({ iconName, placeholder, value, onChangeText, secureTextEntry, hasError, onTyping, isValid,style}) => {
  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisibility(!isPasswordVisible);
  };

  const handlePress = () => {
    setIsClicked(!isClicked);
  };

  const borderColor = isClicked ? themeColors.semiBlack : hasError ? themeColors.invalidColor :isValid ? themeColors.validColor : '#ccc';
  const iconColor = isClicked ? themeColors.semiBlack : hasError ? themeColors.invalidColor : isValid ? themeColors.validColor : '#ccc';

  const handleTyping = () => {
    if (hasError) {
      onTyping(); // Call the provided callback to clear the error
    }
  };

  return (
    <View style={[styles.inputContainer, { borderColor },style]}>
      <Icon name={iconName} size={20} color={iconColor} style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        style={ styles.input }
        onFocus={handlePress}
        onBlur={handlePress}
        onChange={handleTyping} 
        autoCapitalize="none"
      />
      
      {secureTextEntry && (
        <TouchableOpacity onPress={togglePasswordVisibility}>
          <Icon
            name={isPasswordVisible ? 'eye' : 'eye-slash'}
            size={20}
            color={iconColor}
            style={styles.icon}
          />
        </TouchableOpacity>
      )}
    </View>
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
    flex: 1,
    height: 40, // Adjust the height as needed
  },
};

export default InputWithIcon;
