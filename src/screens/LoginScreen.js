import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [containerHovered, setContainerHovered] = useState(false);
  const [containerTouched, setContainerTouched] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [createAccountPressed, setCreateAccountPressed] = useState(false);
  const [enterButtonHovered, setEnterButtonHovered] = useState(false);
  const [createAccountHovered, setCreateAccountHovered] = useState(false);
  const [forgotPasswordHovered, setForgotPasswordHovered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      await login(username, password, false);
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate('AccountCreation');
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
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
          >
            {/* Header */}
            <View style={styles.header}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.navigate('Landing')}
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
                Where connections happen face to face
              </Text>
            </View>

            {/* Login Container */}
            <View
              style={[
                styles.loginContainerWrapper,
                (containerHovered || containerTouched) && styles.loginContainerWrapperHovered
              ]}
            >
              <View
                style={[
                  styles.loginContainer,
                  (containerHovered || containerTouched) && styles.loginContainerHovered
                ]}
                onMouseEnter={() => setContainerHovered(true)}
                onMouseLeave={() => setContainerHovered(false)}
              >
              <LinearGradient
                colors={['#000000', '#1a1a1a']}
                style={styles.containerGradient}
              >
                <Text style={styles.containerTitle}>
                  Sign in to discover tonight's connections
                </Text>

                {/* Username Input */}
                <View style={styles.inputGroup} onTouchStart={(e) => {
                  e.stopPropagation();
                  setUsernameFocused(true);
                }}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <View style={[
                    styles.inputWrapper,
                    usernameFocused && styles.inputWrapperFocused
                  ]}>
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      placeholder="Enter your username"
                      placeholderTextColor="#E6C547"
                      style={styles.inputField}
                      autoCapitalize="none"
                      keyboardType="default"
                      onFocus={() => setUsernameFocused(true)}
                      onBlur={() => setUsernameFocused(false)}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup} onTouchStart={(e) => {
                  e.stopPropagation();
                  setPasswordFocused(true);
                }}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={[
                    styles.inputWrapper,
                    passwordFocused && styles.inputWrapperFocused
                  ]}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#E6C547"
                      style={styles.inputField}
                      secureTextEntry={!showPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="#E6C547" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Enter Button */}
                <TouchableOpacity
                  style={[
                    styles.enterButton,
                    enterButtonHovered && styles.enterButtonHovered
                  ]}
                  onPressIn={(e) => {
                    e.stopPropagation();
                    setEnterButtonHovered(true);
                    setContainerTouched(true);
                  }}
                  onPressOut={() => setEnterButtonHovered(false)}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                      colors={['#E6C547', '#D4AF37', '#B8860B']}
                    style={styles.enterButtonGradient}
                  >
                    <Text style={styles.enterButtonText}>Enter</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Create Account Button */}
                <TouchableOpacity
                  style={[
                    styles.createAccountButton,
                    createAccountHovered && styles.createAccountButtonHovered,
                    createAccountPressed && styles.createAccountButtonPressed
                  ]}
                  onPressIn={(e) => {
                    e.stopPropagation();
                    setCreateAccountHovered(true);
                    setCreateAccountPressed(true);
                    setContainerTouched(true);
                  }}
                  onPressOut={() => {
                    setCreateAccountHovered(false);
                    setCreateAccountPressed(false);
                  }}
                  onPress={handleCreateAccount}
                  activeOpacity={1.0}
                >
                  <Text style={[
                    styles.createAccountButtonText,
                    createAccountHovered && styles.createAccountButtonTextHovered,
                    createAccountPressed && styles.createAccountButtonTextPressed
                  ]}>Create Account</Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPressIn={(e) => {
                    e.stopPropagation();
                    setForgotPasswordHovered(true);
                    setContainerTouched(true);
                  }}
                  onPressOut={() => setForgotPasswordHovered(false)}
                  onPress={handleForgotPassword}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.forgotPasswordText,
                    forgotPasswordHovered && styles.forgotPasswordTextHovered
                  ]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0D0F', // Set the darkest gradient color as background
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
    paddingBottom: 200, // Extra padding to prevent screen cut off when scrolling
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
    paddingHorizontal: 24,
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
  loginContainerWrapper: {
    width: '100%',
    maxWidth: 400,
    shadowColor: '#E6C547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  loginContainerWrapperHovered: {
    shadowColor: '#E6C547',
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 30,
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6C547',
    overflow: 'hidden',
    shadowColor: '#E6C547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 25,
    elevation: 25,
  },
  loginContainerHovered: {
    transform: [{ scale: 1.02 }],
    borderWidth: 1,
    borderColor: '#E6C547',
    shadowColor: '#E6C547',
    shadowOpacity: 1.0,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    elevation: 40,
  },
  containerGradient: {
    padding: 32,
  },
  containerTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    color: '#E6C547',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputGroup: {
    marginBottom: 24,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  inputPlaceholder: {
    fontSize: 16,
    color: '#E6C547',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  inputField: {
    fontSize: 16,
    color: '#F5F5DC',
    fontFamily: 'Georgia',
    flex: 1,
  },
  passwordToggle: {
    padding: 4,
    marginLeft: 8,
  },
  enterButton: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  enterButtonHovered: {
    transform: [{ scale: 1.05 }],
  },
  enterButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterButtonText: {
    fontSize: 18,
    fontFamily: 'Georgia',
    color: '#000000',
    fontWeight: 'bold',
  },
  createAccountButton: {
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountButtonHovered: {
    backgroundColor: '#E6C547',
    borderColor: '#E6C547',
  },
  createAccountButtonPressed: {
    backgroundColor: '#E6C547',
    borderColor: '#E6C547',
  },
  createAccountButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAccountButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#E6C547',
    fontWeight: '600',
  },
  createAccountButtonTextHovered: {
    color: '#000000',
  },
  createAccountButtonTextPressed: {
    color: '#000000',
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#E6C547',
    textDecorationLine: 'underline',
  },
  forgotPasswordTextHovered: {
    color: '#F5F5DC',
    fontSize: 15,
  },
});

export default LoginScreen;
