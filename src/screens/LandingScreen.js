import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const LandingScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate('Login');
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
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={styles.taglineWrapper}>
                  <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                    Where connections happen over cocktails
                  </Text>
                </View>
              </View>

              {/* Login Button */}
              <View style={styles.loginContainer}>
                <Button
                  title="Find Your Crowd"
                  onPress={handleLogin}
                  style={styles.loginButton}
                />
              </View>

              {/* Features */}
              <View style={styles.features}>
                <View style={styles.feature}>
                  <Ionicons name="paper-plane" size={20} color={colors.accent} style={styles.solidIcon} />
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    Find people at your favorite bars & clubs
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="heart" size={20} color={colors.accent} style={styles.solidIcon} />
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    Connect with like-minded individuals
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="wine" size={20} color={colors.accent} style={styles.solidIcon} />
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    Meet over drinks, not apps
                  </Text>
                </View>
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
    width: width,
    height: height,
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
  logoSection: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 4,
  },
  logo: {
    width: 525,
    height: 225,
    marginBottom: 16,
  },
  taglineWrapper: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 32,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Georgia',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 48,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    alignSelf: 'center',
    width: 200,
  },
  features: {
    width: '100%',
    maxWidth: 400,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  solidIcon: {
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 18,
    fontFamily: 'Georgia',
    flex: 1,
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: 24,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    shadowOpacity: 0.4,
  },
});

export default LandingScreen;
