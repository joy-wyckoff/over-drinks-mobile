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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { profileApi } from '../utils/api';

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
  { value: 'foodie', label: '🍽️ Foodie', emoji: '🍽️' },
  { value: 'coffee', label: '☕ Coffee', emoji: '☕' },
  { value: 'craft-beer', label: '🍺 Craft Beer', emoji: '🍺' },
  { value: 'brunch', label: '🥞 Brunch', emoji: '🥞' },
  { value: 'baking', label: '🧁 Baking', emoji: '🧁' },
  
  // Lifestyle
  { value: 'travel', label: '✈️ Travel', emoji: '✈️' },
  { value: 'fashion', label: '👗 Fashion', emoji: '👗' },
  { value: 'wellness', label: '🧘 Wellness', emoji: '🧘' },
  { value: 'spirituality', label: '🙏 Spirituality', emoji: '🙏' },
  { value: 'astrology', label: '⭐ Astrology', emoji: '⭐' },
  { value: 'meditation', label: '🧘‍♀️ Meditation', emoji: '🧘‍♀️' },
  { value: 'yoga', label: '🧘‍♂️ Yoga', emoji: '🧘‍♂️' },
  
  // Social & Personality
  { value: 'socializing', label: '🗣️ Socializing', emoji: '🗣️' },
  { value: 'networking', label: '🤝 Networking', emoji: '🤝' },
  { value: 'debates', label: '💬 Debates', emoji: '💬' },
  { value: 'volunteering', label: '❤️ Volunteering', emoji: '❤️' },
  { value: 'activism', label: '✊ Activism', emoji: '✊' },
  
  // Hobbies
  { value: 'reading', label: '📖 Reading', emoji: '📖' },
  { value: 'gaming', label: '🎮 Gaming', emoji: '🎮' },
  { value: 'board-games', label: '🎲 Board Games', emoji: '🎲' },
  { value: 'chess', label: '♟️ Chess', emoji: '♟️' },
  { value: 'collecting', label: '🏺 Collecting', emoji: '🏺' },
  { value: 'crafts', label: '🧵 Arts & Crafts', emoji: '🧵' },
  { value: 'gardening', label: '🌱 Gardening', emoji: '🌱' },
  
  // Music & Performance  
  { value: 'music', label: '🎶 Music', emoji: '🎶' },
  { value: 'singing', label: '🎤 Singing', emoji: '🎤' },
  { value: 'piano', label: '🎹 Piano', emoji: '🎹' },
  { value: 'guitar', label: '🎸 Guitar', emoji: '🎸' },
  { value: 'violin', label: '🎻 Violin', emoji: '🎻' },
  
  // Business & Career
  { value: 'entrepreneurship', label: '💼 Entrepreneurship', emoji: '💼' },
  { value: 'investing', label: '📈 Investing', emoji: '📈' },
  { value: 'real-estate', label: '🏠 Real Estate', emoji: '🏠' },
  { value: 'technology', label: '💻 Technology', emoji: '💻' },
  { value: 'crypto', label: '₿ Cryptocurrency', emoji: '₿' },
];

const ProfileCreationScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    birthday: '',
    gender: '',
    sexualOrientation: '',
    bio: '',
    profilePhotoUrl: '',
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState('');

  // Check if user already has a profile
  const { data: existingProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileApi.getProfile();
      if (response.ok) {
        return response.json();
      }
      return null;
    },
    retry: false,
  });

  // Populate form if user has existing profile
  useEffect(() => {
    if (existingProfile) {
      setFormData({
        username: existingProfile.username || '',
        phoneNumber: existingProfile.phoneNumber || '',
        birthday: existingProfile.birthday ? new Date(existingProfile.birthday).toISOString().split('T')[0] : '',
        gender: existingProfile.gender || '',
        sexualOrientation: existingProfile.sexualOrientation || '',
        bio: existingProfile.bio || '',
        profilePhotoUrl: existingProfile.profilePhotoUrl || '',
      });
      setSelectedInterests(existingProfile.interests || []);
      setProfilePhoto(existingProfile.profilePhotoUrl || '');
    }
  }, [existingProfile]);

  const createProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await profileApi.createProfile(data);
      return response.json();
    },
    onSuccess: () => {
      Alert.alert('Success', 'Profile created successfully!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigation.navigate('VenueDiscovery');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await profileApi.updateProfile(data);
      return response.json();
    },
    onSuccess: () => {
      Alert.alert('Success', 'Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigation.navigate('VenueDiscovery');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    },
  });

  const handleImagePicker = async () => {
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
  };

  const handleSubmit = () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    const profileData = {
      ...formData,
      interests: selectedInterests,
      birthday: formData.birthday ? new Date(formData.birthday) : null,
    };

    if (existingProfile) {
      updateProfileMutation.mutate(profileData);
    } else {
      createProfileMutation.mutate(profileData);
    }
  };

  if (profileLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading...
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
              Make a great first impression
            </Text>
          </View>

          <Card style={styles.formCard}>
            {/* Photo Upload */}
            <View style={styles.photoSection}>
              <TouchableOpacity
                style={[styles.photoContainer, { borderColor: colors.border }]}
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
              <Text style={[styles.photoInstruction, { color: colors.textSecondary }]}>
                Tap to add your best photo
              </Text>
            </View>

            {/* Form Fields */}
            <Input
              label="Username"
              placeholder="YourUsername"
              value={formData.username}
              onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
            />

            <Input
              label="Phone Number"
              placeholder="+1 (555) 123-4567"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
              keyboardType="phone-pad"
            />

            <Input
              label="Birthday"
              placeholder="YYYY-MM-DD"
              value={formData.birthday}
              onChangeText={(text) => setFormData(prev => ({ ...prev, birthday: text }))}
            />

            <View style={styles.selectContainer}>
              <Text style={[styles.selectLabel, { color: colors.text }]}>Gender</Text>
              <View style={styles.selectRow}>
                {['man', 'woman', 'non-binary', 'other'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.selectOption,
                      {
                        backgroundColor: formData.gender === option ? colors.primary : colors.muted,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, gender: option }))}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        {
                          color: formData.gender === option ? colors.primaryForeground : colors.text,
                        },
                      ]}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectContainer}>
              <Text style={[styles.selectLabel, { color: colors.text }]}>Sexual Orientation</Text>
              <View style={styles.selectRow}>
                {['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'other'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.selectOption,
                      {
                        backgroundColor: formData.sexualOrientation === option ? colors.primary : colors.muted,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, sexualOrientation: option }))}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        {
                          color: formData.sexualOrientation === option ? colors.primaryForeground : colors.text,
                        },
                      ]}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Interests */}
            <View style={styles.interestsContainer}>
              <Text style={[styles.interestsLabel, { color: colors.text }]}>
                Interests (Select up to 5)
              </Text>
              <Text style={[styles.interestsSubtitle, { color: colors.textSecondary }]}>
                Choose interests that best describe you
              </Text>
              <View style={[styles.interestsGrid, { backgroundColor: colors.muted + '30' }]}>
                {interests.map((interest) => (
                  <TouchableOpacity
                    key={interest.value}
                    style={[
                      styles.interestButton,
                      {
                        backgroundColor: selectedInterests.includes(interest.value)
                          ? colors.secondary
                          : colors.card,
                        borderColor: colors.border,
                        opacity: !selectedInterests.includes(interest.value) && selectedInterests.length >= 5 ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => toggleInterest(interest.value)}
                    disabled={!selectedInterests.includes(interest.value) && selectedInterests.length >= 5}
                  >
                    <Text style={[styles.interestText, { color: colors.text }]}>
                      {interest.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedInterests.length > 0 && (
                <Text style={[styles.selectedCount, { color: colors.textSecondary }]}>
                  Selected: {selectedInterests.length}/5
                </Text>
              )}
            </View>

            <TextArea
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              style={styles.bioInput}
            />

            <Button
              title={existingProfile ? 'Update Profile' : 'Enter the Speakeasy'}
              onPress={handleSubmit}
              loading={createProfileMutation.isPending || updateProfileMutation.isPending}
              style={styles.submitButton}
            />
          </Card>
        </View>
      </ScrollView>
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
    padding: 24,
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
    fontFamily: 'serif',
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
    marginBottom: 24,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photoContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    fontSize: 32,
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoInstruction: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  selectContainer: {
    marginBottom: 16,
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  selectOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  interestsContainer: {
    marginBottom: 16,
  },
  interestsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  interestsSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  interestsGrid: {
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  interestButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  interestText: {
    fontSize: 12,
  },
  selectedCount: {
    fontSize: 12,
    marginTop: 8,
  },
  bioInput: {
    marginBottom: 24,
  },
  submitButton: {
    width: '100%',
  },
});

export default ProfileCreationScreen;
