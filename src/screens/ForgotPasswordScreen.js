import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailExists = async (email) => {
    try {
      const accountsData = await AsyncStorage.getItem('userAccounts');
      console.log('Accounts data:', accountsData);
      if (accountsData) {
        const accounts = JSON.parse(accountsData);
        console.log('Parsed accounts:', accounts);
        console.log('Looking for email:', email);
        const found = accounts.some(account => {
          const storedEmail = account.email ? account.email.toLowerCase().trim() : '';
          const searchEmail = email.toLowerCase().trim();
          console.log('Checking account email:', storedEmail, 'against:', searchEmail);
          return storedEmail === searchEmail;
        });
        console.log('Email found:', found);
        return found;
      }
      return false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    setEmailError('');
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      const emailExists = await checkEmailExists(email);
      
      if (!emailExists) {
        setEmailError('No account found with this email address');
        setLoading(false);
        return;
      }

      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Email Sent! 🚀',
        'We\'ve sent you an email with a link to reset your password. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
              }}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.appTitle}>Over Drinks</Text>
                <View style={styles.wineGlassesContainer}>
                  <Ionicons name="wine" size={24} color="#8B0000" />
                  <View style={styles.dashedLine} />
                  <Ionicons name="wine" size={24} color="#8B0000" />
                </View>
                <Text style={styles.tagline}>
                  Reset your password
                </Text>
              </View>

              {/* Reset Password Container */}
              <View
                style={[
                  styles.resetContainer,
                  styles.resetContainerHovered
                ]}
              >
                <LinearGradient
                  colors={['#000000', '#1a1a1a']}
                  style={styles.containerGradient}
                >
                  <Text style={styles.containerTitle}>
                    Enter your email to reset password
                  </Text>

                  {/* Email Input */}
                  <View style={styles.inputGroup} onTouchStart={(e) => {
                    e.stopPropagation();
                    setEmailFocused(true);
                  }}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={[
                      styles.inputWrapper,
                      emailFocused && styles.inputWrapperFocused
                    ]}>
                      <TextInput
                        value={email}
                        onChangeText={handleEmailChange}
                        placeholder="Enter your email"
                        placeholderTextColor="#E6C547"
                        style={styles.inputField}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                    </View>
                    {emailError ? (
                      <Text style={styles.errorText}>{emailError}</Text>
                    ) : null}
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      loading && styles.submitButtonDisabled
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#E6C547', '#D4AF37', '#B8860B']}
                      style={styles.submitButtonGradient}
                    >
                      <Text style={styles.submitButtonText}>
                        {loading ? 'Sending...' : 'Send Reset Email'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Debug Button */}
                  <TouchableOpacity
                    style={styles.debugButton}
                    onPress={async () => {
                      try {
                        const accountsData = await AsyncStorage.getItem('userAccounts');
                        let debugInfo = '=== DEBUG INFO ===\n';
                        debugInfo += `Raw accounts data: ${accountsData}\n\n`;
                        
                        if (accountsData) {
                          const accounts = JSON.parse(accountsData);
                          debugInfo += `Parsed accounts array: ${JSON.stringify(accounts, null, 2)}\n\n`;
                          debugInfo += `Number of accounts: ${accounts.length}\n\n`;
                          accounts.forEach((account, index) => {
                            debugInfo += `Account ${index}: ${JSON.stringify(account, null, 2)}\n\n`;
                          });
                        } else {
                          debugInfo += 'No accounts data found in AsyncStorage\n\n';
                        }
                        debugInfo += `Current email being searched: "${email}"\n`;
                        debugInfo += '==================';
                        
                        Alert.alert('Debug Info', debugInfo, [{ text: 'OK' }]);
                      } catch (error) {
                        Alert.alert('Debug Error', `Error: ${error.message}`, [{ text: 'OK' }]);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.debugButtonText}>
                      Debug: Check Accounts
                    </Text>
                  </TouchableOpacity>

                  {/* Back to Login */}
                  <TouchableOpacity
                    style={styles.backToLoginContainer}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.backToLoginText}>
                      Back to Login
                    </Text>
                  </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
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
  resetContainer: {
    width: '100%',
    maxWidth: 400,
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
  resetContainerHovered: {
    shadowColor: '#E6C547',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
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
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  submitButton: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#000000',
    fontWeight: 'bold',
  },
  backToLoginContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#E6C547',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  debugButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 16,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default ForgotPasswordScreen;
