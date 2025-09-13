import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const LikedProfilesScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get session data from navigation params
  const { profiles: sessionProfiles, sessionId } = route.params || {};
  
  // Use session profiles or empty array if none
  const [likedProfiles, setLikedProfiles] = useState(sessionProfiles || []);
  
  // Update liked profiles when new data comes in
  useEffect(() => {
    if (sessionProfiles) {
      setLikedProfiles(sessionProfiles);
    }
  }, [sessionProfiles]);
  
  // Update AsyncStorage when a profile is moved from liked to rejected
  const updateSwipedProfilesInStorage = async (profileId) => {
    try {
      const storageKey = `swipedProfiles_${sessionId}`;
      const savedProfiles = await AsyncStorage.getItem(storageKey);
      
      if (savedProfiles) {
        const swipedProfiles = JSON.parse(savedProfiles);
        
        // Find and update the profile's direction from 'right' to 'left'
        const updatedProfiles = swipedProfiles.map(swipe => {
          if (swipe.profileId === profileId && swipe.direction === 'right') {
            return {
              ...swipe,
              direction: 'left',
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

  const handleUndoLike = (profileId) => {
    Alert.alert(
      'Undo Like',
      'Are you sure you want to remove this like?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          onPress: async () => {
            setLikedProfiles(prev => prev.filter(profile => profile.id !== profileId));
            
            // Update AsyncStorage to change the profile's direction from 'right' to 'left'
            await updateSwipedProfilesInStorage(profileId);
            
            Alert.alert('Success', 'Like has been removed.');
          }
        }
      ]
    );
  };

  const formatLikeTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Handle invite to bar (mocked for testing - Alex always accepts)
  const handleInviteToBar = (profile) => {
    Alert.alert(
      'Send Invite',
      `Send an invite to ${profile.name} to meet at the bar?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Invite',
          onPress: () => {
            // Mock: Alex always accepts invites for testing
            if (profile.id === 'profile1') {
              Alert.alert(
                'Invite Accepted! 🎉',
                `${profile.name} has accepted your invite! You both have agreed to meet at the bar, now go talk to each other!`,
                [
                  {
                    text: 'Start Meeting',
                    onPress: () => {
                      // Navigate back to CheckInScreen to start meeting mode
                      navigation.navigate('CheckIn', { 
                        venueId: sessionId,
                        startMeeting: true,
                        meetingProfile: profile
                      });
                    }
                  }
                ]
              );
            } else {
              Alert.alert(
                'Invite Sent! 📤',
                `Your invite has been sent to ${profile.name}. They'll receive a notification and can respond when they're ready.`
              );
            }
          }
        }
      ]
    );
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
          <Text style={[styles.title, { color: colors.text }]}>Liked Profiles</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Profiles you've liked
            </Text>
            
            {likedProfiles.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="heart-outline" size={60} color="#E6C547" />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Liked Profiles</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  You haven't liked anyone in this session yet. Start swiping to see profiles here!
                </Text>
              </View>
            ) : (
              <View style={styles.profilesList}>
                {likedProfiles.map((profile) => (
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
                            <View style={styles.nameRow}>
                              <Text style={[styles.profileName, { color: colors.text }]}>
                                {profile.name}, {profile.age}
                              </Text>
                              {profile.isMatch && (
                                <View style={styles.matchBadge}>
                                  <Ionicons name="checkmark" size={12} color="#4ECDC4" />
                                </View>
                              )}
                            </View>
                            <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
                              {profile.distance} • {profile.lastActive}
                            </Text>
                            <Text style={[styles.likeTime, { color: '#4ECDC4' }]}>
                              Liked {formatLikeTime(profile.likedAt)}
                            </Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.undoButton}
                          onPress={() => handleUndoLike(profile.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="close" size={20} color="#FF6B6B" />
                        </TouchableOpacity>
                      </View>
                      
                      {profile.isMatch && (
                        <View style={styles.matchBanner}>
                          <Ionicons name="heart" size={16} color="#4ECDC4" />
                          <Text style={[styles.matchText, { color: '#4ECDC4' }]}>
                            It's a Match!
                          </Text>
                        </View>
                      )}
                      
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
                      
                      {profile.isMatch && (
                        <View style={styles.inviteContainer}>
                          <TouchableOpacity
                            style={styles.inviteButton}
                            onPress={() => handleInviteToBar(profile)}
                            activeOpacity={0.7}
                          >
                            <LinearGradient
                              colors={['#E6C547', '#D4AF37', '#B8860B']}
                              style={styles.inviteButtonGradient}
                            >
                              <Ionicons name="send" size={20} color="#000000" />
                              <Text style={styles.inviteButtonText}>Invite to Bar</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      )}
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginRight: 8,
  },
  matchBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    borderWidth: 1,
    borderColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileMeta: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  likeTime: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  matchText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  undoButton: {
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
  inviteContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  inviteButton: {
    borderRadius: 25,
    overflow: 'hidden',
    minWidth: 160,
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  inviteButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default LikedProfilesScreen;
