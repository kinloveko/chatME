import React from 'react';
import { View, Image, Dimensions, StyleSheet, Animated } from 'react-native';

export default class SplashScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      fadeAnim: new Animated.Value(0),
    };
  }

  componentDidMount() {
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: true,
    }).start(() => {
      // After the animation, navigate to the WelcomeScreen
    this.props.navigation.replace('Welcome'); // Replace the current screen with WelcomeScreen
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Animated.View style={[styles.imageContainer, { opacity: this.state.fadeAnim }]}>
          <Image source={require('../assets/images/logo.png')} style={styles.image} />
        </Animated.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Customize background color
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: Dimensions.get('window').width * 0.5,
    height:  Dimensions.get('window').height * 0.4,
    aspectRatio: 1,
  },
});
