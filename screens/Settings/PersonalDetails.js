import { View, Text, TouchableOpacity,StyleSheet,ScrollView, Modal, ActivityIndicator,Dimensions } from 'react-native'
import React, { useState,useEffect} from 'react';
import { themeColors } from '../../theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeftIcon } from 'react-native-heroicons/solid'; 
import InputWithIcon from '../../components/InputWithIcon';
import {FIREBASE_DB} from '../../config/firebase';
import { doc, updateDoc } from "firebase/firestore";
import CustomModal from '../../components/CustomModal';
import { useUserData } from '../../components/userData';
import InputClickable from '../../components/InputClickable';
import DatePickerPopup from '../../components/DatePickerPopup' // Adjust the path based on your project structure
import { Dropdown } from 'react-native-element-dropdown';
import Icon, { Icons } from '../../components/Icons';
import { parse ,format } from 'date-fns';


const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
export default function PersonalDetails({navigation}) {

  
    const { userData } = useUserData();
  
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [birthday, setBirthday] = useState(new Date());

    const [firstNameStore, setFirstNameStore] = useState('');
    const [lastNameStore, setLastNameStore] = useState('');
    const [genderStore, setGenderStore] = useState('');
    const [birthdayStore, setBirthdayStore] = useState(new Date());

    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    const [genderError , setGenderError] = useState('');
    const [birthdayError, setBirthdayError] = useState('');

    const [isFirstNameValid, setIsFirstNameValid] = useState('');
    const [isLastNameValid, setIsLastNameValid] = useState('');
    const [isBirthdayValid, setBirthdayValid] = useState('');
    const [isGenderValid, setGenderValid] = useState('');

    const [iconName,setIcon] = useState('');
    const [inValid, InvalidCredential] = useState('');
    const [titleError,setTitle] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [isAnyFieldChanged, setIsAnyFieldChanged] = useState(false);

    const [firstNameChange, setFirstNameChange] = useState(false);
    const [lastNameChange, setLastNameChange] = useState(false);
    const [birthdayChange, setBirthdayChange] = useState(false);
    const [genderChange, setGenderChange] = useState(false);
  
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log('User Data:', userData);
        const getDataFromUser = async () => {
          if (userData !== null) {
            const isGenderAvailable = userData.gender ? userData.gender : 'Select Gender';
            // Parse the date string from Firestore using date-fns
                const isBirthdayAvailable = userData.birthday
                ? parse(userData.birthday, 'yyyy-MM-dd', new Date())
                : new Date();

            setFirstName(userData.firstName);
            setLastName(userData.lastName);
            setGender(isGenderAvailable);
            setBirthday(isBirthdayAvailable);

            setGenderStore(isGenderAvailable);
            setBirthdayStore(isBirthdayAvailable);
            setFirstNameStore(userData.firstName);
            setLastNameStore(userData.lastName);
          
    }
        }
        getDataFromUser();
    }, [userData]);

      useEffect(() => {
        // Ensure that this update is conditional
        if (firstNameChange || lastNameChange || birthdayChange || genderChange) {
          setIsAnyFieldChanged(true);
        } else {
          setIsAnyFieldChanged(false);
        }
       
      }, [firstNameChange, lastNameChange, birthdayChange, genderChange]);


    const openModalInvalid = () => {
      setModalVisible(true);
    };
   
    const closeModal = () => {
      setModalVisible(false);
    };
  
    const handleOkayInvalid = () => {
      // Handle 'Okay' button press
      InvalidCredential('');
      closeModal();
    };

    const handleSignUp = async () => {
  
          // First Name validation
          const isFirstNameValid = firstName && firstName.length >= 2 && /^[A-Za-z]+$/.test(firstName);

          if (!firstName) {
            setFirstNameError('First name is required!');
          } else if (firstName.length < 2) {
            setFirstNameError('First name must have 2 characters or more!');
          } else if (!/^[A-Za-z]+$/.test(firstName)) {
            setFirstNameError('First name should not contain numbers or spaces!');
          } else {
            setFirstNameError('');
          }
        // Last Name validation
        const isLastNameValid = lastName && /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(lastName);

        if (!lastName) {
          setLastNameError('Last name is required!');
        } else if (lastName.length < 2) {
          setLastNameError('Last name must have 2 characters or more!');
        } else if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(lastName)) {
          setLastNameError('Last name should not contain number and spaces in (beginning or end) are allowed');
        } else {
          setLastNameError('');
        }

      setIsFirstNameValid(isFirstNameValid);
      setIsLastNameValid(isLastNameValid);
      
      if (
        firstName &&
        lastName &&
        lastNameError  === ''&&
        firstNameError === ''
      )  {
        try {
            setLoading(true);
            const userDocRef = doc(FIREBASE_DB, 'User', userData.id);
            const formattedBirthday = format(birthday, 'yyyy-MM-dd');

            // Update the isOnline field to "false"
            await updateDoc(userDocRef, {
              birthday: formattedBirthday,
              gender: gender,
              firstName: firstName,
              lastName: lastName,
            });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setLoading(false);
            navigation.navigate('AccountSettings');
        } catch (err) {
            console.error('error at Personal Details Update button:',err.message)
            setLoading(false);
        }
      }
      else{
        console.log("something wrong");
      }
    
    };
    const [showDatePicker, setShowDatePicker] = useState(false);
   
    const handleDateChange = (event, date) => {
    const formattedBirthday = format(date, 'yyyy-MM-dd');

      if (date) {
        if(formattedBirthday !== birthdayStore){
            setBirthdayChange(true);
            setBirthday(date);
        }
        else{
            setBirthdayChange(false);
            setBirthday(date);
        }
      }
    };
    const isToday = (someDate) => {
        const today = new Date();
        return (
          someDate.getDate() === today.getDate() &&
          someDate.getMonth() === today.getMonth() &&
          someDate.getFullYear() === today.getFullYear()
        );
      };

    const handleSetPress = () => {
        setShowDatePicker(false);
      };

      const data = [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' },
        { label: 'Gay', value: 'Gay' },
        { label: 'Lesbian', value: 'Lesbian' },
        { label: 'Transgender', value: 'Transgender'},
        // Add more items as needed
      ];

    const screenWidth = Dimensions.get('window').height;
    const textSize = screenWidth < 768 ? 'text-xs' : '';
    const buttonText = screenWidth < 768 ? 'py-3' : 'py-4';
   
        const [isFocus, setIsFocus] = useState(false);
        const [isFocusBirthday, setIsFocusBirthday] = useState(false);
        const borderColor = isFocus ? themeColors.semiBlack : genderError ? themeColors.invalidColor :isGenderValid ? themeColors.validColor : '#ccc';
        const iconColor = isFocusBirthday ? themeColors.semiBlack : '#ccc';

    return (
  <ScrollView style={{ flex: 1 , backgroundColor: 'white'}}
      showsVerticalScrollIndicator={false} // Hide vertical scrollbar
      showsHorizontalScrollIndicator={false} >
    <View className="flex-1 bg-white" style={{backgroundColor: themeColors.bg}}>
      <SafeAreaView className="flex">
      <View className="flex flex-row items-center justify-start ml-2 mt-2">
      <TouchableOpacity onPress={() => navigation.goBack()} 
      className="p-2 rounded-2xl bg-white rounded-bl-2xl md-4 ml-3">
        <ArrowLeftIcon size="25"  color={themeColors.semiBlack} />
      </TouchableOpacity>
      </View>

      </SafeAreaView>
      
      <View className={`flex-1 bg-white px-8`}>
      
      <View style={{borderBottomWidth: 5, 
        marginTop:screenWidth < 768 ? 15: 0,
        borderBottomColor: themeColors.buttonColorPrimary,
        marginRight:screenWidth < 768 ? 275:330,
        marginLeft:10,marginBottom:-8 }} />
      
      
      <Text className={`ml-2`} 
      style={{ color:themeColors.semiBlack,fontWeight: 'bold', fontSize:screenWidth < 768 ? 22: 26, marginTop: 10, marginBottom: 1 }}>
       Personal details</Text>
      <Text className={`ml-2`} 
      style={{ fontWeight: 'semibold',color: 'gray', fontSize:screenWidth < 768 ? 15: 17, marginTop: 0, marginBottom: 20 }}>
         We uses this information to verify your identity
      </Text>
      
      <View className="form space-y-2">
      <Text className={`${textSize} text-gray-700 ml-2`}>First Name</Text>
      
      <InputWithIcon
        iconName="user"
        placeholder="First name"
        value={firstName}
        onChangeText={value => {setFirstName(value)
            if(value !== firstNameStore){
                setFirstNameChange(true);
            }
            else{
                setFirstNameChange(false);
            }}}
        isNameInput={true}
        setError={setFirstNameError}
        hasError={firstNameError}
        onTyping={() => setFirstNameError('')}
        isValid={isFirstNameValid}
        style={{paddingTop: screenWidth < 768 ? -1 : 4,
        paddingBottom: screenWidth < 768 ? -1 : 4}}
        />

     <Text style={{color:themeColors.invalidColor ,marginStart:5}}>{firstNameError}</Text>

      <Text className={`${textSize} text-gray-700 ml-2`}>Last Name</Text>
     
      <InputWithIcon
        iconName="user"
        placeholder="Last name"
        value={lastName}
        onChangeText={value => {setLastName(value)
            if(value !== lastNameStore){
                setLastNameChange(true);
            }
            else{
                setLastNameChange(false);
            }}}
        isNameInput={true}
        setError={setLastNameError}
        hasError={lastNameError}
        onTyping={() => setLastNameError('')}
        isValid={isLastNameValid}
        style={{paddingTop: screenWidth < 768 ? -1 : 4,
        paddingBottom: screenWidth < 768 ? -1 : 4}}
      />

       <Text style={{color:themeColors.invalidColor ,marginStart:5}}>{lastNameError}</Text>
       
       <Text className={`${textSize} text-gray-700 ml-2`}>Gender</Text>

       <View style={styles.container}>
        
        <Dropdown
          style={[styles.dropdown, {borderColor}]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={data}
          maxHeight={200}
          labelField="label"
          valueField="value"
          placeholder={gender}
          searchPlaceholder="Search..."
          value={gender}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setGender(item.value);
            if(item.value !== genderStore){
                setGenderChange(true);
            }
            else{
                setGenderChange(false);
            }
            setIsFocus(false);
          }}
          renderLeftIcon={() => (
            <Icon style={{marginStart:7,marginEnd:8}} type={Icons.FontAwesome} name="user" color={'#ccc'} size={20} />
          )}
        />
      </View>
       <Text style={{color:themeColors.invalidColor ,marginStart:5}}>{genderError}</Text>
       
       <Text className={`${textSize} text-gray-700 ml-2`}>Birthday</Text>
      
        <InputClickable
        iconColor = {iconColor}
        iconName="calendar"
        placeholder="Birthday"

        isNameInput={true}
        onFocus={() => setIsFocusBirthday(true)}
        onBlur={() => setIsFocusBirthday(false)}
        setError={setBirthdayError}
        hasError={birthdayError}
        onTyping={() => setBirthdayError('')}
        isValid={isBirthdayValid}
        style={{
            paddingTop: screenWidth < 768 ? -1 : 4,
            paddingBottom: screenWidth < 768 ? -1 : 4,
            borderColor,
        }}
        value={
            isToday(birthday)
              ? '' // Empty string if it's today's date
              : birthday.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
          }
        onChangeText={(item) => {
            setBirthday(item);
            if(item !== birthdayStore){
                setBirthdayChange(true);
            }
            else{
                setBirthdayChange(false);
            }}}   
          secureTextEntry={false}
        onClick={() => setShowDatePicker(true)}
        />
       <Text style={{color:themeColors.invalidColor ,marginStart:5}}>{birthdayError}</Text>
      <TouchableOpacity
        className={`${buttonText}  rounded-3xl m-5`}
        style={{
            backgroundColor: themeColors.semiBlack,
            opacity: isAnyFieldChanged ? 1 : 0.5,
          }}
          onPress={handleSignUp}
          disabled={!isAnyFieldChanged}
      >
        <Text style={{ fontSize: 17 }} className="font-bold text-center text-white sm:mb-1">
          Update details
        </Text>
      </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <DatePickerPopup
            showDatePicker={showDatePicker}
            selectedDate={birthday}
            onDateChange={handleDateChange}
            onSetPress={handleSetPress}
            onClose={() => setShowDatePicker(false)}
        />
        )}
      {inValid && (
        <CustomModal iconName={iconName} title={titleError} message={inValid} visible={modalVisible} onClose={closeModal} onOkay={handleOkayInvalid} />
      )}
       {loading && ( 
        <Modal transparent={true} animationType="fade" visible={loading}>
            <View style={{backgroundColor:'rgba(0, 0, 0, 0.5)',flex:1,justifyContent:'center'}}>
            <View style={{ backgroundColor: 'white',marginLeft:15,marginRight:15 , paddingLeft: 25,paddingRight:25,paddingBottom:20,paddingTop:30, borderRadius: 20 }}>
            <ActivityIndicator size="large" color="gray" />
            <Text style={{textAlign:'center',color:themeColors.semiBlack,marginTop:10,fontWeight:'bold'}}>Updating...</Text>
            </View>
            </View>
        </Modal> )}  
      </View>
      </ScrollView>
  )
};
const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
    },
    dropdown: {
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 15,
        paddingRight: 10,
        height:screenHeight < 768 ? 42:50,
        flex:1,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      color:themeColors.grey,
      fontSize: 14,
    },
    selectedTextStyle: {
      fontSize: 14,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
  
  });