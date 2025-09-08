import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CheckInScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { venueId } = route.params;

  // Mock venue data
  const venues = {
    'test1': {
      id: 'test1',
      name: 'The Runnymede Lounge',
      address: '13952 Runnymede St, Van Nuys, CA 91405',
      type: 'bar',
      musicType: 'Rock',
      vibe: 'Casual',
    },
    'test2': {
      id: 'test2',
      name: 'Van Nuys Social Club',
      address: '13952 Runnymede St, Van Nuys, CA 91405',
      type: 'lounge',
      musicType: 'Electronic',
      vibe: 'Trendy',
    },
    'test3': {
      id: 'test3',
      name: 'The Corner Pub',
      address: '13952 Runnymede St, Van Nuys, CA 91405',
      type: 'pub',
      musicType: 'Country',
      vibe: 'Classic',
    }
  };

  // Mock profiles currently checked into the venue
  const mockProfiles = [
    {
      id: 'profile1',
      name: 'Alex',
      age: 28,
      bio: 'Love live music and craft cocktails. Looking for someone to explore LA with!',
      interests: ['Music', 'Art', 'Travel', 'Food'],
      photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face'],
      distance: '0.1 miles away',
      lastActive: '2 minutes ago'
    },
    {
      id: 'profile2',
      name: 'Jordan',
      age: 25,
      bio: 'Always up for a good time! Dancing, laughing, and making memories.',
      interests: ['Dancing', 'Fitness', 'Photography', 'Wine'],
      photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face'],
      distance: '0.2 miles away',
      lastActive: '5 minutes ago'
    },
    {
      id: 'profile3',
      name: 'Casey',
      age: 30,
      bio: 'Creative soul who loves deep conversations and spontaneous adventures.',
      interests: ['Writing', 'Music', 'Hiking', 'Coffee'],
      photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face'],
      distance: '0.3 miles away',
      lastActive: '1 minute ago'
    }
  ];

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [swipedProfiles, setSwipedProfiles] = useState([]);
  const [currentProfile, setCurrentProfile] = useState(mockProfiles[0]);

  const venue = venues[venueId];

  useEffect(() => {
    if (currentProfileIndex < mockProfiles.length) {
      setCurrentProfile(mockProfiles[currentProfileIndex]);
    }
  }, [currentProfileIndex]);

  const handleSwipe = (direction) => {
    const profile = mockProfiles[currentProfileIndex];
    const swipeData = {
      profileId: profile.id,
      direction: direction, // 'left' or 'right'
      timestamp: new Date().toISOString()
    };

    setSwipedProfiles(prev => [...prev, swipeData]);
    
    if (direction === 'right') {
      Alert.alert('Match!', `You liked ${profile.name}! They'll be notified.`);
    }

    // Move to next profile
    if (currentProfileIndex < mockProfiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1);
    } else {
      // No more profiles
      Alert.alert(
        'No More Profiles',
        'You\'ve seen everyone at this venue! Check back later for new people.',
        [
          {
            text: 'Back to Venues',
            onPress: () => navigation.navigate('VenueDiscovery')
          }
        ]
      );
    }
  };

  const handlePass = () => handleSwipe('left');
  const handleLike = () => handleSwipe('right');

  if (!venue) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#1A0D0F', '#281218', '#381B22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        >
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>Venue not found</Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (currentProfileIndex >= mockProfiles.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#1A0D0F', '#281218', '#381B22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        >
          <View style={styles.noMoreContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#E6C547" />
            <Text style={[styles.noMoreTitle, { color: colors.text }]}>All Caught Up!</Text>
            <Text style={[styles.noMoreText, { color: colors.textSecondary }]}>
              You've seen everyone at {venue.name}. Check back later for new people!
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('VenueDiscovery')}
            >
              <LinearGradient
                colors={['#E6C547', '#D4AF37', '#B8860B']}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>Back to Venues</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={['#1A0D0F', '#281218', '#381B22']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#E6C547" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.venueInfo}>
            <Text style={[styles.venueName, { color: colors.text }]}>{venue.name}</Text>
            <Text style={[styles.venueDetails, { color: colors.textSecondary }]}>
              {venue.musicType} • {venue.vibe}
            </Text>
          </View>
          <View style={styles.profileCounter}>
            <Text style={[styles.counterText, { color: colors.textSecondary }]}>
              {currentProfileIndex + 1} of {mockProfiles.length}
            </Text>
          </View>
        </View>

        {/* Profile Card */}
        <View style={styles.profileContainer}>
          <View style={styles.profileCard}>
            <LinearGradient
              colors={['#000000', '#1a1a1a']}
              style={styles.cardGradient}
            >
              {/* Profile Photo */}
              <View style={styles.photoContainer}>
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={80} color="#E6C547" />
                </View>
                <View style={styles.onlineIndicator} />
              </View>

              {/* Profile Info */}
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {currentProfile.name}, {currentProfile.age}
                </Text>
                <Text style={[styles.profileDistance, { color: colors.textSecondary }]}>
                  {currentProfile.distance} • {currentProfile.lastActive}
                </Text>
                
                <Text style={[styles.profileBio, { color: colors.text }]}>
                  {currentProfile.bio}
                </Text>

                {/* Interests */}
                <View style={styles.interestsContainer}>
                  <Text style={[styles.interestsTitle, { color: colors.text }]}>Interests:</Text>
                  <View style={styles.interestsList}>
                    {currentProfile.interests.map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.passButton}
              onPress={handlePass}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={30} color="#FF6B6B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Ionicons name="heart" size={30} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E6C547',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    color: '#E6C547',
    fontSize: 16,
    marginLeft: 5,
    fontFamily: 'Georgia',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  venueDetails: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  profileCounter: {
    alignItems: 'center',
  },
  counterText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  profileContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E6C547',
    shadowColor: '#E6C547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 15,
  },
  cardGradient: {
    padding: 20,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E6C547',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4ECDC4',
    borderWidth: 2,
    borderColor: '#000000',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 5,
  },
  profileDistance: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 15,
  },
  profileBio: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  interestsContainer: {
    width: '100%',
  },
  interestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 10,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  interestTag: {
    backgroundColor: '#E6C547',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    margin: 3,
  },
  interestText: {
    color: '#000000',
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  passButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4ECDC4',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Georgia',
    marginBottom: 20,
  },
  noMoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMoreTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginTop: 20,
    marginBottom: 10,
  },
  noMoreText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  continueButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default CheckInScreen;