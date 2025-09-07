import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width, height } = Dimensions.get('window');

const LandingScreen = () => {
  const { colors } = useTheme();
  const { login } = useAuth();

  const handleLogin = () => {
    // For demo purposes, we'll simulate a login
    // In a real app, you'd integrate with your auth provider
    const mockToken = 'mock-auth-token-' + Date.now();
    login(mockToken);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1566417109768-bbd36fc89c11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080',
        }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Text style={[styles.title, { color: colors.secondary }]}>
                  Over Drinks
                </Text>
                <View style={styles.iconRow}>
                  <Text style={[styles.icon, { color: colors.secondary }]}>🍷</Text>
                  <Text style={[styles.icon, { color: colors.accent, fontSize: 32 }]}>🍸</Text>
                  <Text style={[styles.icon, { color: colors.secondary }]}>🍷</Text>
                </View>
                <Text style={[styles.tagline, { color: colors.textSecondary }]}>
                  Where connections happen over cocktails
                </Text>
              </View>

              {/* Login Card */}
              <Card style={styles.loginCard}>
                <View style={styles.loginContent}>
                  <Text style={[styles.welcomeTitle, { color: colors.text }]}>
                    Welcome to the Speakeasy
                  </Text>
                  <Text style={[styles.welcomeDescription, { color: colors.textSecondary }]}>
                    Join an exclusive community of sophisticated singles who appreciate the finer things in life.
                  </Text>
                  <Button
                    title="Enter the Speakeasy"
                    onPress={handleLogin}
                    style={styles.loginButton}
                  />
                </View>
              </Card>

              {/* Features */}
              <View style={styles.features}>
                <View style={styles.feature}>
                  <Text style={[styles.featureIcon, { color: colors.accent }]}>📍</Text>
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    Find people at your favorite bars & clubs
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Text style={[styles.featureIcon, { color: colors.accent }]}>❤️</Text>
                  <Text style={[styles.featureText, { color: colors.textSecondary }]}>
                    Connect with like-minded individuals
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Text style={[styles.featureIcon, { color: colors.accent }]}>🍹</Text>
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
    marginBottom: 48,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
  },
  loginCard: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 48,
  },
  loginContent: {
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
    width: '100%',
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
  featureText: {
    fontSize: 16,
    flex: 1,
  },
});

export default LandingScreen;
