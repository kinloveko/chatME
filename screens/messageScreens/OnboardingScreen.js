import { useRoute } from '@react-navigation/native';
import React from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  FlatList,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { themeColors } from '../../theme';


const {width, height} = Dimensions.get('window');

const COLORS = {primary: '#282534', white: '#fff'};


const slides = [
  {
    id: '1',
    image: require('../../assets/images/image1.png'),
    title: 'Welcome to Favorites!',
    subtitle: 'Keep your favorite conversations hidden and protected.',
  },
  {
    id: '2',
    image: require('../../assets/images/image2.png'),
    title: 'Your Favorites your Fortress',
    subtitle: 'Safeguard your cherished chats in your Favorites section',
  },
  {
    id: '3',
    image: require('../../assets/images/image3.png'),
    title: 'Control Your Conversations',
    subtitle: 'Giving you full control over the visibility of your conversations in Favorites',
  },
];

const Slide = ({item}) => {
  return (
    
    <View style={{alignItems: 'center'}}>
   
      <Image
        source={item?.image}
        style={{height: '75%', width, resizeMode: 'contain'}}
      />
      <View>
        <Text style={styles.title}>{item?.title}</Text>
        <Text style={styles.subtitle}>{item?.subtitle}</Text>
      </View>
    </View>
  );
};

const OnboardingScreen = ({navigation}) => {
  const route = useRoute();
  const { from,convoID } = route.params;
  console.log("from:",from);
  const handleButtonClick = ()=>{
   
    navigation.navigate('AddPasswordFavorites',{from,convoID})
  }

  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0);
  const ref = React.useRef();
  const updateCurrentSlideIndex = e => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex != slides.length) {
      const offset = nextSlideIndex * width;
      ref?.current.scrollToOffset({offset});
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const skip = () => {
    const lastSlideIndex = slides.length - 1;
    const offset = lastSlideIndex * width;
    ref?.current.scrollToOffset({offset});
    setCurrentSlideIndex(lastSlideIndex);
  };

  const Footer = () => {
    return (
      <View
        style={{
          height: height * 0.25,
          justifyContent: 'space-between',
          paddingHorizontal: 20,
        }}>
        {/* Indicator container */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 20,
          }}>
          {/* Render indicator */}
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlideIndex == index && {
                  backgroundColor: themeColors.semiBlack,
                  width: 25,
                },
              ]}
            />
          ))}
        </View>

        {/* Render buttons */}
        <View style={{marginBottom: 20}}>
          {currentSlideIndex == slides.length - 1 ? (
            <View style={{height: 50}}>
              <TouchableOpacity
                style={styles.btn}
                onPress={handleButtonClick}>
                <Text style={{color: themeColors.bg,fontWeight: 'bold', fontSize: 15}}>
                  GET STARTED
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.btn,
                  {
                    borderColor: themeColors.semiBlack,
                    borderWidth: 1,
                    backgroundColor: 'transparent',
                  },
                ]}
                onPress={skip}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 15,
                    color:  themeColors.semiBlack,
                  }}>
                  SKIP
                </Text>
              </TouchableOpacity>
              <View style={{width: 15}} />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={goToNextSlide}
                style={styles.btn}>
                <Text
                  style={{
                    color:'white',
                    fontWeight: 'bold',
                    fontSize: 15,
                  }}>
                  NEXT
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
       <TouchableOpacity style={{zIndex:999}} onPress={() => navigation.goBack()}>
          <Image
            style={styles.backIcon}
            source={require('../../assets/icons/left.png')}
          />
        </TouchableOpacity>  
      <StatusBar backgroundColor={ themeColors.semiGray} />
      <FlatList
        ref={ref}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        contentContainerStyle={{height: height * 0.75}}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={slides}
        pagingEnabled
        renderItem={({item}) => <Slide item={item} />}
      />
      <Footer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    backIcon: {
        zIndex:999,
        marginTop:10,
        marginBottom:-30,
        tintColor:themeColors.semiBlack,
        marginStart:15,
        width: height < 768 ? 25 : 30,
        height: height < 768 ? 25 : 30,
      },
  subtitle: {
    color: 'gray',
    fontSize: 13,
    marginTop: 10,
    maxWidth: '70%',
    textAlign: 'center',
    lineHeight: 23,
  },
  title: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'contain',
  },
  indicator: {
    height: 2.5,
    width: 10,
    backgroundColor: 'grey',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  btn: {
    flex: 1,
    height: 50,
    borderRadius: 5,
    backgroundColor: themeColors.semiBlack,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default OnboardingScreen;