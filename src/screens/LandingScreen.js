import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const LandingScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [sound, setSound] = useState(null);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  
  const fullText = "Where connections happen over cocktails...";
  const typingSpeed = 100; // milliseconds per character

  // Load typing sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const typingSound = await Audio.createAsync(
          { uri: 'https://www.soundjay.com/misc/sounds/typewriter-key-1.wav' },
          { shouldPlay: false, isLooping: false }
        );
        setSound(typingSound);
      } catch (error) {
        console.log('Could not load typing sound:', error);
      }
    };
    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Play typing sound
  const playTypingSound = async () => {
    try {
      if (sound) {
        await sound.replayAsync();
      }
    } catch (error) {
      console.log('Could not play typing sound:', error);
    }
  };

  // Play haptic feedback
  const playHapticFeedback = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Could not play haptic feedback:', error);
    }
  };

  // Restart animation when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset animation state
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTypingComplete(false);
      
      let timeoutId;
      let currentCharIndex = 0;
      
      // Typewriter effect
      const typeNextChar = () => {
        if (currentCharIndex < fullText.length) {
          setDisplayedText(fullText.substring(0, currentCharIndex + 1));
          setCurrentIndex(currentCharIndex + 1);
          currentCharIndex++;
          
          // Play sound and haptic feedback for each character
          playTypingSound();
          playHapticFeedback();
          
          timeoutId = setTimeout(typeNextChar, typingSpeed);
        } else {
          // Typing is complete
          setIsTypingComplete(true);
        }
      };
      
      // Start typing animation
      timeoutId = setTimeout(typeNextChar, typingSpeed);
      
      // Cleanup function
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [])
  );

  const handleLogin = async () => {
    console.log('Button pressed!');
    // Add haptic feedback for button press
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Could not play haptic feedback:', error);
    }
    navigation.navigate('Login');
  };

  const handleButtonPressIn = () => {
    setIsButtonPressed(true);
  };

  const handleButtonPressOut = () => {
    setIsButtonPressed(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={require('../../assets/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={2}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)', 'rgba(0,0,0,0.7)']}
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
                  <Text style={[styles.tagline, { color: '#ffffff' }]}>
                    {displayedText}
                    {!isTypingComplete && <Text style={styles.cursor}>|</Text>}
                  </Text>
                </View>
              </View>

              {/* Login Button */}
              <View style={styles.loginContainer}>
                <TouchableOpacity
                  onPress={handleLogin}
                  onPressIn={handleButtonPressIn}
                  onPressOut={handleButtonPressOut}
                  style={[
                    styles.loginButton, 
                    styles.testButton,
                    isButtonPressed && styles.buttonPressed
                  ]}
                  activeOpacity={0.9}
                >
                  <Text style={[
                    styles.buttonText,
                    isButtonPressed && styles.buttonTextPressed
                  ]}>Find Your Crowd</Text>
                </TouchableOpacity>
              </View>

              {/* Features */}
              <View style={styles.features}>
                <View style={styles.feature}>
                  <Ionicons name="paper-plane" size={20} color={colors.accent} style={styles.solidIcon} />
                  <Text style={[styles.featureText, { color: '#ffffff' }]}>
                    Find people at your favorite bars & clubs
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="heart" size={20} color={colors.accent} style={styles.solidIcon} />
                  <Text style={[styles.featureText, { color: '#ffffff' }]}>
                    Connect with like-minded individuals
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="wine" size={20} color={colors.accent} style={styles.solidIcon} />
                  <Text style={[styles.featureText, { color: '#ffffff' }]}>
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
    marginBottom: 32,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Times New Roman',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.2,
    fontStyle: 'italic',
  },
  cursor: {
    color: '#D4AF37',
    fontWeight: 'bold',
    opacity: 1,
    fontFamily: 'Times New Roman',
    fontSize: 18,
    letterSpacing: 0.2,
    fontStyle: 'italic',
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
    width: '80%',
    minWidth: 200,
    minHeight: 50,
  },
  testButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    // 3D gradient effect
    borderWidth: 2,
    borderColor: '#F4E4BC',
    // Inner shadow effect
    borderTopWidth: 3,
    borderTopColor: '#F7E8C1',
    borderLeftWidth: 2,
    borderLeftColor: '#F7E8C1',
    borderRightWidth: 1,
    borderRightColor: '#B8941F',
    borderBottomWidth: 1,
    borderBottomColor: '#B8941F',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  buttonPressed: {
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // Inverted 3D effect when pressed
    borderTopWidth: 1,
    borderTopColor: '#B8941F',
    borderLeftWidth: 1,
    borderLeftColor: '#B8941F',
    borderRightWidth: 2,
    borderRightColor: '#F7E8C1',
    borderBottomWidth: 2,
    borderBottomColor: '#F7E8C1',
    transform: [{ scale: 0.98 }],
  },
  buttonTextPressed: {
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    lineHeight: 24,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.6,
  },
});

export default LandingScreen;
