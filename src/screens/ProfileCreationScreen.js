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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

// Interests data
const interests = [
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
  { value: 'art', label: '🎨 Art', emoji: '🎨' },
  { value: 'literature', label: '📚 Literature', emoji: '📚' },
  { value: 'museums', label: '🏛️ Museums', emoji: '🏛️' },
  { value: 'theater', label: '🎭 Theater', emoji: '🎭' },
  { value: 'photography', label: '📷 Photography', emoji: '📷' },
  { value: 'writing', label: '✍️ Writing', emoji: '✍️' },
  { value: 'poetry', label: '📝 Poetry', emoji: '📝' },
  { value: 'film', label: '🎬 Film & Movies', emoji: '🎬' },
  { value: 'vintage', label: '⏰ Vintage', emoji: '⏰' },
];

// Profile fields data (same as ProfileEditScreen)
const profileFields = {
  pronouns: [
    { value: 'she/her', label: 'She/Her' },
    { value: 'he/him', label: 'He/Him' },
    { value: 'they/them', label: 'They/Them' },
    { value: 'she/they', label: 'She/They' },
    { value: 'he/they', label: 'He/They' },
    { value: 'other', label: 'Other' },
  ],
  ethnicity: [
    { value: 'asian', label: 'Asian' },
    { value: 'black', label: 'Black/African American' },
    { value: 'hispanic', label: 'Hispanic/Latino' },
    { value: 'white', label: 'White/Caucasian' },
    { value: 'native-american', label: 'Native American' },
    { value: 'pacific-islander', label: 'Pacific Islander' },
    { value: 'middle-eastern', label: 'Middle Eastern' },
    { value: 'mixed', label: 'Mixed Race' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],
  height: [
    { value: '4\'6"', label: '4\'6"' },
    { value: '4\'7"', label: '4\'7"' },
    { value: '4\'8"', label: '4\'8"' },
    { value: '4\'9"', label: '4\'9"' },
    { value: '4\'10"', label: '4\'10"' },
    { value: '4\'11"', label: '4\'11"' },
    { value: '5\'0"', label: '5\'0"' },
    { value: '5\'1"', label: '5\'1"' },
    { value: '5\'2"', label: '5\'2"' },
    { value: '5\'3"', label: '5\'3"' },
    { value: '5\'4"', label: '5\'4"' },
    { value: '5\'5"', label: '5\'5"' },
    { value: '5\'6"', label: '5\'6"' },
    { value: '5\'7"', label: '5\'7"' },
    { value: '5\'8"', label: '5\'8"' },
    { value: '5\'9"', label: '5\'9"' },
    { value: '5\'10"', label: '5\'10"' },
    { value: '5\'11"', label: '5\'11"' },
    { value: '6\'0"', label: '6\'0"' },
    { value: '6\'1"', label: '6\'1"' },
    { value: '6\'2"', label: '6\'2"' },
    { value: '6\'3"', label: '6\'3"' },
    { value: '6\'4"', label: '6\'4"' },
    { value: '6\'5"', label: '6\'5"' },
    { value: '6\'6"', label: '6\'6"' },
  ],
  exercise: [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'daily', label: 'Daily' },
  ],
  drinking: [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'socially', label: 'Socially' },
  ],
  smoking: [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'socially', label: 'Socially' },
  ],
  lookingFor: [
    { value: 'casual-dating', label: 'Casual Dating' },
    { value: 'serious-relationship', label: 'Serious Relationship' },
    { value: 'friendship', label: 'Friendship' },
    { value: 'marriage', label: 'Marriage' },
    { value: 'something-casual', label: 'Something Casual' },
    { value: 'not-sure', label: 'Not Sure' },
  ],
  familyPlans: [
    { value: 'want-kids', label: 'Want Kids' },
    { value: 'dont-want-kids', label: 'Don\'t Want Kids' },
    { value: 'have-kids', label: 'Have Kids' },
    { value: 'have-kids-want-more', label: 'Have Kids & Want More' },
    { value: 'not-sure', label: 'Not Sure' },
  ],
  religion: [
    { value: 'agnostic', label: 'Agnostic' },
    { value: 'atheist', label: 'Atheist' },
    { value: 'buddhist', label: 'Buddhist' },
    { value: 'catholic', label: 'Catholic' },
    { value: 'christian', label: 'Christian' },
    { value: 'hindu', label: 'Hindu' },
    { value: 'jewish', label: 'Jewish' },
    { value: 'muslim', label: 'Muslim' },
    { value: 'spiritual', label: 'Spiritual' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],
  politics: [
    { value: 'liberal', label: 'Liberal' },
    { value: 'conservative', label: 'Conservative' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'progressive', label: 'Progressive' },
    { value: 'libertarian', label: 'Libertarian' },
    { value: 'apolitical', label: 'Apolitical' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],
  languages: [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'russian', label: 'Russian' },
    { value: 'other', label: 'Other' },
  ],
  causesAndCommunities: [
    { value: 'blm', label: 'Black Lives Matter' },
    { value: 'environmentalism', label: 'Environmentalism' },
    { value: 'lgbtq-rights', label: 'LGBTQ+ Rights' },
    { value: 'womens-rights', label: 'Women\'s Rights' },
    { value: 'mental-health', label: 'Mental Health Awareness' },
    { value: 'animal-rights', label: 'Animal Rights' },
    { value: 'disability-rights', label: 'Disability Rights' },
    { value: 'immigration', label: 'Immigration Rights' },
    { value: 'education', label: 'Education Access' },
    { value: 'healthcare', label: 'Healthcare Access' },
    { value: 'homelessness', label: 'Homelessness' },
    { value: 'veterans', label: 'Veterans Support' },
    { value: 'local-community', label: 'Local Community' },
    { value: 'volunteering', label: 'Volunteering' },
  ],
  qualities: [
    { value: 'empathy', label: 'Empathy' },
    { value: 'humor', label: 'Humor' },
    { value: 'honesty', label: 'Honesty' },
    { value: 'loyalty', label: 'Loyalty' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'creativity', label: 'Creativity' },
    { value: 'intelligence', label: 'Intelligence' },
    { value: 'kindness', label: 'Kindness' },
    { value: 'ambition', label: 'Ambition' },
    { value: 'patience', label: 'Patience' },
    { value: 'passion', label: 'Passion' },
    { value: 'independence', label: 'Independence' },
    { value: 'openness', label: 'Openness' },
    { value: 'confidence', label: 'Confidence' },
    { value: 'compassion', label: 'Compassion' },
  ],
};

const ProfileCreationScreen = () => {
  const { colors } = useTheme();
  const { user, markProfileCompleted } = useAuth();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    bio: '',
    profilePhotoUrl: '',
    work: '',
    education: '',
    pronouns: '',
    ethnicity: '',
    hometown: '',
    height: '',
    exercise: '',
    drinking: '',
    smoking: '',
    lookingFor: '',
    familyPlans: '',
    religion: '',
    politics: '',
    languages: [],
    causesAndCommunities: [],
    qualities: [],
    additionalPhotos: [],
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showInterests, setShowInterests] = useState(false);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);

  // Load existing profile
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

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setProfilePhoto(imageUri);
        setFormData(prev => ({ ...prev, profilePhotoUrl: imageUri }));
        setValidationErrors(prev => ({ ...prev, photo: false }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleCameraCapture = async () => {
    try {
      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Camera result:', result);
      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Photo selected:', imageUri);
        setProfilePhoto(imageUri);
        setFormData(prev => ({ ...prev, profilePhotoUrl: imageUri }));
        setValidationErrors(prev => ({ ...prev, photo: false }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleGallerySelection = async () => {
    try {
      console.log('Launching gallery...');
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Gallery result:', result);
      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Image selected:', imageUri);
        setProfilePhoto(imageUri);
        setFormData(prev => ({ ...prev, profilePhotoUrl: imageUri }));
        setValidationErrors(prev => ({ ...prev, photo: false }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => {
      if (prev.some(item => item.value === interest.value)) {
        return prev.filter(item => item.value !== interest.value);
      } else if (prev.length < 5) {
        return [...prev, interest];
      }
      return prev;
    });
  };

  const handleBioChange = (text) => {
    setFormData(prev => ({ ...prev, bio: text }));
    if (text.trim().length > 0) {
      setValidationErrors(prev => ({ ...prev, bio: false }));
    }
  };

  const filteredInterests = interests.filter(interest =>
    interest.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interest.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding additional photos
  const handleAddPhoto = async () => {
    // Check if already at limit (4 additional photos)
    if (additionalPhotos.length >= 4) {
      Alert.alert('Photo Limit Reached', 'You can only add 4 additional photos (5 total including your main profile photo).');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto = result.assets[0].uri;
        setAdditionalPhotos(prev => [...prev, newPhoto]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle removing additional photos
  const handleRemovePhoto = (index) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  // Update multi-select field
  const updateMultiSelectField = (field, value, maxSelections = 3) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      } else if (currentValues.length < maxSelections) {
        return { ...prev, [field]: [...currentValues, value] };
      }
      return prev;
    });
  };

  // Check if option is selected
  const isSelected = (field, value) => {
    return (formData[field] || []).includes(value);
  };

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle dropdown field selection
  const handleDropdownSelect = (field, value) => {
    updateFormData(field, value);
    setShowFieldModal(false);
  };

  // Render dropdown field
  const renderDropdownField = (field, label, options) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, { borderColor: colors.border }]}
        onPress={() => {
          setCurrentField(field);
          setShowFieldModal(true);
        }}
      >
        <Text style={[styles.dropdownText, { color: formData[field] ? colors.text : colors.textSecondary }]}>
          {formData[field] ? profileFields[field]?.find(opt => opt.value === formData[field])?.label || formData[field] : `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  // Render multi-select field
  const renderMultiSelectField = (field, label, options, maxSelections = 3) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        {label} {formData[field]?.length > 0 && `(${formData[field].length}/${maxSelections})`}
      </Text>
      <View style={styles.multiSelectContainer}>
        {formData[field]?.map((value, index) => (
          <View key={index} style={styles.selectedTag}>
            <Text style={styles.selectedTagText}>
              {options.find(opt => opt.value === value)?.label}
            </Text>
            <TouchableOpacity
              onPress={() => updateMultiSelectField(field, value, maxSelections)}
              style={styles.removeTag}
            >
              <Ionicons name="close" size={16} color="#E6C547" />
            </TouchableOpacity>
          </View>
        ))}
        {formData[field]?.length < maxSelections && (
          <TouchableOpacity
            style={[styles.addTagButton, { borderColor: colors.border }]}
            onPress={() => {
              setCurrentField(field);
              setShowFieldModal(true);
            }}
          >
            <Ionicons name="add" size={20} color={colors.textSecondary} />
            <Text style={[styles.addTagText, { color: colors.textSecondary }]}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handleSubmit = async () => {
    // Validate only required fields (photo, bio, 5 interests)
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
        additionalPhotos: additionalPhotos,
        username: user?.username,
        phoneNumber: user?.phoneNumber,
        birthday: user?.birthday,
        gender: user?.gender,
        sexualOrientation: user?.sexuality,
        userId: user?.id,
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const profileKey = `profile_${user.id}`;
      await AsyncStorage.setItem(profileKey, JSON.stringify(profileData));
      
      // Mark profile as completed
      markProfileCompleted(profileData);
      
      // Navigate to venue discovery
      setTimeout(() => {
        navigation.navigate('VenueDiscovery');
      }, 100);
      
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
          <ActivityIndicator size="large" color="#E6C547" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {existingProfile ? 'Updating profile...' : 'Creating profile...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#1a1a1a', '#2d2d2d', '#1a1a1a']}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#E6C547" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            {existingProfile ? 'Update Profile' : 'Complete Profile'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Basic Information Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
              
              {/* Profile Photo */}
              <View style={styles.photoSection}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Profile Photo</Text>
                <TouchableOpacity style={styles.photoContainer} onPress={() => setShowImagePickerModal(true)}>
                  {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera" size={40} color="#E6C547" />
                      <Text style={styles.photoText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Additional Photos */}
              <View style={styles.photoSection}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Additional Photos ({additionalPhotos.length}/4)</Text>
                <View style={styles.additionalPhotosContainer}>
                  {additionalPhotos.map((photo, index) => (
                    <View key={index} style={styles.additionalPhotoContainer}>
                      <Image source={{ uri: photo }} style={styles.additionalPhoto} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => handleRemovePhoto(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {additionalPhotos.length < 4 && (
                    <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                      <Ionicons name="add" size={30} color="#E6C547" />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Bio */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Bio</Text>
                <TextInput
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                  value={formData.bio}
                  onChangeText={handleBioChange}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Interests */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Interests ({selectedInterests.length}/5)
                </Text>
                <TouchableOpacity
                  style={[styles.interestsButton, { borderColor: colors.border }]}
                  onPress={() => setShowInterests(!showInterests)}
                >
                  <Text style={[styles.interestsButtonText, { color: colors.text }]}>
                    {selectedInterests.length > 0 
                      ? `${selectedInterests.length} interests selected` 
                      : 'Select your interests'}
                  </Text>
                  <Ionicons name={showInterests ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                
                {showInterests && (
                  <View style={styles.interestsContainer}>
                    <TextInput
                      style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search interests..."
                      placeholderTextColor={colors.textSecondary}
                    />
                    <View style={styles.interestsGrid}>
                      {filteredInterests.map((interest) => (
                        <TouchableOpacity
                          key={interest.value}
                          style={[
                            styles.interestTag,
                            selectedInterests.some(item => item.value === interest.value) && styles.selectedInterestTag
                          ]}
                          onPress={() => toggleInterest(interest)}
                        >
                          <Text style={[
                            styles.interestText,
                            selectedInterests.some(item => item.value === interest.value) && styles.selectedInterestText
                          ]}>
                            {interest.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Add More Button */}
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => setShowAdditionalFields(!showAdditionalFields)}
            >
              <LinearGradient
                colors={['rgba(230, 197, 71, 0.2)', 'rgba(230, 197, 71, 0.3)']}
                style={styles.addMoreButtonGradient}
              >
                <Ionicons name={showAdditionalFields ? "remove" : "add"} size={20} color="#E6C547" />
                <Text style={styles.addMoreButtonText}>
                  {showAdditionalFields ? "Hide Additional Fields" : "Add More Details"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Additional Fields (Collapsible) */}
            {showAdditionalFields && (
              <>
                {/* Work and Education */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Work & Education</Text>
                  
                  <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Work</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                      value={formData.work}
                      onChangeText={(text) => updateFormData('work', text)}
                      placeholder="What do you do for work?"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Education</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                      value={formData.education}
                      onChangeText={(text) => updateFormData('education', text)}
                      placeholder="Where did you go to school?"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                </View>

                {/* Personal Details */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>
                  
                  {renderDropdownField('pronouns', 'Pronouns', profileFields.pronouns)}
                  {renderDropdownField('ethnicity', 'Ethnicity', profileFields.ethnicity)}

                  <View style={styles.fieldContainer}>
                    <Text style={[styles.fieldLabel, { color: colors.text }]}>Hometown</Text>
                    <TextInput
                      style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                      value={formData.hometown}
                      onChangeText={(text) => updateFormData('hometown', text)}
                      placeholder="What city are you from?"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  {renderDropdownField('height', 'Height', profileFields.height)}
                </View>

                {/* Lifestyle */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Lifestyle</Text>
                  
                  {renderDropdownField('exercise', 'Exercise', profileFields.exercise)}
                  {renderDropdownField('drinking', 'Drinking', profileFields.drinking)}
                  {renderDropdownField('smoking', 'Smoking', profileFields.smoking)}
                </View>

                {/* Relationship */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Relationship</Text>
                  
                  {renderDropdownField('lookingFor', 'Looking For', profileFields.lookingFor)}
                  {renderDropdownField('familyPlans', 'Family Plans', profileFields.familyPlans)}
                </View>

                {/* Background */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Background</Text>
                  
                  {renderDropdownField('religion', 'Religion', profileFields.religion)}
                  {renderDropdownField('politics', 'Politics', profileFields.politics)}
                </View>

                {/* Languages */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Languages</Text>
                  
                  {renderMultiSelectField('languages', 'Languages Spoken', profileFields.languages, 999)}
                </View>

                {/* Causes & Communities */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Causes & Communities</Text>
                  
                  {renderMultiSelectField('causesAndCommunities', 'Causes & Communities', profileFields.causesAndCommunities, 3)}
                </View>

                {/* Qualities */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Qualities I Value</Text>
                  
                  {renderMultiSelectField('qualities', 'Qualities', profileFields.qualities, 3)}
                </View>
              </>
            )}

            {/* Complete Profile Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#E6C547', '#D4AF37', '#B8860B']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
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
                onPress={async () => {
                  console.log('Camera button pressed');
                  try {
                    await handleCameraCapture();
                    setShowImagePickerModal(false);
                  } catch (error) {
                    console.error('Error in camera button press:', error);
                    setShowImagePickerModal(false);
                  }
                }}
              >
                <Ionicons name="camera" size={24} color="#E6C547" />
                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                  Take Photo
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalOption, { borderColor: colors.border }]}
                onPress={async () => {
                  console.log('Gallery button pressed');
                  try {
                    await handleGallerySelection();
                    setShowImagePickerModal(false);
                  } catch (error) {
                    console.error('Error in gallery button press:', error);
                    setShowImagePickerModal(false);
                  }
                }}
              >
                <Ionicons name="images" size={24} color="#E6C547" />
                <Text style={[styles.modalOptionText, { color: colors.text }]}>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalCancelButton, { backgroundColor: colors.muted }]}
                onPress={() => setShowImagePickerModal(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Field Selection Modal */}
        <Modal
          visible={showFieldModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFieldModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select {currentField === 'pronouns' ? 'Pronouns' : 
                         currentField === 'ethnicity' ? 'Ethnicity' :
                         currentField === 'height' ? 'Height' :
                         currentField === 'exercise' ? 'Exercise Frequency' :
                         currentField === 'drinking' ? 'Drinking Frequency' :
                         currentField === 'smoking' ? 'Smoking Frequency' :
                         currentField === 'lookingFor' ? 'What You\'re Looking For' :
                         currentField === 'familyPlans' ? 'Family Plans' :
                         currentField === 'religion' ? 'Religion' :
                         currentField === 'politics' ? 'Politics' :
                         currentField === 'languages' ? 'Languages' :
                         currentField === 'causesAndCommunities' ? 'Causes & Communities' :
                         currentField === 'qualities' ? 'Qualities' : currentField}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowFieldModal(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
                {profileFields[currentField] && profileFields[currentField].length > 0 ? (
                  profileFields[currentField].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionItem,
                        { borderBottomColor: colors.border },
                        isSelected(currentField, option.value) && styles.selectedOptionItem
                      ]}
                      onPress={() => {
                        if (['languages', 'causesAndCommunities', 'qualities'].includes(currentField)) {
                          updateMultiSelectField(currentField, option.value);
                        } else {
                          handleDropdownSelect(currentField, option.value);
                        }
                      }}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: colors.text },
                        isSelected(currentField, option.value) && styles.selectedOptionText
                      ]}>
                        {option.label}
                      </Text>
                      {isSelected(currentField, option.value) && (
                        <Ionicons name="checkmark" size={20} color="#E6C547" />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={[styles.optionText, { color: colors.text, textAlign: 'center', padding: 20 }]}>
                    No options available
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#E6C547',
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 10,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#E6C547',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    color: '#E6C547',
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 8,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlignVertical: 'top',
  },
  interestsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  interestsButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  interestsContainer: {
    marginTop: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 15,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedInterestTag: {
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    borderColor: '#E6C547',
  },
  interestText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  selectedInterestText: {
    color: '#E6C547',
  },
  saveButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
  },
  saveButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Georgia',
    color: '#000000',
    fontWeight: 'bold',
  },
  addMoreButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 15,
  },
  addMoreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E6C547',
    borderRadius: 25,
  },
  addMoreButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#E6C547',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    width: screenWidth * 0.8,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 10,
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginLeft: 12,
  },
  modalCancelButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  // Additional field styles
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  // Dropdown styles
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  // Multi-select styles
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    borderColor: '#E6C547',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedTagText: {
    color: '#E6C547',
    fontSize: 14,
    fontFamily: 'Georgia',
    marginRight: 6,
  },
  removeTag: {
    marginLeft: 4,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addTagText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginLeft: 4,
  },
  // Modal styles
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  selectedOptionItem: {
    backgroundColor: 'rgba(230, 197, 71, 0.1)',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    flex: 1,
  },
  selectedOptionText: {
    color: '#E6C547',
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  // Additional photos styles
  additionalPhotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  additionalPhotoContainer: {
    position: 'relative',
  },
  additionalPhoto: {
    width: 80,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E6C547',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 197, 71, 0.1)',
  },
  addPhotoText: {
    color: '#E6C547',
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ProfileCreationScreen;
