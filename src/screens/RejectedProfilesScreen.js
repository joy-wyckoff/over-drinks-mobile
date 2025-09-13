import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

// Mock profiles data (shared with CheckInScreen)
const mockProfiles = [
  {
    id: 'profile1',
    name: 'Alex',
    age: 28,
    distance: '0.2 miles',
    lastActive: '2 minutes ago',
    bio: 'Love hiking and good coffee. Looking for someone to explore the city with!',
    interests: ['Hiking', 'Coffee', 'Photography', 'Travel']
  },
  {
    id: 'profile2',
    name: 'Jordan',
    age: 25,
    distance: '0.5 miles',
    lastActive: '5 minutes ago',
    bio: 'Artist and music lover. Always up for a concert or gallery opening.',
    interests: ['Art', 'Music', 'Concerts', 'Painting']
  },
  {
    id: 'profile3',
    name: 'Casey',
    age: 30,
    distance: '1.2 miles',
    lastActive: '1 minute ago',
    bio: 'Fitness enthusiast and dog lover. Looking for someone to join me on morning runs!',
    interests: ['Fitness', 'Dogs', 'Running', 'Healthy Living']
  }
];

const RejectedProfilesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get session data from navigation params
  const { profiles: sessionProfiles, sessionId } = route.params || {};
  
  // Use session profiles or empty array if none
  const [rejectedProfiles, setRejectedProfiles] = useState(sessionProfiles || []);
  
  // Update AsyncStorage when a profile is moved from rejected to liked
  const updateSwipedProfilesInStorage = async (profileId) => {
    try {
      const storageKey = `swipedProfiles_${sessionId}`;
      const savedProfiles = await AsyncStorage.getItem(storageKey);
      
      if (savedProfiles) {
        const swipedProfiles = JSON.parse(savedProfiles);
        
        // Find and update the profile's direction from 'left' to 'right'
        const updatedProfiles = swipedProfiles.map(swipe => {
          if (swipe.profileId === profileId && swipe.direction === 'left') {
            return {
              ...swipe,
              direction: 'right',
              timestamp: new Date().toISOString()
            };
          }
          return swipe;
        });
        
        // Remove duplicates and save updated profiles back to storage
        const uniqueProfiles = updatedProfiles.reduce((acc, current) => {
          const existingIndex = acc.findIndex(profile => profile.profileId === current.profileId);
          if (existingIndex >= 0) {
            acc[existingIndex] = current;
          } else {
            acc.push(current);
          }
          return acc;
        }, []);
        
        await AsyncStorage.setItem(storageKey, JSON.stringify(uniqueProfiles));
      }
    } catch (error) {
      console.error('Error updating swiped profiles in storage:', error);
    }
  };

  const handleLike = (profileId) => {
    Alert.alert(
      'Like Profile',
      'Would you like to like this profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Like',
          onPress: async () => {
            // Find the profile to move
            const profileToMove = rejectedProfiles.find(profile => profile.id === profileId);
            
            // Remove from rejected profiles
            setRejectedProfiles(prev => prev.filter(profile => profile.id !== profileId));
            
            // Update AsyncStorage to change the profile's direction from 'left' to 'right'
            await updateSwipedProfilesInStorage(profileId);
            
            // Show success message
            Alert.alert(
              'Profile Liked! 💕', 
              `${profileToMove.name} has been moved to your liked profiles.`,
              [
                {
                  text: 'View Liked Profiles',
                  onPress: async () => {
                    // Get all liked profiles from AsyncStorage
                    try {
                      const storageKey = `swipedProfiles_${sessionId}`;
                      const savedProfiles = await AsyncStorage.getItem(storageKey);
                      
                      let allLikedProfiles = [];
                      if (savedProfiles) {
                        const swipedProfiles = JSON.parse(savedProfiles);
                        
                        // Get all right swipes (liked profiles) and convert to profile objects
                        allLikedProfiles = swipedProfiles
                          .filter(swipe => swipe.direction === 'right')
                          .map(swipe => {
                            const profile = mockProfiles.find(p => p.id === swipe.profileId);
                            return profile ? {
                              ...profile,
                              likedAt: swipe.timestamp,
                              isMatch: Math.random() > 0.5 // Mock match probability
                            } : null;
                          })
                          .filter(Boolean);
                      }
                      
                      navigation.navigate('LikedProfiles', { 
                        profiles: allLikedProfiles,
                        sessionId: sessionId 
                      });
                    } catch (error) {
                      console.error('Error getting liked profiles:', error);
                      // Fallback to just the moved profile
                      const likedProfile = {
                        ...profileToMove,
                        likedAt: Date.now(),
                        isMatch: Math.random() > 0.5
                      };
                      navigation.navigate('LikedProfiles', { 
                        profiles: [likedProfile],
                        sessionId: sessionId 
                      });
                    }
                  }
                },
                { text: 'Stay Here', style: 'cancel' }
              ]
            );
          }
        }
      ]
    );
  };

  const formatRejectTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

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
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#E6C547" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Passed Profiles</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Profiles you've passed on
            </Text>
            
            {rejectedProfiles.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-dislike" size={60} color="#E6C547" />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Passed Profiles</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  You haven't passed on anyone in this session yet. Start swiping to see profiles here!
                </Text>
              </View>
            ) : (
              <View style={styles.profilesList}>
                {rejectedProfiles.map((profile) => (
                  <View key={profile.id} style={styles.profileCard}>
                    <LinearGradient
                      colors={['#000000', '#1a1a1a']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.profileHeader}>
                        <View style={styles.profileInfo}>
                          <View style={styles.photoPlaceholder}>
                            <Ionicons name="person" size={40} color="#E6C547" />
                          </View>
                          <View style={styles.profileDetails}>
                            <Text style={[styles.profileName, { color: colors.text }]}>
                              {profile.name}, {profile.age}
                            </Text>
                            <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
                              {profile.distance} • {profile.lastActive}
                            </Text>
                            <Text style={[styles.rejectTime, { color: '#FF6B6B' }]}>
                              Passed {formatRejectTime(profile.rejectedAt)}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.likeButton}
                          onPress={() => handleLike(profile.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="heart" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={[styles.profileBio, { color: colors.text }]}>
                        {profile.bio}
                      </Text>
                      
                      <View style={styles.interestsContainer}>
                        <Text style={[styles.interestsTitle, { color: colors.text }]}>Interests:</Text>
                        <View style={styles.interestsList}>
                          {profile.interests.map((interest, index) => (
                            <View key={index} style={styles.interestTag}>
                              <Text style={styles.interestText}>{interest}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  backButton: {
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
    color: '#E6C547',
    fontSize: 16,
    marginLeft: 5,
    fontFamily: 'Georgia',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 80, // Same width as back button for centering
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 24,
  },
  profilesList: {
    gap: 15,
  },
  profileCard: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6C547',
  },
  cardGradient: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(230, 197, 71, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileMeta: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  rejectTime: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  likeButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBio: {
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 22,
    marginBottom: 15,
  },
  interestsContainer: {
    marginTop: 10,
  },
  interestsTitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(230, 197, 71, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  interestText: {
    color: '#E6C547',
    fontSize: 12,
    fontFamily: 'Georgia',
  },
});

export default RejectedProfilesScreen;
