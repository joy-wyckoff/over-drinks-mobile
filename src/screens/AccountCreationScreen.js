import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const AccountCreationScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { createAccount } = useAuth();
  const [loading, setLoading] = useState(false);
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
    email: 'idle', // 'idle', 'checking', 'valid', 'invalid'
    phoneNumber: 'idle',
    username: 'idle',
    password: 'idle',
    confirmPassword: 'idle',
    birthday: 'idle',
    gender: 'idle',
    sexuality: 'idle'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState({
    month: '',
    day: '',
    year: ''
  });
  const [selectedCountry, setSelectedCountry] = useState({
    code: '+1',
    name: 'United States',
    flag: '🇺🇸'
  });

  // Bad words filter for username
  const badWords = ['admin', 'root', 'test', 'user', 'guest', 'null', 'undefined', 'fuck', 'shit', 'damn', 'bitch', 'ass', 'hell', 'crap', 'stupid', 'idiot', 'dumb', 'loser', 'hate', 'kill', 'die', 'dead', 'sex', 'porn', 'nude', 'naked', 'fuck', 'fucking', 'fucked', 'shit', 'shitting', 'shitted', 'damn', 'damned', 'bitch', 'bitches', 'bitching', 'ass', 'asses', 'asshole', 'hell', 'hellish', 'crap', 'crappy', 'stupid', 'stupidity', 'idiot', 'idiotic', 'dumb', 'dumber', 'dumbest', 'loser', 'losing', 'hate', 'hating', 'hated', 'kill', 'killing', 'killed', 'die', 'dying', 'died', 'dead', 'death', 'sex', 'sexual', 'porn', 'pornographic', 'nude', 'nudity', 'naked', 'nakedness'];

  // Country data for phone codes
  const countries = [
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+1', name: 'Canada', flag: '🇨🇦' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: '+34', name: 'Spain', flag: '🇪🇸' },
    { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
    { code: '+46', name: 'Sweden', flag: '🇸🇪' },
    { code: '+47', name: 'Norway', flag: '🇳🇴' },
    { code: '+45', name: 'Denmark', flag: '🇩🇰' },
    { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', name: 'Austria', flag: '🇦🇹' },
    { code: '+32', name: 'Belgium', flag: '🇧🇪' },
    { code: '+351', name: 'Portugal', flag: '🇵🇹' },
    { code: '+353', name: 'Ireland', flag: '🇮🇪' },
    { code: '+358', name: 'Finland', flag: '🇫🇮' },
    { code: '+48', name: 'Poland', flag: '🇵🇱' },
    { code: '+420', name: 'Czech Republic', flag: '🇨🇿' },
    { code: '+36', name: 'Hungary', flag: '🇭🇺' },
    { code: '+385', name: 'Croatia', flag: '🇭🇷' },
    { code: '+386', name: 'Slovenia', flag: '🇸🇮' },
    { code: '+421', name: 'Slovakia', flag: '🇸🇰' },
    { code: '+370', name: 'Lithuania', flag: '🇱🇹' },
    { code: '+371', name: 'Latvia', flag: '🇱🇻' },
    { code: '+372', name: 'Estonia', flag: '🇪🇪' },
    { code: '+7', name: 'Russia', flag: '🇷🇺' },
    { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
    { code: '+375', name: 'Belarus', flag: '🇧🇾' },
    { code: '+370', name: 'Lithuania', flag: '🇱🇹' },
    { code: '+371', name: 'Latvia', flag: '🇱🇻' },
    { code: '+372', name: 'Estonia', flag: '🇪🇪' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+852', name: 'Hong Kong', flag: '🇭🇰' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
    { code: '+66', name: 'Thailand', flag: '🇹🇭' },
    { code: '+63', name: 'Philippines', flag: '🇵🇭' },
    { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
    { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
    { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+977', name: 'Nepal', flag: '🇳🇵' },
    { code: '+975', name: 'Bhutan', flag: '🇧🇹' },
    { code: '+93', name: 'Afghanistan', flag: '🇦🇫' },
    { code: '+98', name: 'Iran', flag: '🇮🇷' },
    { code: '+964', name: 'Iraq', flag: '🇮🇶' },
    { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+971', name: 'UAE', flag: '🇦🇪' },
    { code: '+974', name: 'Qatar', flag: '🇶🇦' },
    { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
    { code: '+968', name: 'Oman', flag: '🇴🇲' },
    { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
    { code: '+972', name: 'Israel', flag: '🇮🇱' },
    { code: '+970', name: 'Palestine', flag: '🇵🇸' },
    { code: '+962', name: 'Jordan', flag: '🇯🇴' },
    { code: '+961', name: 'Lebanon', flag: '🇱🇧' },
    { code: '+963', name: 'Syria', flag: '🇸🇾' },
    { code: '+90', name: 'Turkey', flag: '🇹🇷' },
    { code: '+20', name: 'Egypt', flag: '🇪🇬' },
    { code: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
    { code: '+254', name: 'Kenya', flag: '🇰🇪' },
    { code: '+256', name: 'Uganda', flag: '🇺🇬' },
    { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
    { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
    { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
    { code: '+249', name: 'Sudan', flag: '🇸🇩' },
    { code: '+218', name: 'Libya', flag: '🇱🇾' },
    { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
    { code: '+213', name: 'Algeria', flag: '🇩🇿' },
    { code: '+212', name: 'Morocco', flag: '🇲🇦' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷' },
    { code: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: '+57', name: 'Colombia', flag: '🇨🇴' },
    { code: '+51', name: 'Peru', flag: '🇵🇪' },
    { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
    { code: '+52', name: 'Mexico', flag: '🇲🇽' },
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+1', name: 'Canada', flag: '🇨🇦' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+64', name: 'New Zealand', flag: '🇳🇿' }
  ];

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Phone number validation and formatting
  const formatPhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const validatePhoneNumber = (phoneNumber) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const getFullPhoneNumber = () => {
    const cleaned = formData.phoneNumber.replace(/\D/g, '');
    return `${selectedCountry.code}${cleaned}`;
  };

  // Password validation
  const validatePasswordStrength = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      hasMinLength,
      hasUppercase,
      hasNumber,
      hasSpecialChar,
      isValid: hasMinLength && hasUppercase && hasNumber && hasSpecialChar
    };
  };

  const getPasswordStrengthMessage = (password) => {
    const strength = validatePasswordStrength(password);
    const missing = [];
    
    if (!strength.hasMinLength) missing.push('8 characters');
    if (!strength.hasUppercase) missing.push('1 uppercase letter');
    if (!strength.hasNumber) missing.push('1 number');
    if (!strength.hasSpecialChar) missing.push('1 special symbol');
    
    return missing.length > 0 ? `Missing: ${missing.join(', ')}` : 'Password is strong!';
  };

  // Birthday formatting
  const formatBirthday = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
    }
  };

  // Username validation
  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    return usernameRegex.test(username) && username.length >= 3 && username.length <= 20;
  };

  const containsBadWords = (username) => {
    const lowerUsername = username.toLowerCase();
    return badWords.some(word => lowerUsername.includes(word));
  };

  // Date picker functions
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear - 13; i++) {
      years.push(i);
    }
    return years.reverse();
  };

  const handleDateSelect = () => {
    if (selectedDate.month && selectedDate.day && selectedDate.year) {
      const monthNum = months.indexOf(selectedDate.month) + 1;
      const formattedDate = `${monthNum.toString().padStart(2, '0')}-${selectedDate.day.padStart(2, '0')}-${selectedDate.year}`;
      setFormData(prev => ({ ...prev, birthday: formattedDate }));
      setShowDatePicker(false);
    }
  };

  // Check for duplicates in existing accounts
  const checkForDuplicates = async (field, value) => {
    if (!value.trim()) return;
    
    setValidationStatus(prev => ({ ...prev, [field]: 'checking' }));
    
    try {
      const accountsData = await AsyncStorage.getItem('userAccounts');
      const accounts = accountsData ? JSON.parse(accountsData) : [];
      
      let isDuplicate = false;
      let isValidFormat = false;
      
      if (field === 'email') {
        isValidFormat = validateEmail(value);
        isDuplicate = accounts.some(account => 
          account.email.toLowerCase() === value.toLowerCase()
        );
      } else if (field === 'phoneNumber') {
        isValidFormat = validatePhoneNumber(value);
        const cleaned = value.replace(/\D/g, '');
        const fullPhone = `${selectedCountry.code}${cleaned}`;
        isDuplicate = accounts.some(account => 
          account.phoneNumber === fullPhone
        );
      } else if (field === 'username') {
        isValidFormat = validateUsername(value) && !containsBadWords(value);
        isDuplicate = accounts.some(account => 
          account.username.toLowerCase() === value.toLowerCase()
        );
      }
      
      if (!isValidFormat) {
        setValidationStatus(prev => ({ ...prev, [field]: 'invalid' }));
      } else if (isDuplicate) {
        setErrors(prev => ({ 
          ...prev, 
          [field]: `${field === 'email' ? 'Email' : field === 'phoneNumber' ? 'Phone number' : 'Username'} is already taken` 
        }));
        setValidationStatus(prev => ({ ...prev, [field]: 'invalid' }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
        setValidationStatus(prev => ({ ...prev, [field]: 'valid' }));
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
      setValidationStatus(prev => ({ ...prev, [field]: 'idle' }));
    }
  };

  const updateFormData = (field, value) => {
    let processedValue = value;
    
    // Format phone number as user types
    if (field === 'phoneNumber') {
      processedValue = formatPhoneNumber(value);
    }
    
    // Format birthday as user types
    if (field === 'birthday') {
      processedValue = formatBirthday(value);
    }
    
    // Filter username to only allow letters, numbers, dots, and underscores
    if (field === 'username') {
      processedValue = value.replace(/[^a-zA-Z0-9._]/g, '');
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Real-time validation
    if (field === 'email' && value) {
      if (!validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      }
    }
    
    if (field === 'phoneNumber' && value) {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length > 0 && cleaned.length < 10) {
        setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a complete 10-digit phone number' }));
      } else if (cleaned.length === 10 && !validatePhoneNumber(value)) {
        setErrors(prev => ({ ...prev, phoneNumber: 'Please enter a valid phone number' }));
      }
    }
    
    if (field === 'username' && value) {
      if (!validateUsername(value)) {
        setErrors(prev => ({ ...prev, username: 'Username must be 3-20 characters and contain only letters, numbers, dots, and underscores' }));
      } else if (containsBadWords(value)) {
        setErrors(prev => ({ ...prev, username: 'Username contains inappropriate content' }));
      }
    }
    
    // Password validation
    if (field === 'password' && value) {
      const strength = validatePasswordStrength(value);
      if (!strength.isValid) {
        setErrors(prev => ({ ...prev, password: getPasswordStrengthMessage(value) }));
        setValidationStatus(prev => ({ ...prev, password: 'invalid' }));
      } else {
        setErrors(prev => ({ ...prev, password: '' }));
        setValidationStatus(prev => ({ ...prev, password: 'valid' }));
      }
      
      // Also re-validate confirm password if it exists
      if (formData.confirmPassword) {
        if (formData.confirmPassword === value) {
          setErrors(prev => ({ ...prev, confirmPassword: '' }));
          setValidationStatus(prev => ({ ...prev, confirmPassword: 'valid' }));
        } else {
          setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
          setValidationStatus(prev => ({ ...prev, confirmPassword: 'invalid' }));
        }
      }
    }
    
    // Confirm password validation
    if (field === 'confirmPassword' && value) {
      if (value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        setValidationStatus(prev => ({ ...prev, confirmPassword: 'invalid' }));
      } else if (formData.password && value === formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
        setValidationStatus(prev => ({ ...prev, confirmPassword: 'valid' }));
      }
    }
    
    // Birthday validation
    if (field === 'birthday' && value) {
      if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
        setErrors(prev => ({ ...prev, birthday: '' }));
        setValidationStatus(prev => ({ ...prev, birthday: 'valid' }));
      } else {
        setErrors(prev => ({ ...prev, birthday: 'Please enter birthday in MM-DD-YYYY format' }));
        setValidationStatus(prev => ({ ...prev, birthday: 'invalid' }));
      }
    }
    
    // Gender validation
    if (field === 'gender' && value) {
      setErrors(prev => ({ ...prev, gender: '' }));
      setValidationStatus(prev => ({ ...prev, gender: 'valid' }));
    }
    
    // Sexuality validation
    if (field === 'sexuality' && value) {
      setErrors(prev => ({ ...prev, sexuality: '' }));
      setValidationStatus(prev => ({ ...prev, sexuality: 'valid' }));
    }
    
    // Check for duplicates on email, phone, and username
    if (['email', 'phoneNumber', 'username'].includes(field)) {
      // Debounce the validation check
      setTimeout(() => {
        checkForDuplicates(field, processedValue);
      }, 500);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Check required fields are filled
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password';
    if (!formData.birthday.trim()) newErrors.birthday = 'Birthday is required';
    if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
    if (!formData.sexuality.trim()) newErrors.sexuality = 'Sexuality is required';

    // If any required fields are missing, return false
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    // Check validation status for fields that have real-time validation
    if (validationStatus.email === 'invalid') {
      newErrors.email = errors.email || 'Email is invalid or already taken';
    }
    if (validationStatus.phoneNumber === 'invalid') {
      newErrors.phoneNumber = errors.phoneNumber || 'Phone number is invalid or already taken';
    }
    if (validationStatus.username === 'invalid') {
      newErrors.username = errors.username || 'Username is invalid or already taken';
    }
    if (validationStatus.password === 'invalid') {
      newErrors.password = errors.password || 'Password does not meet requirements';
    }
    if (validationStatus.confirmPassword === 'invalid') {
      newErrors.confirmPassword = errors.confirmPassword || 'Passwords do not match';
    }
    if (validationStatus.birthday === 'invalid') {
      newErrors.birthday = errors.birthday || 'Please enter birthday in MM-DD-YYYY format';
    }
    if (validationStatus.gender === 'invalid') {
      newErrors.gender = errors.gender || 'Gender is required';
    }
    if (validationStatus.sexuality === 'invalid') {
      newErrors.sexuality = errors.sexuality || 'Sexuality is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Debug function to check validation status
  const debugValidation = () => {
    console.log('Form Data:', formData);
    console.log('Validation Status:', validationStatus);
    console.log('Errors:', errors);
    
    // Test validateForm function
    const formValid = validateForm();
    console.log('Form Valid:', formValid);
    
    // Test each validation step
    const requiredFields = ['email', 'phoneNumber', 'firstName', 'lastName', 'username', 'password', 'confirmPassword', 'birthday', 'gender', 'sexuality'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    console.log('Missing required fields:', missingFields);
    
    const invalidFields = Object.entries(validationStatus).filter(([field, status]) => status === 'invalid');
    console.log('Invalid validation status fields:', invalidFields);
    
    // Check each field individually
    const fieldChecks = {
      email: {
        filled: !!formData.email.trim(),
        status: validationStatus.email,
        error: errors.email
      },
      phoneNumber: {
        filled: !!formData.phoneNumber.trim(),
        status: validationStatus.phoneNumber,
        error: errors.phoneNumber
      },
      username: {
        filled: !!formData.username.trim(),
        status: validationStatus.username,
        error: errors.username
      },
      password: {
        filled: !!formData.password.trim(),
        status: validationStatus.password,
        error: errors.password
      },
      confirmPassword: {
        filled: !!formData.confirmPassword.trim(),
        status: validationStatus.confirmPassword,
        error: errors.confirmPassword
      },
      birthday: {
        filled: !!formData.birthday.trim(),
        status: validationStatus.birthday,
        format: /^\d{2}-\d{2}-\d{4}$/.test(formData.birthday),
        error: errors.birthday
      },
      gender: {
        filled: !!formData.gender.trim(),
        status: validationStatus.gender,
        error: errors.gender
      },
      sexuality: {
        filled: !!formData.sexuality.trim(),
        status: validationStatus.sexuality,
        error: errors.sexuality
      }
    };
    
    console.log('Field Checks:', fieldChecks);
    
    Alert.alert(
      'Debug Info', 
      `Form Valid: ${formValid}\nMissing Fields: ${missingFields.length > 0 ? missingFields.join(', ') : 'None'}\nInvalid Fields: ${invalidFields.length > 0 ? invalidFields.map(([field]) => field).join(', ') : 'None'}\n\nField Status:\n${Object.entries(fieldChecks).map(([field, check]) => 
        `${field}: filled=${check.filled}, status=${check.status || 'N/A'}, error=${check.error || 'none'}`
      ).join('\n')}`
    );
  };

  const handleCreateAccount = async () => {
    // Debug validation status
    console.log('Attempting to create account...');
    console.log('Form Data:', formData);
    console.log('Validation Status:', validationStatus);
    console.log('Errors:', errors);

    // Check if any validation is still in progress
    if (Object.values(validationStatus).some(status => status === 'checking')) {
      Alert.alert('Please Wait', 'Please wait for validation to complete');
      return;
    }

    // Validate the form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix all errors before continuing');
      return;
    }

    setLoading(true);
    try {
      // Create account
      const accountData = {
        ...formData,
        phoneNumber: getFullPhoneNumber(), // Use full phone number with country code
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      // Store in AsyncStorage
      await createAccount(accountData);
      
      Alert.alert(
        'Account Created!',
        'Your account has been successfully created. You can now sign in.',
        [
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
  const sexualityOptions = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Other', 'Prefer not to say'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.4)']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Button
                  title="← Back"
                  onPress={() => navigation.goBack()}
                  variant="ghost"
                  style={styles.backButton}
                />
                <Text style={[styles.title, { color: colors.text }]}>
                  Create Account
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Join the community
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                {/* Personal Information */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Personal Information
                  </Text>
                  
                  <View style={styles.row}>
                    <View style={[styles.halfInput, { marginRight: 8 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>First Name</Text>
                      <Input
                        value={formData.firstName}
                        onChangeText={(value) => updateFormData('firstName', value)}
                        placeholder="First name"
                        style={styles.input}
                        multiline={false}
                        numberOfLines={1}
                      />
                      {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                    </View>
                    <View style={[styles.halfInput, { marginLeft: 8 }]}>
                      <Text style={[styles.label, { color: colors.text }]}>Last Name</Text>
                      <Input
                        value={formData.lastName}
                        onChangeText={(value) => updateFormData('lastName', value)}
                        placeholder="Last name"
                        style={styles.input}
                        multiline={false}
                        numberOfLines={1}
                      />
                      {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                    <View style={styles.inputWrapper}>
                      <Input
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        placeholder="Email address"
                        keyboardType="email-address"
                        style={styles.input}
                        multiline={false}
                        numberOfLines={1}
                      />
                      {validationStatus.email === 'checking' && (
                        <Ionicons name="time" size={16} color={colors.textSecondary} style={styles.validationIcon} />
                      )}
                      {validationStatus.email === 'valid' && (
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" style={styles.validationIcon} />
                      )}
                      {validationStatus.email === 'invalid' && (
                        <Ionicons name="close-circle" size={16} color="#ef4444" style={styles.validationIcon} />
                      )}
                    </View>
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
                    <View style={styles.phoneInputContainer}>
                      <TouchableOpacity
                        style={styles.countryCodeButton}
                        onPress={() => setShowCountryPicker(true)}
                      >
                        <Text style={[styles.countryCodeText, { color: colors.text }]}>
                          {selectedCountry.flag} {selectedCountry.code}
                        </Text>
                        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <View style={styles.phoneInputWrapper}>
                        <Input
                          value={formData.phoneNumber}
                          onChangeText={(value) => updateFormData('phoneNumber', value)}
                          placeholder="(123) 456-7890"
                          keyboardType="phone-pad"
                          style={styles.phoneInput}
                          multiline={false}
                          numberOfLines={1}
                        />
                        {validationStatus.phoneNumber === 'checking' && (
                          <Ionicons name="time" size={16} color={colors.textSecondary} style={styles.validationIcon} />
                        )}
                        {validationStatus.phoneNumber === 'valid' && (
                          <Ionicons name="checkmark-circle" size={16} color="#10b981" style={styles.validationIcon} />
                        )}
                        {validationStatus.phoneNumber === 'invalid' && (
                          <Ionicons name="close-circle" size={16} color="#ef4444" style={styles.validationIcon} />
                        )}
                      </View>
                    </View>
                    {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Birthday</Text>
                    <View style={styles.inputWrapper}>
                      <Input
                        value={formData.birthday}
                        onChangeText={(value) => updateFormData('birthday', value)}
                        placeholder="MM-DD-YYYY"
                        style={styles.input}
                        multiline={false}
                        numberOfLines={1}
                      />
                      <TouchableOpacity
                        style={styles.calendarButton}
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    {errors.birthday && <Text style={styles.errorText}>{errors.birthday}</Text>}
                  </View>
                </View>

                {/* Account Information */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Account Information
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Username</Text>
                    <View style={styles.inputWrapper}>
                      <Input
                        value={formData.username}
                        onChangeText={(value) => updateFormData('username', value)}
                        placeholder="Choose a username"
                        style={styles.input}
                        multiline={false}
                        numberOfLines={1}
                      />
                      {validationStatus.username === 'checking' && (
                        <Ionicons name="time" size={16} color={colors.textSecondary} style={styles.validationIcon} />
                      )}
                      {validationStatus.username === 'valid' && (
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" style={styles.validationIcon} />
                      )}
                      {validationStatus.username === 'invalid' && (
                        <Ionicons name="close-circle" size={16} color="#ef4444" style={styles.validationIcon} />
                      )}
                    </View>
                    {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Password</Text>
                    <View style={styles.inputWrapper}>
                      <Input
                        value={formData.password}
                        onChangeText={(value) => updateFormData('password', value)}
                        placeholder="Create a password"
                        secureTextEntry
                        style={styles.input}
                        multiline={false}
                        numberOfLines={1}
                      />
                      {validationStatus.password === 'valid' && (
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" style={styles.validationIcon} />
                      )}
                      {validationStatus.password === 'invalid' && (
                        <Ionicons name="close-circle" size={16} color="#ef4444" style={styles.validationIcon} />
                      )}
                    </View>
                    {formData.password && (
                      <View style={styles.passwordStrengthContainer}>
                        <Text style={[styles.passwordStrengthText, { 
                          color: validationStatus.password === 'valid' ? '#10b981' : '#ef4444' 
                        }]}>
                          {getPasswordStrengthMessage(formData.password)}
                        </Text>
                        <View style={styles.passwordRequirements}>
                          <Text style={[styles.requirementText, { 
                            color: validatePasswordStrength(formData.password).hasMinLength ? '#10b981' : '#ef4444' 
                          }]}>
                            • 8+ characters
                          </Text>
                          <Text style={[styles.requirementText, { 
                            color: validatePasswordStrength(formData.password).hasUppercase ? '#10b981' : '#ef4444' 
                          }]}>
                            • 1 uppercase
                          </Text>
                          <Text style={[styles.requirementText, { 
                            color: validatePasswordStrength(formData.password).hasNumber ? '#10b981' : '#ef4444' 
                          }]}>
                            • 1 number
                          </Text>
                          <Text style={[styles.requirementText, { 
                            color: validatePasswordStrength(formData.password).hasSpecialChar ? '#10b981' : '#ef4444' 
                          }]}>
                            • 1 special symbol
                          </Text>
                        </View>
                      </View>
                    )}
                    {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                    <View style={styles.inputWrapper}>
                      <Input
                        value={formData.confirmPassword}
                        onChangeText={(value) => updateFormData('confirmPassword', value)}
                        placeholder="Confirm your password"
                        secureTextEntry
                        style={styles.input}
                        multiline={false}
                        numberOfLines={1}
                      />
                      {validationStatus.confirmPassword === 'valid' && (
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" style={styles.validationIcon} />
                      )}
                      {validationStatus.confirmPassword === 'invalid' && (
                        <Ionicons name="close-circle" size={16} color="#ef4444" style={styles.validationIcon} />
                      )}
                    </View>
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                  </View>
                </View>

                {/* Profile Information */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Profile Information
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
                    <View style={styles.optionsContainer}>
                      {genderOptions.map((option) => (
                        <Button
                          key={option}
                          title={option}
                          onPress={() => updateFormData('gender', option)}
                          variant={formData.gender === option ? 'primary' : 'secondary'}
                          size="small"
                          style={styles.optionButton}
                        />
                      ))}
                    </View>
                    {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Sexuality</Text>
                    <View style={styles.optionsContainer}>
                      {sexualityOptions.map((option) => (
                        <Button
                          key={option}
                          title={option}
                          onPress={() => updateFormData('sexuality', option)}
                          variant={formData.sexuality === option ? 'primary' : 'secondary'}
                          size="small"
                          style={styles.optionButton}
                        />
                      ))}
                    </View>
                    {errors.sexuality && <Text style={styles.errorText}>{errors.sexuality}</Text>}
                  </View>
                </View>

                <Button
                  title="Debug Validation"
                  onPress={debugValidation}
                  variant="ghost"
                  style={styles.debugButton}
                />
                <Button
                  title="Test Phone Duplicate Check"
                  onPress={async () => {
                    try {
                      const accountsData = await AsyncStorage.getItem('userAccounts');
                      const accounts = accountsData ? JSON.parse(accountsData) : [];
                      const cleaned = formData.phoneNumber.replace(/\D/g, '');
                      const fullPhone = `${selectedCountry.code}${cleaned}`;
                      const isDuplicate = accounts.some(account => 
                        account.phoneNumber === fullPhone
                      );
                      Alert.alert(
                        'Phone Check', 
                        `Phone: ${fullPhone}\nExisting accounts: ${accounts.length}\nIs duplicate: ${isDuplicate}\nAccounts: ${JSON.stringify(accounts.map(a => ({ phone: a.phoneNumber, email: a.email })), null, 2)}`
                      );
                    } catch (error) {
                      Alert.alert('Error', `Failed: ${error.message}`);
                    }
                  }}
                  variant="ghost"
                  style={styles.debugButton}
                />
                <Button
                  title="Test Account Creation (Bypass)"
                  onPress={async () => {
                    try {
                      const accountData = {
                        ...formData,
                        phoneNumber: getFullPhoneNumber(),
                        id: Date.now().toString(),
                        createdAt: new Date().toISOString(),
                      };
                      await createAccount(accountData);
                      Alert.alert('Success!', 'Account created successfully (bypassed validation)');
                    } catch (error) {
                      Alert.alert('Error', `Failed: ${error.message}`);
                    }
                  }}
                  variant="ghost"
                  style={styles.debugButton}
                />
                <Button
                  title="Create Account"
                  onPress={handleCreateAccount}
                  loading={loading}
                  style={styles.createButton}
                />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
      
      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Birthday</Text>
            
            <View style={styles.datePickerRow}>
              {/* Month Picker */}
              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { color: colors.text }]}>Month</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.pickerOption,
                        {
                          backgroundColor: selectedDate.month === month ? colors.primary : colors.muted,
                          borderColor: colors.border,
                        }
                      ]}
                      onPress={() => setSelectedDate(prev => ({ ...prev, month }))}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          {
                            color: selectedDate.month === month ? colors.primaryForeground : colors.text,
                          }
                        ]}
                      >
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Day Picker */}
              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { color: colors.text }]}>Day</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {selectedDate.month && selectedDate.year && Array.from(
                    { length: getDaysInMonth(months.indexOf(selectedDate.month) + 1, selectedDate.year) },
                    (_, i) => i + 1
                  ).map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerOption,
                        {
                          backgroundColor: selectedDate.day === day.toString() ? colors.primary : colors.muted,
                          borderColor: colors.border,
                        }
                      ]}
                      onPress={() => setSelectedDate(prev => ({ ...prev, day: day.toString() }))}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          {
                            color: selectedDate.day === day.toString() ? colors.primaryForeground : colors.text,
                          }
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              {/* Year Picker */}
              <View style={styles.pickerContainer}>
                <Text style={[styles.pickerLabel, { color: colors.text }]}>Year</Text>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {generateYears().map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerOption,
                        {
                          backgroundColor: selectedDate.year === year.toString() ? colors.primary : colors.muted,
                          borderColor: colors.border,
                        }
                      ]}
                      onPress={() => setSelectedDate(prev => ({ ...prev, year: year.toString() }))}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          {
                            color: selectedDate.year === year.toString() ? colors.primaryForeground : colors.text,
                          }
                        ]}
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowDatePicker(false)}
                variant="ghost"
                style={styles.modalButton}
              />
              <Button
                title="Select Date"
                onPress={handleDateSelect}
                style={styles.modalButton}
                disabled={!selectedDate.month || !selectedDate.day || !selectedDate.year}
              />
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
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
            
            <ScrollView style={styles.countryList} showsVerticalScrollIndicator={false}>
              {countries.map((country, index) => (
                <TouchableOpacity
                  key={`${country.code}-${country.name}-${index}`}
                  style={[
                    styles.countryOption,
                    {
                      backgroundColor: selectedCountry.code === country.code && selectedCountry.name === country.name ? colors.primary : colors.muted,
                      borderColor: colors.border,
                    }
                  ]}
                  onPress={() => {
                    setSelectedCountry(country);
                    setShowCountryPicker(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text
                    style={[
                      styles.countryName,
                      {
                        color: selectedCountry.code === country.code && selectedCountry.name === country.name ? colors.primaryForeground : colors.text,
                      }
                    ]}
                  >
                    {country.name}
                  </Text>
                  <Text
                    style={[
                      styles.countryCode,
                      {
                        color: selectedCountry.code === country.code && selectedCountry.name === country.name ? colors.primaryForeground : colors.textSecondary,
                      }
                    ]}
                  >
                    {country.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowCountryPicker(false)}
                variant="ghost"
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    minHeight: height,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  input: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  validationIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -8,
    zIndex: 1,
  },
  calendarButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  createButton: {
    width: '100%',
    marginTop: 16,
  },
  debugButton: {
    width: '100%',
    marginBottom: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Georgia',
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
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  pickerScroll: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
  // Phone input styles
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 4,
  },
  phoneInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  phoneInput: {
    width: '100%',
  },
  // Country picker styles
  countryList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '400',
  },
  // Password strength styles
  passwordStrengthContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  passwordStrengthText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  passwordRequirements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AccountCreationScreen;
