import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import TextArea from '../components/ui/TextArea';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const interests = [
  // Nightlife & Entertainment
  { value: 'jazz', label: '🎷 Jazz Music', emoji: '🎷' },
  { value: 'cocktails', label: '🍸 Cocktails', emoji: '🍸' },
  { value: 'dancing', label: '💃 Dancing', emoji: '💃' },
  { value: 'wine', label: '🍷 Wine', emoji: '🍷' },
  { value: 'live-music', label: '🎵 Live Music', emoji: '🎵' },
  { value: 'whiskey', label: '🥃 Whiskey', emoji: '🥃' },
  { value: 'karaoke', label: '🎤 Karaoke', emoji: '🎤' },
  { value: 'clubbing', label: '🕺 Clubbing', emoji: '🕺' },
  { value: 'concerts', label: '🎸 Concerts', emoji: '🎸' },
  { value: 'comedy', label: '😂 Comedy', emoji: '😂' },
  { value: 'trivia', label: '🧠 Trivia', emoji: '🧠' },
  
  // Arts & Culture
  { value: 'art', label: '🎨 Art', emoji: '🎨' },
  { value: 'literature', label: '📚 Literature', emoji: '📚' },
  { value: 'museums', label: '🏛️ Museums', emoji: '🏛️' },
  { value: 'theater', label: '🎭 Theater', emoji: '🎭' },
  { value: 'photography', label: '📷 Photography', emoji: '📷' },
  { value: 'writing', label: '✍️ Writing', emoji: '✍️' },
  { value: 'poetry', label: '📝 Poetry', emoji: '📝' },
  { value: 'film', label: '🎬 Film & Movies', emoji: '🎬' },
  { value: 'vintage', label: '⏰ Vintage', emoji: '⏰' },
  
  // Food & Drink
  { value: 'cooking', label: '👨‍🍳 Cooking', emoji: '👨‍🍳' },
  { value: 'fine-dining', label: '🍽️ Fine Dining', emoji: '🍽️' },
  { value: 'coffee', label: '☕ Coffee', emoji: '☕' },
  { value: 'craft-beer', label: '🍺 Craft Beer', emoji: '🍺' },
  { value: 'wine-tasting', label: '🍷 Wine Tasting', emoji: '🍷' },
  { value: 'mixology', label: '🍹 Mixology', emoji: '🍹' },
  { value: 'food-tours', label: '🍕 Food Tours', emoji: '🍕' },
  { value: 'brunch', label: '🥞 Brunch', emoji: '🥞' },
  
  // Social & Activities
  { value: 'networking', label: '🤝 Networking', emoji: '🤝' },
  { value: 'book-clubs', label: '📖 Book Clubs', emoji: '📖' },
  { value: 'language-exchange', label: '🗣️ Language Exchange', emoji: '🗣️' },
  { value: 'board-games', label: '🎲 Board Games', emoji: '🎲' },
  { value: 'poker', label: '🃏 Poker', emoji: '🃏' },
  { value: 'pool', label: '🎱 Pool', emoji: '🎱' },
  { value: 'darts', label: '🎯 Darts', emoji: '🎯' },
  { value: 'arcade', label: '🕹️ Arcade Games', emoji: '🕹️' },
  
  // Sports & Fitness
  { value: 'yoga', label: '🧘 Yoga', emoji: '🧘' },
  { value: 'gym', label: '💪 Gym', emoji: '💪' },
  { value: 'running', label: '🏃 Running', emoji: '🏃' },
  { value: 'cycling', label: '🚴 Cycling', emoji: '🚴' },
  { value: 'hiking', label: '🥾 Hiking', emoji: '🥾' },
  { value: 'tennis', label: '🎾 Tennis', emoji: '🎾' },
  { value: 'golf', label: '⛳ Golf', emoji: '⛳' },
  { value: 'swimming', label: '🏊 Swimming', emoji: '🏊' },
  
  // Travel & Adventure
  { value: 'travel', label: '✈️ Travel', emoji: '✈️' },
  { value: 'adventure', label: '🏔️ Adventure', emoji: '🏔️' },
  { value: 'backpacking', label: '🎒 Backpacking', emoji: '🎒' },
  { value: 'road-trips', label: '🚗 Road Trips', emoji: '🚗' },
  { value: 'cruises', label: '🚢 Cruises', emoji: '🚢' },
  { value: 'camping', label: '⛺ Camping', emoji: '⛺' },
  
  // Tech & Gaming
  { value: 'gaming', label: '🎮 Gaming', emoji: '🎮' },
  { value: 'tech', label: '💻 Technology', emoji: '💻' },
  { value: 'crypto', label: '₿ Crypto', emoji: '₿' },
  { value: 'ai', label: '🤖 AI & Machine Learning', emoji: '🤖' },
  { value: 'vr', label: '🥽 VR/AR', emoji: '🥽' },
  
  // Lifestyle
  { value: 'fashion', label: '👗 Fashion', emoji: '👗' },
  { value: 'beauty', label: '💄 Beauty', emoji: '💄' },
  { value: 'wellness', label: '🌿 Wellness', emoji: '🌿' },
  { value: 'meditation', label: '🧘‍♀️ Meditation', emoji: '🧘‍♀️' },
  { value: 'sustainability', label: '🌱 Sustainability', emoji: '🌱' },
  { value: 'minimalism', label: '🏠 Minimalism', emoji: '🏠' },
];

const ProfileCreationScreen = () => {
  const { colors } = useTheme();
  const { user, markProfileCompleted } = useAuth();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    bio: '',
    profilePhotoUrl: '',
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  
  // New state for search and image picker
  const [searchQuery, setSearchQuery] = useState('');
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    photo: false,
    bio: false,
    interests: false
  });

  // Check if user already has a profile
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem(`profile_${user?.id}`);
        if (profileData) {
          const profile = JSON.parse(profileData);
          setExistingProfile(profile);
          setFormData({
            bio: profile.bio || '',
            profilePhotoUrl: profile.profilePhotoUrl || '',
          });
          setSelectedInterests(profile.interests || []);
          setProfilePhoto(profile.profilePhotoUrl || '');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    if (user?.id) {
      loadExistingProfile();
    }
  }, [user?.id]);

  const saveProfile = async (profileData) => {
    try {
      const profileKey = `profile_${user.id}`;
      await AsyncStorage.setItem(profileKey, JSON.stringify(profileData));
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  // Filter interests based on search query
  const filteredInterests = interests.filter(interest =>
    interest.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interest.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImagePicker = async () => {
    setShowImagePickerModal(true);
  };

  const handleCameraCapture = async () => {
    setShowImagePickerModal(false);
    
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
      setFormData(prev => ({ ...prev, profilePhotoUrl: result.assets[0].uri }));
      setValidationErrors(prev => ({ ...prev, photo: false }));
    }
  };

  const handleCameraRollSelection = async () => {
    setShowImagePickerModal(false);
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
      setFormData(prev => ({ ...prev, profilePhotoUrl: result.assets[0].uri }));
      setValidationErrors(prev => ({ ...prev, photo: false }));
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else if (prev.length < 5) {
        return [...prev, interest];
      }
      return prev;
    });
    
    // Clear validation error when interests are selected
    if (selectedInterests.length >= 4) {
      setValidationErrors(prev => ({ ...prev, interests: false }));
    }
  };

  const handleBioChange = (text) => {
    setFormData(prev => ({ ...prev, bio: text }));
    if (text.trim().length > 0) {
      setValidationErrors(prev => ({ ...prev, bio: false }));
    }
  };

  const handleSubmit = async () => {
    // Validate all required fields
    const missingFields = [];
    const newValidationErrors = {
      photo: false,
      bio: false,
      interests: false
    };
    
    if (!profilePhoto || !formData.profilePhotoUrl) {
      missingFields.push('profile photo');
      newValidationErrors.photo = true;
    }
    
    if (!formData.bio || formData.bio.trim().length === 0) {
      missingFields.push('bio');
      newValidationErrors.bio = true;
    }
    
    if (selectedInterests.length === 0) {
      missingFields.push('interests');
      newValidationErrors.interests = true;
    } else if (selectedInterests.length < 5) {
      missingFields.push(`${5 - selectedInterests.length} more interest${5 - selectedInterests.length === 1 ? '' : 's'}`);
      newValidationErrors.interests = true;
    }
    
    setValidationErrors(newValidationErrors);
    
    if (missingFields.length > 0) {
      const missingText = missingFields.join(', ');
      Alert.alert(
        'Profile Incomplete', 
        `Please complete your profile by adding:\n\n• ${missingText}\n\nYou need all three elements to continue: a profile photo, bio, and exactly 5 interests.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        ...formData,
        interests: selectedInterests,
        // Include account information from user context
        username: user?.username,
        phoneNumber: user?.phoneNumber,
        birthday: user?.birthday,
        gender: user?.gender,
        sexualOrientation: user?.sexuality,
        userId: user?.id,
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await saveProfile(profileData);
      
      if (success) {
        // Mark profile as completed
        markProfileCompleted();
        
        // Navigate directly to venue discovery screen without popup
        navigation.navigate('VenueDiscovery');
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {existingProfile ? 'Updating profile...' : 'Creating profile...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.secondary }]}>
              {existingProfile ? 'Update Your Profile' : 'Complete Your Profile'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Add your photo, interests, and bio to get started
            </Text>
          </View>

          <Card style={styles.formCard}>
            {/* Photo Upload */}
            <View style={styles.photoSection}>
              <TouchableOpacity
                style={[
                  styles.photoContainer, 
                  { 
                    borderColor: validationErrors.photo ? '#ef4444' : colors.border,
                    borderWidth: validationErrors.photo ? 2 : 2
                  }
                ]}
                onPress={handleImagePicker}
              >
                {profilePhoto ? (
                  <Image source={{ uri: profilePhoto }} style={styles.photo} />
                ) : (
                  <Text style={[styles.photoPlaceholder, { color: colors.textSecondary }]}>
                    📷
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addPhotoButton, { backgroundColor: colors.secondary }]}
                onPress={handleImagePicker}
              >
                <Text style={[styles.addPhotoText, { color: colors.primaryForeground }]}>
                  +
                </Text>
              </TouchableOpacity>
              <Text style={[
                styles.photoInstruction, 
                { 
                  color: validationErrors.photo ? '#ef4444' : colors.textSecondary,
                  fontWeight: validationErrors.photo ? '600' : '400'
                }
              ]}>
                {validationErrors.photo ? '⚠️ Profile photo required' : 'Tap to add your best photo'}
              </Text>
            </View>

            {/* Bio */}
            <View style={styles.inputContainer}>
              <Text style={[
                styles.label, 
                { 
                  color: validationErrors.bio ? '#ef4444' : colors.text,
                  fontWeight: validationErrors.bio ? '600' : '600'
                }
              ]}>
                Bio {validationErrors.bio && '⚠️'}
              </Text>
              <TextArea
                placeholder="Tell us about yourself... What makes you unique? What are you looking for?"
                value={formData.bio}
                onChangeText={handleBioChange}
                style={[
                  styles.bioInput,
                  validationErrors.bio && { borderColor: '#ef4444', borderWidth: 1 }
                ]}
                maxLength={500}
              />
              <Text style={[
                styles.characterCount, 
                { 
                  color: validationErrors.bio ? '#ef4444' : colors.textSecondary,
                  fontWeight: validationErrors.bio ? '600' : '400'
                }
              ]}>
                {validationErrors.bio ? 'Bio is required' : `${formData.bio.length}/500`}
              </Text>
            </View>

            {/* Interests */}
            <View style={styles.interestsSection}>
              <Text style={[
                styles.label, 
                { 
                  color: validationErrors.interests ? '#ef4444' : colors.text,
                  fontWeight: validationErrors.interests ? '600' : '600'
                }
              ]}>
                Select Your Interests ({selectedInterests.length}/5) {validationErrors.interests && '⚠️'}
              </Text>
              <Text style={[
                styles.interestsSubtext, 
                { 
                  color: validationErrors.interests ? '#ef4444' : colors.textSecondary,
                  fontWeight: validationErrors.interests ? '600' : '400'
                }
              ]}>
                {validationErrors.interests 
                  ? `Please select exactly 5 interests (${5 - selectedInterests.length} more needed)`
                  : 'Choose exactly 5 interests that represent you'
                }
              </Text>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Search interests..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.interestsGrid}>
                {filteredInterests.map((interest) => (
                  <TouchableOpacity
                    key={interest.value}
                    style={[
                      styles.interestChip,
                      {
                        backgroundColor: selectedInterests.includes(interest.value)
                          ? colors.primary
                          : (!selectedInterests.includes(interest.value) && selectedInterests.length >= 5)
                          ? colors.muted
                          : colors.muted,
                        borderColor: colors.border,
                        opacity: (!selectedInterests.includes(interest.value) && selectedInterests.length >= 5) ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => toggleInterest(interest.value)}
                    disabled={!selectedInterests.includes(interest.value) && selectedInterests.length >= 5}
                  >
                    <Text
                      style={[
                        styles.interestText,
                        {
                          color: selectedInterests.includes(interest.value)
                            ? colors.primaryForeground
                            : colors.text,
                        },
                      ]}
                    >
                      {interest.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E6C547', '#D4AF37', '#B8860B']}
                style={styles.submitButtonGradient}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading 
                    ? (existingProfile ? 'Updating Profile...' : 'Creating Profile...')
                    : (profilePhoto && formData.bio.trim() && selectedInterests.length === 5
                        ? (existingProfile ? 'Update Profile ✓' : 'Complete Profile ✓')
                        : (existingProfile ? 'Update Profile' : 'Complete Profile')
                      )
                  }
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
      
      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose Photo Source
            </Text>
            
            <TouchableOpacity
              style={[styles.modalOption, { borderColor: colors.border }]}
              onPress={handleCameraCapture}
            >
              <Ionicons name="camera" size={24} color={colors.primary} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                Take Photo
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalOption, { borderColor: colors.border }]}
              onPress={handleCameraRollSelection}
            >
              <Ionicons name="images" size={24} color={colors.primary} />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.muted }]}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  formCard: {
    padding: 24,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  photo: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  photoPlaceholder: {
    fontSize: 48,
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoInstruction: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  interestsSection: {
    marginBottom: 32,
  },
  interestsSubtext: {
    fontSize: 14,
    marginBottom: 16,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    width: '100%',
    marginTop: 24,
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
  // Search bar styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
    paddingVertical: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginLeft: 12,
    fontWeight: '500',
  },
  modalButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
});

export default ProfileCreationScreen;