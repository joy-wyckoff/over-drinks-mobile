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
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const AccountCreationScreen = ({ navigation }) => {
  const { createAccount } = useAuth();
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
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

  const [selectedCountry, setSelectedCountry] = useState({ name: 'United States', code: '+1', flag: '🇺🇸' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCountryPicker, setShowCountryPicker] = useState(false);

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

  const genderOptions = ['Male', 'Female', 'Non-binary', 'Other', 'Prefer not to say'];
  const sexualityOptions = ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Other', 'Prefer not to say'];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    return phoneRegex.test(phone);
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
            const fullPhone = `${selectedCountry.code}${value}`;
            return account.phoneNumber && account.phoneNumber === fullPhone;
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
    if (['email', 'phoneNumber', 'username'].includes(field)) {
      setValidationStatus(prev => ({ ...prev, [field]: 'checking' }));
      
      setTimeout(async () => {
        let isValid = false;
        let isUnique = true;

        if (field === 'email') {
          isValid = validateEmail(value);
          if (isValid) {
            isUnique = !(await checkForDuplicates('email', value));
          }
        } else if (field === 'phoneNumber') {
          isValid = validatePhoneNumber(value);
          if (isValid) {
            isUnique = !(await checkForDuplicates('phoneNumber', value));
          }
        } else if (field === 'username') {
          isValid = validateUsername(value);
          if (isValid) {
            isUnique = !(await checkForDuplicates('username', value));
          }
        }

        setValidationStatus(prev => ({
          ...prev,
          [field]: isValid && isUnique ? 'valid' : 'invalid'
        }));
      }, 500);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    
    try {
      // Basic validation
      const newErrors = {};
      
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
      
      if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
      else if (!validatePhoneNumber(formData.phoneNumber)) newErrors.phoneNumber = 'Invalid phone format';
      
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      
      if (!formData.username) newErrors.username = 'Username is required';
      else if (!validateUsername(formData.username)) newErrors.username = 'Username must be 3+ characters, letters, numbers, . or _ only';
      
      if (!formData.password) newErrors.password = 'Password is required';
      else if (!validatePassword(formData.password)) newErrors.password = 'Password must be 8+ chars with uppercase, number, and special character';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      if (!formData.birthday) newErrors.birthday = 'Birthday is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.sexuality) newErrors.sexuality = 'Sexuality is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }

      // Check for duplicates
      const emailExists = await checkForDuplicates('email', formData.email);
      const phoneExists = await checkForDuplicates('phoneNumber', formData.phoneNumber);
      const usernameExists = await checkForDuplicates('username', formData.username);

      if (emailExists || phoneExists || usernameExists) {
        const duplicateErrors = {};
        if (emailExists) duplicateErrors.email = 'Email already exists';
        if (phoneExists) duplicateErrors.phoneNumber = 'Phone number already exists';
        if (usernameExists) duplicateErrors.username = 'Username already exists';
        setErrors(duplicateErrors);
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
      
      Alert.alert(
        'Account Created!',
        'Your account has been created successfully. Please complete your profile.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      const [, area, prefix, line] = match;
      if (line) return `(${area}) ${prefix}-${line}`;
      if (prefix) return `(${area}) ${prefix}`;
      if (area) return `(${area}`;
    }
    return cleaned;
  };

  const formatBirthday = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,2})(\d{0,4})$/);
    if (match) {
      const [, month, day, year] = match;
      if (year) return `${month}/${day}/${year}`;
      if (day) return `${month}/${day}`;
      if (month) return `${month}`;
    }
    return cleaned;
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
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
                        <View style={[styles.halfInput, { marginRight: 8 }]}>
                          <Text style={styles.label}>First Name</Text>
                          <View style={styles.inputWrapper}>
                            <TextInput
                              value={formData.firstName}
                              onChangeText={(value) => updateFormData('firstName', value)}
                              placeholder="First name"
                              placeholderTextColor="#E6C547"
                              style={styles.inputField}
                            />
                          </View>
                          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                        </View>
                        
                        <View style={[styles.halfInput, { marginLeft: 8 }]}>
                          <Text style={styles.label}>Last Name</Text>
                          <View style={styles.inputWrapper}>
                            <TextInput
                              value={formData.lastName}
                              onChangeText={(value) => updateFormData('lastName', value)}
                              placeholder="Last name"
                              placeholderTextColor="#E6C547"
                              style={styles.inputField}
                            />
                          </View>
                          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                        </View>
                      </View>

                      {/* Email */}
                      <View style={styles.inputGroup}>
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
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                      </View>

                      {/* Phone Number */}
                      <View style={styles.inputGroup}>
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
                        {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
                      </View>

                      {/* Username */}
                      <View style={styles.inputGroup}>
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
                        {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
                      </View>

                      {/* Birthday */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Birthday</Text>
                        <TouchableOpacity
                          style={styles.inputWrapper}
                          onPress={() => setShowDatePicker(true)}
                        >
                          <TextInput
                            value={formData.birthday}
                            onChangeText={(value) => updateFormData('birthday', formatBirthday(value))}
                            placeholder="MM/DD/YYYY"
                            placeholderTextColor="#E6C547"
                            style={styles.inputField}
                            editable={false}
                          />
                          <Ionicons name="calendar" size={20} color="#E6C547" style={styles.validationIcon} />
                        </TouchableOpacity>
                        {errors.birthday && <Text style={styles.errorText}>{errors.birthday}</Text>}
                      </View>

                      {/* Gender */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            value={formData.gender}
                            onChangeText={(value) => updateFormData('gender', value)}
                            placeholder="Select gender"
                            placeholderTextColor="#E6C547"
                            style={styles.inputField}
                            editable={false}
                          />
                          <Ionicons name="chevron-down" size={20} color="#E6C547" style={styles.validationIcon} />
                        </View>
                        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
                      </View>

                      {/* Sexuality */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Sexuality</Text>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            value={formData.sexuality}
                            onChangeText={(value) => updateFormData('sexuality', value)}
                            placeholder="Select sexuality"
                            placeholderTextColor="#E6C547"
                            style={styles.inputField}
                            editable={false}
                          />
                          <Ionicons name="chevron-down" size={20} color="#E6C547" style={styles.validationIcon} />
                        </View>
                        {errors.sexuality && <Text style={styles.errorText}>{errors.sexuality}</Text>}
                      </View>
                    </View>

                    {/* Password Section */}
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Password</Text>
                      
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[
                          styles.inputWrapper,
                          passwordFocused && styles.inputWrapperFocused
                        ]}>
                          <TextInput
                            value={formData.password}
                            onChangeText={(value) => updateFormData('password', value)}
                            placeholder="Create a password"
                            placeholderTextColor="#E6C547"
                            style={styles.inputField}
                            secureTextEntry
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                          />
                          {getValidationIcon('password') && (
                            <Ionicons
                              name={getValidationIcon('password')}
                              size={20}
                              color={getValidationColor('password')}
                              style={styles.validationIcon}
                            />
                          )}
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={[
                          styles.inputWrapper,
                          confirmPasswordFocused && styles.inputWrapperFocused
                        ]}>
                          <TextInput
                            value={formData.confirmPassword}
                            onChangeText={(value) => updateFormData('confirmPassword', value)}
                            placeholder="Confirm your password"
                            placeholderTextColor="#E6C547"
                            style={styles.inputField}
                            secureTextEntry
                            onFocus={() => setConfirmPasswordFocused(true)}
                            onBlur={() => setConfirmPasswordFocused(false)}
                          />
                          {getValidationIcon('confirmPassword') && (
                            <Ionicons
                              name={getValidationIcon('confirmPassword')}
                              size={20}
                              color={getValidationColor('confirmPassword')}
                              style={styles.validationIcon}
                            />
                          )}
                        </View>
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
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundGradient: {
    flex: 1,
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
    paddingHorizontal: 16,
    position: 'relative',
  },
  inputWrapperFocused: {
    borderColor: '#E6C547',
    borderWidth: 2,
    shadowColor: '#E6C547',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  inputField: {
    fontSize: 16,
    color: '#F5F5DC',
    fontFamily: 'Georgia',
    flex: 1,
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
});

export default AccountCreationScreen;
