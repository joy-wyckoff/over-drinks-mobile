import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Dimensions,
  Alert,
  TouchableOpacity,
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
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      await login(username, password, rememberMe);
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
    Alert.alert(
      'Forgot Password',
      'Password reset functionality would be implemented here. For now, please contact support.',
      [{ text: 'OK' }]
    );
  };

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
                  Welcome Back
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Sign in to continue your journey
                </Text>
              </View>

              {/* Login Form */}
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Username
                  </Text>
                  <Input
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Enter your username"
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    Password
                  </Text>
                  <Input
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>

                {/* Remember Me Checkbox */}
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[
                    styles.checkbox,
                    {
                      backgroundColor: rememberMe ? colors.primary : 'transparent',
                      borderColor: rememberMe ? colors.primary : colors.border,
                    }
                  ]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={16} color={colors.primaryForeground} />
                    )}
                  </View>
                  <Text style={[styles.rememberMeText, { color: colors.text }]}>
                    Remember me
                  </Text>
                </TouchableOpacity>

                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  style={styles.loginButton}
                />

                {/* Forgot Password */}
                <Button
                  title="Forgot Password?"
                  onPress={handleForgotPassword}
                  variant="ghost"
                  style={styles.forgotButton}
                />
              </View>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                  Don't have an account?
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              {/* Create Account */}
              <Button
                title="Create New Account"
                onPress={handleCreateAccount}
                variant="secondary"
                style={styles.createButton}
              />
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
    width: '100%',
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
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    width: '100%',
    marginBottom: 16,
  },
  forgotButton: {
    alignSelf: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
    width: '100%',
    maxWidth: 400,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  createButton: {
    width: '100%',
    maxWidth: 400,
  },
});

export default LoginScreen;
