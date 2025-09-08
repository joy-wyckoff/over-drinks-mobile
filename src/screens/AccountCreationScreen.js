import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const AccountCreationScreen = ({ navigation }) => {
  const { createAccount, login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [birthdayFocused, setBirthdayFocused] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    gender: '',
    sexuality: '',
  });

  const [errors, setErrors] = useState({});
  const [validationStatus, setValidationStatus] = useState({
    email: 'idle',
    phoneNumber: 'idle',
    username: 'idle',
    password: 'idle',
    confirmPassword: 'idle',
    birthday: 'idle',
    gender: 'idle',
    sexuality: 'idle',
  });

  const [validationMessages, setValidationMessages] = useState({
    email: '',
    phoneNumber: '',
    username: '',
    password: '',
    confirmPassword: '',
    birthday: '',
  });

  const [selectedCountry, setSelectedCountry] = useState({ name: 'United States', code: '+1', flag: '🇺🇸' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showSexualityPicker, setShowSexualityPicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const countries = [
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'Spain', code: '+34', flag: '🇪🇸' },
    { name: 'Italy', code: '+39', flag: '🇮🇹' },
  ];

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Other'];
  const sexualityOptions = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Other'];

  // Bad words filter for username
  const badWords = ['admin', 'root', 'test', 'user', 'guest', 'null', 'undefined', 'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 'crap', 'stupid', 'idiot', 'dumb', 'loser', 'hate', 'kill', 'die', 'dead', 'sex', 'porn', 'nude', 'naked'];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validatePhoneNumberDigits = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const validateBirthdayFormat = (birthday) => {
    const birthdayRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
    if (!birthdayRegex.test(birthday)) return false;
    
    const [month, day, year] = birthday.split('/').map(num => parseInt(num));
    
    // Check month (1-12, no 00)
    if (month < 1 || month > 12) return false;
    
    // Check day (1-31, no 00)
    if (day < 1 || day > 31) return false;
    
    // Check year (reasonable range)
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) return false;
    
    // Check if date actually exists
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return false;
    }
    
    return true;
  };

  const containsBadWords = (username) => {
    const lowerUsername = username.toLowerCase();
    return badWords.some(word => lowerUsername.includes(word.toLowerCase()));
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    return usernameRegex.test(username) && username.length >= 3;
  };

  const validatePassword = (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[0-9]/.test(password) && 
           /[^A-Za-z0-9]/.test(password);
  };

  const checkForDuplicates = async (field, value) => {
    try {
      const accountsData = await AsyncStorage.getItem('userAccounts');
      if (accountsData) {
        const accounts = JSON.parse(accountsData);
        
        const exists = accounts.some(account => {
          if (field === 'email') {
            return account.email && account.email.toLowerCase().trim() === value.toLowerCase().trim();
          } else if (field === 'phoneNumber') {
            const cleaned = value.replace(/\D/g, '');
            const fullPhone = `${selectedCountry.code}${cleaned}`;
            const storedCleaned = account.phoneNumber ? account.phoneNumber.replace(/\D/g, '') : '';
            
            return storedCleaned && storedCleaned === fullPhone.replace(/\D/g, '');
          } else if (field === 'username') {
            return account.username && account.username.toLowerCase().trim() === value.toLowerCase().trim();
          }
          return false;
        });
        return exists;
      }
      return false;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return false;
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Real-time validation for specific fields
    if (['email', 'phoneNumber', 'username', 'password', 'confirmPassword', 'birthday'].includes(field)) {
      setValidationStatus(prev => ({ ...prev, [field]: 'checking' }));
      setValidationMessages(prev => ({ ...prev, [field]: '' }));
      
      setTimeout(async () => {
        let isValid = false;
        let isUnique = true;
        let message = '';

        if (field === 'email') {
          if (!value) {
            message = 'Email is required';
          } else if (!validateEmail(value)) {
            message = 'Please enter a valid email address';
          } else {
            const isDuplicate = await checkForDuplicates('email', value);
            isUnique = !isDuplicate;
            if (isDuplicate) {
              message = 'This email is already registered';
            } else {
              message = '';
              isValid = true;
            }
          }
        } else if (field === 'phoneNumber') {
          if (!value) {
            message = 'Phone number is required';
          } else if (!validatePhoneNumber(value) || !validatePhoneNumberDigits(value)) {
            message = 'Please enter a valid 10-digit phone number';
          } else {
            const isDuplicate = await checkForDuplicates('phoneNumber', value);
            isUnique = !isDuplicate;
            if (isDuplicate) {
              message = 'This phone number is already registered';
            } else {
              message = '';
              isValid = true;
            }
          }
        } else if (field === 'username') {
          if (!value) {
            message = 'Username is required';
          } else if (value.length < 3) {
            message = 'Username must be at least 3 characters';
          } else if (!validateUsername(value)) {
            message = 'Username can only contain letters, numbers, . and _';
          } else if (containsBadWords(value)) {
            message = 'Username contains inappropriate content';
          } else {
            const isDuplicate = await checkForDuplicates('username', value);
            isUnique = !isDuplicate;
            if (isDuplicate) {
              message = 'This username is already taken';
            } else {
              message = '';
              isValid = true;
            }
          }
        } else if (field === 'password') {
          if (!value) {
            message = 'Password is required';
          } else if (value.length < 8) {
            message = 'Password must be at least 8 characters';
          } else if (!/[A-Z]/.test(value)) {
            message = 'Password must contain at least 1 uppercase letter';
          } else if (!/[0-9]/.test(value)) {
            message = 'Password must contain at least 1 number';
          } else if (!/[^A-Za-z0-9]/.test(value)) {
            message = 'Password must contain at least 1 special character';
          } else {
            message = '';
            isValid = true;
          }
        } else if (field === 'confirmPassword') {
          if (!value) {
            message = 'Please confirm your password';
          } else if (value !== formData.password) {
            message = 'Passwords do not match';
          } else {
            message = 'Passwords match!';
            isValid = true;
          }
        } else if (field === 'birthday') {
          if (!value) {
            message = 'Birthday is required';
          } else if (value.length < 8) {
            message = 'Please enter complete date (MM/DD/YYYY)';
          } else if (!validateBirthdayFormat(value)) {
            message = 'Please enter a valid date';
          } else {
            message = '';
            isValid = true;
          }
        }

        setValidationStatus(prev => ({
          ...prev,
          [field]: isValid ? 'valid' : 'invalid'
        }));
        
        setValidationMessages(prev => ({
          ...prev,
          [field]: message
        }));
      }, 500);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    
    try {
      // Check if all validation statuses are valid
      const requiredFields = ['email', 'phoneNumber', 'username', 'password', 'confirmPassword', 'birthday'];
      const invalidFields = requiredFields.filter(field => validationStatus[field] !== 'valid');
      
      if (invalidFields.length > 0) {
        const fieldNames = {
          email: 'Email',
          phoneNumber: 'Phone Number',
          username: 'Username',
          password: 'Password',
          confirmPassword: 'Confirm Password',
          birthday: 'Birthday'
        };
        
        const invalidFieldNames = invalidFields.map(field => fieldNames[field]).join(', ');
        
        Alert.alert(
          'Validation Error', 
          `Please fix the following fields: ${invalidFieldNames}. Check the messages below each field for specific requirements.`
        );
        setLoading(false);
        return;
      }

      // Check if all required fields are filled
      const newErrors = {};
      
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.password.trim()) newErrors.password = 'Password is required';
      if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';
      if (!formData.birthday.trim()) newErrors.birthday = 'Birthday is required';
      if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
      if (!formData.sexuality.trim()) newErrors.sexuality = 'Sexuality is required';

      if (Object.keys(newErrors).length > 0) {
        const missingFields = Object.keys(newErrors).map(field => {
          const fieldNames = {
            firstName: 'First Name',
            lastName: 'Last Name',
            email: 'Email',
            phoneNumber: 'Phone Number',
            username: 'Username',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            birthday: 'Birthday',
            gender: 'Gender',
            sexuality: 'Sexuality'
          };
          return fieldNames[field] || field;
        });
        
        Alert.alert(
          'Missing Information',
          `Please fill in the following required fields: ${missingFields.join(', ')}.`
        );
        setLoading(false);
        return;
      }

      // Check for duplicates
      const emailExists = await checkForDuplicates('email', formData.email);
      const phoneExists = await checkForDuplicates('phoneNumber', formData.phoneNumber);
      const usernameExists = await checkForDuplicates('username', formData.username);

      if (emailExists || phoneExists || usernameExists) {
        const duplicateFields = [];
        if (emailExists) duplicateFields.push('Email');
        if (phoneExists) duplicateFields.push('Phone Number');
        if (usernameExists) duplicateFields.push('Username');
        
        Alert.alert(
          'Account Already Exists',
          `The following information is already registered: ${duplicateFields.join(', ')}. Please use different information or try logging in.`
        );
        setLoading(false);
        return;
      }

      // Create account
      const accountData = {
        id: Date.now().toString(),
        email: formData.email,
        phoneNumber: `${selectedCountry.code}${formData.phoneNumber}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        password: formData.password, // In real app, hash this
        birthday: formData.birthday,
        gender: formData.gender,
        sexuality: formData.sexuality,
        createdAt: new Date().toISOString(),
      };

      await createAccount(accountData);
      
      // Automatically log the user in after account creation
      await login(formData.username, formData.password, true); // true for rememberMe
      
      // Show "Remember Me" popup
      Alert.alert(
        'Save Login Info?',
        'Would you like to save your username and password to this device for faster login?',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => {
              // User is already logged in, navigation will happen automatically via AuthContext
            }
          },
          {
            text: 'Save',
            onPress: async () => {
              // Credentials are already saved from the login call above
              // User is already logged in, navigation will happen automatically via AuthContext
            }
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    const match = limited.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const [, area, prefix, line] = match;
      if (line) return `(${area}) ${prefix}-${line}`;
      if (prefix) return `(${area}) ${prefix}`;
      if (area) return `(${area}`;
    }
    return limited;
  };

  const formatBirthday = (text) => {
    const cleaned = text.replace(/\D/g, '');
    // Limit to 8 digits (MMDDYYYY)
    const limited = cleaned.slice(0, 8);
    const match = limited.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    if (match) {
      const [, month, day, year] = match;
      
      // Validate month (01-12, no 00)
      let validMonth = month;
      if (month.length === 2) {
        const monthNum = parseInt(month);
        if (monthNum === 0) {
          validMonth = month.slice(0, 1); // Remove the 0
        } else if (monthNum > 12) {
          validMonth = '12'; // Cap at 12
        }
      }
      
      // Validate day (01-31, no 00)
      let validDay = day;
      if (day.length === 2) {
        const dayNum = parseInt(day);
        if (dayNum === 0) {
          validDay = day.slice(0, 1); // Remove the 0
        } else if (dayNum > 31) {
          validDay = '31'; // Cap at 31
        }
      }
      
      if (year) return `${validMonth}/${validDay}/${year}`;
      if (day) return `${validMonth}/${validDay}`;
      if (month) return `${validMonth}`;
    }
    return limited;
  };

  const getValidationIcon = (field) => {
    const status = validationStatus[field];
    if (status === 'checking') return 'time';
    if (status === 'valid') return 'checkmark-circle';
    if (status === 'invalid') return 'close-circle';
    return null;
  };

  const getValidationColor = (field) => {
    const status = validationStatus[field];
    if (status === 'valid') return '#4CAF50';
    if (status === 'invalid') return '#F44336';
    return '#E6C547';
  };

  const handleDateSelect = (date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${month}/${day}/${year}`;
    
    setFormData(prev => ({ ...prev, birthday: formattedDate }));
    setSelectedDate(date);
    setShowDatePicker(false);
  };

  const handleGenderSelect = (gender) => {
    setFormData(prev => ({ ...prev, gender }));
    setShowGenderPicker(false);
  };

  const handleSexualitySelect = (sexuality) => {
    setFormData(prev => ({ ...prev, sexuality }));
    setShowSexualityPicker(false);
  };

  return (
    <>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <LinearGradient
          colors={['#1A0D0F', '#281218', '#381B22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View 
              style={styles.content}
              onTouchStart={() => {
                setEmailFocused(false);
                setPhoneFocused(false);
                setUsernameFocused(false);
                setPasswordFocused(false);
                setConfirmPasswordFocused(false);
                setFirstNameFocused(false);
                setLastNameFocused(false);
                setBirthdayFocused(false);
              }}
            >
              {/* Header */}
              <View style={styles.header}>
                {/* Back Button */}
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={24} color="#E6C547" />
                  <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                
                <Text style={styles.appTitle}>Over Drinks</Text>
                <View style={styles.wineGlassesContainer}>
                  <Ionicons name="wine" size={24} color="#8B0000" />
                  <View style={styles.dashedLine} />
                  <Ionicons name="wine" size={24} color="#8B0000" />
                </View>
                <Text style={styles.tagline}>
                  Create your account
                </Text>
              </View>

              {/* Account Creation Container */}
              <View style={styles.accountContainer}>
                <LinearGradient
                  colors={['#000000', '#1a1a1a']}
                  style={styles.containerGradient}
                >
                  <Text style={styles.containerTitle}>
                    Join the community
                  </Text>

                  {/* Form */}
                  <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                    {/* Personal Information */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Personal Information</Text>
                      
                      <View style={styles.row}>
                         <View style={[styles.halfInput, { marginRight: 8 }]} onTouchStart={(e) => {
                           e.stopPropagation();
                           setFirstNameFocused(true);
                         }}>
                           <Text style={styles.label}>First Name</Text>
                           <View style={[
                             styles.inputWrapper,
                             firstNameFocused && styles.inputWrapperFocused
                           ]}>
                             <TextInput
                               value={formData.firstName}
                               onChangeText={(value) => updateFormData('firstName', value)}
                               placeholder="First name"
                               placeholderTextColor="#E6C547"
                               style={styles.inputField}
                               onFocus={() => setFirstNameFocused(true)}
                               onBlur={() => setFirstNameFocused(false)}
                             />
                           </View>
                           {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                         </View>
                        
                        <View style={[styles.halfInput, { marginLeft: 8 }]} onTouchStart={(e) => {
                          e.stopPropagation();
                          setLastNameFocused(true);
                        }}>
                          <Text style={styles.label}>Last Name</Text>
                          <View style={[
                            styles.inputWrapper,
                            lastNameFocused && styles.inputWrapperFocused
                          ]}>
                            <TextInput
                              value={formData.lastName}
                              onChangeText={(value) => updateFormData('lastName', value)}
                              placeholder="Last name"
                              placeholderTextColor="#E6C547"
                              style={styles.inputField}
                              onFocus={() => setLastNameFocused(true)}
                              onBlur={() => setLastNameFocused(false)}
                            />
                          </View>
                          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                        </View>
                      </View>

                      {/* Email */}
                      <View style={styles.inputGroup} onTouchStart={(e) => {
                        e.stopPropagation();
                        setEmailFocused(true);
                      }}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[
                          styles.inputWrapper,
                          emailFocused && styles.inputWrapperFocused
                        ]}>
                          <TextInput
                            value={formData.email}
                            onChangeText={(value) => updateFormData('email', value)}
                            placeholder="Enter your email"
                            placeholderTextColor="#E6C547"
                            style={styles.inputField}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                          />
                          {getValidationIcon('email') && (
                            <Ionicons
                              name={getValidationIcon('email')}
                              size={20}
                              color={getValidationColor('email')}
                              style={styles.validationIcon}
                            />
                          )}
                         </View>
                         {validationMessages.email && (
                           <Text style={[
                             styles.validationMessage,
                             validationStatus.email === 'valid' && styles.validationMessageValid,
                             validationStatus.email === 'invalid' && styles.validationMessageInvalid
                           ]}>
                             {validationMessages.email}
                           </Text>
                         )}
                         {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                       </View>

                      {/* Phone Number */}
                      <View style={styles.inputGroup} onTouchStart={(e) => {
                        e.stopPropagation();
                        setPhoneFocused(true);
                      }}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.phoneContainer}>
                          <TouchableOpacity
                            style={styles.countrySelector}
                            onPress={() => setShowCountryPicker(true)}
                          >
                            <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                            <Text style={styles.countryCode}>{selectedCountry.code}</Text>
                            <Ionicons name="chevron-down" size={16} color="#E6C547" />
                          </TouchableOpacity>
                          <View style={[
                            styles.phoneInputWrapper,
                            phoneFocused && styles.inputWrapperFocused
                          ]}>
                            <TextInput
                              value={formData.phoneNumber}
                              onChangeText={(value) => updateFormData('phoneNumber', formatPhoneNumber(value))}
                              placeholder="(555) 123-4567"
                              placeholderTextColor="#E6C547"
                              style={styles.inputField}
                              keyboardType="phone-pad"
                              onFocus={() => setPhoneFocused(true)}
                              onBlur={() => setPhoneFocused(false)}
                            />
                            {getValidationIcon('phoneNumber') && (
                              <Ionicons
                                name={getValidationIcon('phoneNumber')}
                                size={20}
                                color={getValidationColor('phoneNumber')}
                                style={styles.validationIcon}
                              />
                            )}
                          </View>
                         </View>
                         {validationMessages.phoneNumber && (
                           <Text style={[
                             styles.validationMessage,
                             validationStatus.phoneNumber === 'valid' && styles.validationMessageValid,
                             validationStatus.phoneNumber === 'invalid' && styles.validationMessageInvalid
                           ]}>
                             {validationMessages.phoneNumber}
                           </Text>
                         )}
                         {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                       </View>


                       {/* Birthday */}
                       <View style={styles.inputGroup} onTouchStart={(e) => {
                         e.stopPropagation();
                         setBirthdayFocused(true);
                       }}>
                         <Text style={styles.label}>Birthday</Text>
                         <View style={[
                           styles.inputWrapper,
                           birthdayFocused && styles.inputWrapperFocused
                         ]}>
                           <TextInput
                             value={formData.birthday}
                             onChangeText={(value) => updateFormData('birthday', formatBirthday(value))}
                             placeholder="MM/DD/YYYY"
                             placeholderTextColor="#E6C547"
                             style={styles.inputField}
                             keyboardType="numeric"
                             onFocus={() => setBirthdayFocused(true)}
                             onBlur={() => setBirthdayFocused(false)}
                           />
                           <TouchableOpacity
                             style={styles.calendarButton}
                             onPress={() => {
                               setBirthdayFocused(true);
                               setShowDatePicker(true);
                             }}
                           >
                             <Ionicons name="calendar" size={20} color="#E6C547" />
                           </TouchableOpacity>
                         </View>
                         {validationMessages.birthday && (
                           <Text style={[
                             styles.validationMessage,
                             validationStatus.birthday === 'valid' && styles.validationMessageValid,
                             validationStatus.birthday === 'invalid' && styles.validationMessageInvalid
                           ]}>
                             {validationMessages.birthday}
                           </Text>
                         )}
                         {errors.birthday && <Text style={styles.errorText}>{errors.birthday}</Text>}
                       </View>

                       {/* Gender */}
                       <View style={styles.inputGroup}>
                         <Text style={styles.label}>Gender</Text>
                         <TouchableOpacity
                           style={styles.inputWrapper}
                           onPress={() => {
                             console.log('Gender field clicked, setting showGenderPicker to true');
                             setShowGenderPicker(true);
                           }}
                           activeOpacity={0.7}
                         >
                           <Text style={[styles.inputField, { color: formData.gender ? '#F5F5DC' : '#E6C547' }]}>
                             {formData.gender || 'Select Gender'}
                           </Text>
                           <Ionicons name="chevron-down" size={20} color="#E6C547" style={styles.validationIcon} />
                         </TouchableOpacity>
                         {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                       </View>

                       {/* Sexuality */}
                       <View style={styles.inputGroup}>
                         <Text style={styles.label}>Sexuality</Text>
                         <TouchableOpacity
                           style={styles.inputWrapper}
                           onPress={() => setShowSexualityPicker(true)}
                           activeOpacity={0.7}
                         >
                           <Text style={[styles.inputField, { color: formData.sexuality ? '#F5F5DC' : '#E6C547' }]}>
                             {formData.sexuality || 'Select Sexuality'}
                           </Text>
                           <Ionicons name="chevron-down" size={20} color="#E6C547" style={styles.validationIcon} />
                         </TouchableOpacity>
                         {errors.sexuality && <Text style={styles.errorText}>{errors.sexuality}</Text>}
                       </View>
                    </View>

                     {/* Account Information Section */}
                     <View style={styles.section}>
                       <Text style={styles.sectionTitle}>Account Information</Text>
                       
                       {/* Username */}
                       <View style={styles.inputGroup} onTouchStart={(e) => {
                         e.stopPropagation();
                         setUsernameFocused(true);
                       }}>
                         <Text style={styles.label}>Username</Text>
                         <View style={[
                           styles.inputWrapper,
                           usernameFocused && styles.inputWrapperFocused
                         ]}>
                           <TextInput
                             value={formData.username}
                             onChangeText={(value) => updateFormData('username', value)}
                             placeholder="Choose a username"
                             placeholderTextColor="#E6C547"
                             style={styles.inputField}
                             autoCapitalize="none"
                             autoComplete="off"
                             textContentType="none"
                             autoCorrect={false}
                             onFocus={() => setUsernameFocused(true)}
                             onBlur={() => setUsernameFocused(false)}
                           />
                           {getValidationIcon('username') && (
                             <Ionicons
                               name={getValidationIcon('username')}
                               size={20}
                               color={getValidationColor('username')}
                               style={styles.validationIcon}
                             />
                           )}
                         </View>
                         {validationMessages.username && (
                           <Text style={[
                             styles.validationMessage,
                             validationStatus.username === 'valid' && styles.validationMessageValid,
                             validationStatus.username === 'invalid' && styles.validationMessageInvalid
                           ]}>
                             {validationMessages.username}
                           </Text>
                         )}
                         {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                       </View>
                       
                       <View style={styles.inputGroup} onTouchStart={(e) => {
                         e.stopPropagation();
                         setPasswordFocused(true);
                       }}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[
                          styles.passwordInputWrapper,
                          passwordFocused && styles.inputWrapperFocused
                        ]}>
                            <TextInput
                              value={formData.password}
                              onChangeText={(value) => updateFormData('password', value)}
                              placeholder="Create a password"
                              placeholderTextColor="#E6C547"
                              style={[styles.inputField, styles.passwordInput]}
                              secureTextEntry={!showPassword}
                              onFocus={() => setPasswordFocused(true)}
                              onBlur={() => setPasswordFocused(false)}
                              autoComplete="off"
                              textContentType="none"
                              autoCorrect={false}
                              autoCapitalize="none"
                              spellCheck={false}
                              selectionColor="#E6C547"
                              underlineColorAndroid="transparent"
                              keyboardType="default"
                              importantForAutofill="no"
                              passwordRules=""
                            />
                          <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                          >
                            <Ionicons 
                              name={showPassword ? "eye-off" : "eye"} 
                              size={20} 
                              color="#E6C547" 
                            />
                          </TouchableOpacity>
                          {getValidationIcon('password') && (
                            <Ionicons
                              name={getValidationIcon('password')}
                              size={20}
                              color={getValidationColor('password')}
                              style={styles.validationIcon}
                            />
                          )}
                         </View>
                         {validationMessages.password && (
                           <Text style={[
                             styles.validationMessage,
                             validationStatus.password === 'valid' && styles.validationMessageValid,
                             validationStatus.password === 'invalid' && styles.validationMessageInvalid
                           ]}>
                             {validationMessages.password}
                           </Text>
                         )}
                         <Text style={styles.passwordRequirements}>
                           Password must have: 8+ characters, 1 uppercase, 1 number, 1 special character
                         </Text>
                         {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                       </View>

                      <View style={styles.inputGroup} onTouchStart={(e) => {
                        e.stopPropagation();
                        setConfirmPasswordFocused(true);
                      }}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={[
                          styles.passwordInputWrapper,
                          confirmPasswordFocused && styles.inputWrapperFocused
                        ]}>
                            <TextInput
                              value={formData.confirmPassword}
                              onChangeText={(value) => updateFormData('confirmPassword', value)}
                              placeholder="Confirm your password"
                              placeholderTextColor="#E6C547"
                              style={[styles.inputField, styles.passwordInput]}
                              secureTextEntry={!showConfirmPassword}
                              onFocus={() => setConfirmPasswordFocused(true)}
                              onBlur={() => setConfirmPasswordFocused(false)}
                              autoComplete="off"
                              textContentType="none"
                              autoCorrect={false}
                              autoCapitalize="none"
                              spellCheck={false}
                              selectionColor="#E6C547"
                              underlineColorAndroid="transparent"
                              keyboardType="default"
                              importantForAutofill="no"
                              passwordRules=""
                            />
                          <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            <Ionicons 
                              name={showConfirmPassword ? "eye-off" : "eye"} 
                              size={20} 
                              color="#E6C547" 
                            />
                          </TouchableOpacity>
                          {getValidationIcon('confirmPassword') && (
                            <Ionicons
                              name={getValidationIcon('confirmPassword')}
                              size={20}
                              color={getValidationColor('confirmPassword')}
                              style={styles.validationIcon}
                            />
                          )}
                         </View>
                         {validationMessages.confirmPassword && (
                           <Text style={[
                             styles.validationMessage,
                             validationStatus.confirmPassword === 'valid' && styles.validationMessageValid,
                             validationStatus.confirmPassword === 'invalid' && styles.validationMessageInvalid
                           ]}>
                             {validationMessages.confirmPassword}
                           </Text>
                         )}
                         {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                       </View>
                    </View>

                    {/* Create Account Button */}
                    <TouchableOpacity
                      style={[styles.createButton, loading && styles.createButtonDisabled]}
                      onPress={handleCreateAccount}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#E6C547', '#D4AF37', '#B8860B']}
                        style={styles.createButtonGradient}
                      >
                        <Text style={styles.createButtonText}>
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </ScrollView>
                </LinearGradient>
              </View>
            </View>
          </SafeAreaView>
      </LinearGradient>
    </ScrollView>

    {/* Gender Picker Modal */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          console.log('Gender modal onRequestClose called');
          setShowGenderPicker(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    formData.gender === option && styles.optionItemSelected
                  ]}
                  onPress={() => handleGenderSelect(option)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.gender === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowGenderPicker(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Birthday</Text>
            
            <View style={styles.datePickerRow}>
              {/* Month Picker */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Month</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = new Date(2024, i, 1).toLocaleString('default', { month: 'long' });
                    return (
                      <TouchableOpacity
                        key={month}
                        style={[
                          styles.pickerOption,
                          selectedDate.getMonth() === i && styles.pickerOptionSelected
                        ]}
                        onPress={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setMonth(i);
                          setSelectedDate(newDate);
                        }}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          selectedDate.getMonth() === i && styles.pickerOptionTextSelected
                        ]}>
                          {month}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
              
              {/* Day Picker */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Day</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerOption,
                        selectedDate.getDate() === day && styles.pickerOptionSelected
                      ]}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(day);
                        setSelectedDate(newDate);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        selectedDate.getDate() === day && styles.pickerOptionTextSelected
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Year Picker */}
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Year</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 100 }, (_, i) => {
                    const year = new Date().getFullYear() - 18 - i; // Start from 18 years ago
                    return (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.pickerOption,
                          selectedDate.getFullYear() === year && styles.pickerOptionSelected
                        ]}
                        onPress={() => {
                          const newDate = new Date(selectedDate);
                          newDate.setFullYear(year);
                          setSelectedDate(newDate);
                        }}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          selectedDate.getFullYear() === year && styles.pickerOptionTextSelected
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => handleDateSelect(selectedDate)}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>Select Date</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sexuality Picker Modal */}
      <Modal
        visible={showSexualityPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSexualityPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Sexuality</Text>
            
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {sexualityOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    formData.sexuality === option && styles.optionItemSelected
                  ]}
                  onPress={() => handleSexualitySelect(option)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.sexuality === option && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowSexualityPicker(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Country</Text>
            
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.name}
                  style={[
                    styles.optionItem,
                    selectedCountry.name === country.name && styles.optionItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={[
                    styles.optionText,
                    selectedCountry.name === country.name && styles.optionTextSelected
                  ]}>
                    {country.name} {country.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowCountryPicker(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0D0F', // Set the darkest gradient color as background
  },
  backgroundGradient: {
    flex: 1,
    minHeight: '100%',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: -40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#E6C547',
    marginLeft: 4,
    fontWeight: '500',
  },
  appTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#E6C547',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  wineGlassesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dashedLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E6C547',
    marginHorizontal: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  accountContainer: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6C547',
    overflow: 'hidden',
    shadowColor: '#E6C547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  containerGradient: {
    padding: 32,
  },
  containerTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginBottom: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    height: 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    flexDirection: 'row',
    // Remove any highlighting
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  inputWrapperFocused: {
    borderColor: '#E6C547',
    borderWidth: 2,
    // Remove highlighting effects
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  inputField: {
    fontSize: 16,
    color: '#F5F5DC',
    fontFamily: 'Georgia',
    flex: 1,
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  passwordRequirements: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#E6C547',
    marginTop: 8,
    fontStyle: 'italic',
  },
  passwordInput: {
    color: '#F5F5DC', // Ensure consistent text color
    fontSize: 16,
    fontFamily: 'Georgia',
    backgroundColor: 'transparent', // Override iOS highlighting
    textDecorationLine: 'none', // Remove any text decoration
    textShadowColor: 'transparent', // Remove text shadow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
    // Override iOS password suggestion highlighting
    tintColor: '#F5F5DC',
    selectionColor: '#E6C547',
    // Remove any background highlighting
    borderWidth: 0,
    outline: 'none',
    // Force consistent styling
    padding: 0,
    margin: 0,
    // Prevent iOS from applying any default styling
    textAlign: 'left',
    textAlignVertical: 'center',
  },
  passwordInputWrapper: {
    height: 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
    flexDirection: 'row',
    // Completely remove any highlighting
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    // Remove any background effects
    overflow: 'hidden',
    // Force consistent background
    borderStyle: 'solid',
    // Prevent any iOS highlighting
    transform: [{ scale: 1 }],
  },
  validationIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginRight: 8,
    minWidth: 80,
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 14,
    color: '#E6C547',
    fontFamily: 'Georgia',
    marginRight: 4,
  },
  phoneInputWrapper: {
    flex: 1,
    height: 48,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    justifyContent: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  validationMessage: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 4,
    fontStyle: 'italic',
  },
  validationMessageValid: {
    color: '#4CAF50',
  },
  validationMessageInvalid: {
    color: '#FF6B6B',
  },
  createButton: {
    marginTop: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#000000',
    fontWeight: 'bold',
  },
  calendarButton: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6C547',
    padding: 24,
    zIndex: 10000,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  datePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerLabel: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: '#E6C547',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#000000',
    fontWeight: 'bold',
  },
  optionsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  optionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(230, 197, 71, 0.2)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(230, 197, 71, 0.1)',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
  },
  optionTextSelected: {
    color: '#E6C547',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#E6C547',
    fontWeight: '500',
  },
  modalButtonPrimary: {
    backgroundColor: '#E6C547',
    marginLeft: 12,
  },
  modalButtonTextPrimary: {
    color: '#000000',
    fontWeight: 'bold',
  },
  datePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  pickerScroll: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#E6C547',
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(230, 197, 71, 0.2)',
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
  },
  pickerOptionText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#E6C547',
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 200, // Extra padding to prevent screen cut off when scrolling
  },
  eyeButton: {
    position: 'absolute',
    right: 40, // Position to the left of the validation icon
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    zIndex: 1,
  },
});

export default AccountCreationScreen;
