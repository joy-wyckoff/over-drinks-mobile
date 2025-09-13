import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const CheckInScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { venueId, startMeeting, meetingProfile: routeMeetingProfile } = route.params || {};

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
  const [meetingMode, setMeetingMode] = useState(false);
  const [meetingProfile, setMeetingProfile] = useState(null);
  const [meetingTimeLeft, setMeetingTimeLeft] = useState(0);
  const [showMeetingWarning, setShowMeetingWarning] = useState(false);
  
  // Animation values for swipe gestures
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;
  
  // Save swiped profiles to AsyncStorage
  const saveSwipedProfiles = async (profiles) => {
    try {
      // Remove duplicates before saving
      const uniqueProfiles = profiles.reduce((acc, current) => {
        const existingIndex = acc.findIndex(profile => profile.profileId === current.profileId);
        if (existingIndex >= 0) {
          // Replace with the newer entry
          acc[existingIndex] = current;
        } else {
          acc.push(current);
        }
        return acc;
      }, []);
      
      await AsyncStorage.setItem(`swipedProfiles_${venueId}`, JSON.stringify(uniqueProfiles));
    } catch (error) {
      console.error('Error saving swiped profiles:', error);
    }
  };
  
  // Load swiped profiles from AsyncStorage
  const loadSwipedProfiles = async () => {
    try {
      const savedProfiles = await AsyncStorage.getItem(`swipedProfiles_${venueId}`);
      if (savedProfiles) {
        const profiles = JSON.parse(savedProfiles);
        
        // Remove duplicates and keep the latest entry for each profile
        const uniqueProfiles = profiles.reduce((acc, current) => {
          const existingIndex = acc.findIndex(profile => profile.profileId === current.profileId);
          if (existingIndex >= 0) {
            // Replace with the newer entry
            acc[existingIndex] = current;
          } else {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setSwipedProfiles(uniqueProfiles);
      }
    } catch (error) {
      console.error('Error loading swiped profiles:', error);
    }
  };

  const venue = venues[venueId];

  useEffect(() => {
    if (currentProfileIndex < mockProfiles.length) {
      setCurrentProfile(mockProfiles[currentProfileIndex]);
    }
  }, [currentProfileIndex]);
  
  // Load swiped profiles when component mounts
  useEffect(() => {
    loadSwipedProfiles();
  }, []);

  // Handle meeting mode when navigated from liked profiles
  useEffect(() => {
    if (startMeeting && routeMeetingProfile) {
      startMeetingMode(routeMeetingProfile);
    }
  }, [startMeeting, routeMeetingProfile]);
  
  // Reload swiped profiles when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSwipedProfiles();
    }, [])
  );
  
  // Disable swipe-back gesture
  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
    });
  }, [navigation]);
  
  // Handle back button during meeting mode
  const handleMeetingBackButton = () => {
    if (meetingTimeLeft > 0) {
      // Show warning message
      setShowMeetingWarning(true);
      // Hide warning after 3 seconds
      setTimeout(() => {
        setShowMeetingWarning(false);
      }, 3000);
    } else {
      // Timer expired, allow going back to check-in screen
      setMeetingMode(false);
      setMeetingProfile(null);
      setMeetingTimeLeft(0);
      setShowMeetingWarning(false);
    }
  };

  // Handle checkout process
  const handleCheckOut = async () => {
    Alert.alert(
      'Check Out',
      'Are you sure you want to check out? All your profile data for this session will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Check Out',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear AsyncStorage data for this venue
              await AsyncStorage.removeItem(`swipedProfiles_${venueId}`);
              
              // Reset local state
              setSwipedProfiles([]);
              setCurrentProfileIndex(0);
              setMeetingMode(false);
              setMeetingProfile(null);
              setMeetingTimeLeft(0);
              
              // Navigate to venue discovery (main app screen)
              navigation.navigate('VenueDiscovery');
            } catch (error) {
              console.error('Error during checkout:', error);
              Alert.alert('Error', 'There was an error checking out. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Check if a profile has already liked the user (for testing: Alex always likes everyone)
  const hasProfileLikedUser = (profileId) => {
    // For testing: Alex (profile1) always likes everyone
    if (profileId === 'profile1') {
      return true;
    }
    // In real app, this would check the backend
    return false;
  };

  // Handle invite to bar
  const handleInviteToBar = (profile) => {
    // For testing: Alex always accepts invites
    if (profile.id === 'profile1') {
      setTimeout(() => {
        Alert.alert(
          'Invite Accepted! 🎉',
          `${profile.name} has accepted your invite to meet at the bar!`,
          [
            {
              text: 'Start Meeting',
              onPress: () => startMeetingMode(profile)
            }
          ]
        );
      }, 2000); // Simulate response time
    } else {
      Alert.alert(
        'Invite Sent!',
        `${profile.name} has been invited to the bar. You'll be notified if they accept.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Start meeting mode
  const startMeetingMode = (profile) => {
    setMeetingMode(true);
    setMeetingProfile(profile);
    setMeetingTimeLeft(15); // 15 seconds for testing
    
    // Start countdown timer
    const timer = setInterval(() => {
      setMeetingTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Don't exit meeting mode automatically, just let timer reach 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle help/safety button
  const handleHelp = () => {
    Alert.alert(
      'Safety & Support',
      'Are you feeling uncomfortable?',
      [
        { text: 'No, I\'m OK', style: 'cancel' },
        {
          text: 'Call Venue',
          onPress: () => {
            Alert.alert(
              'Calling Venue',
              `Calling ${venue.name} at (555) 123-4567`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => {
                  // In real app, this would make a phone call
                  Alert.alert('Calling...', 'Phone call functionality would be implemented here');
                }}
              ]
            );
          }
        }
      ]
    );
  };

  const handleSwipe = (direction) => {
    const profile = mockProfiles[currentProfileIndex];
    const swipeData = {
      profileId: profile.id,
      direction: direction, // 'left' or 'right'
      timestamp: new Date().toISOString()
    };

    const newSwipedProfiles = [...swipedProfiles, swipeData];
    setSwipedProfiles(newSwipedProfiles);
    saveSwipedProfiles(newSwipedProfiles);
    
    if (direction === 'right') {
      // Check if it's a match (both users liked each other)
      if (hasProfileLikedUser(profile.id)) {
        // It's a match!
        Alert.alert(
          'Match! 🎉',
          `You and ${profile.name} both like each other! Invite them to meet you at the bar!`,
          [
            {
              text: 'Invite Later',
              style: 'cancel',
              onPress: () => {
                // Just add to liked profiles, no invite sent
                Alert.alert(
                  'Added to Liked Profiles',
                  `You can invite ${profile.name} anytime from your liked profiles.`
                );
              }
            },
            {
              text: 'Invite to Bar',
              onPress: () => handleInviteToBar(profile)
            }
          ]
        );
      } else {
        // Just a like, no match - silently add to liked profiles
        // No popup needed, user can check liked profiles later
      }
    }

    // Move to next profile (unless in meeting mode)
    if (!meetingMode) {
      if (currentProfileIndex < mockProfiles.length - 1) {
        setCurrentProfileIndex(prev => prev + 1);
      } else {
        // We've reached the last profile, move to "no more profiles" state
        setCurrentProfileIndex(mockProfiles.length);
      }
    }
  };

  // Animated swipe function
  const animateSwipe = (direction) => {
    const toValue = direction === 'right' ? screenWidth : -screenWidth;
    
    // Handle the swipe action immediately to load next profile
    handleSwipe(direction);
    
    // Animate the current card out
    Animated.parallel([
      Animated.timing(translateX, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animation values for next profile
      translateX.setValue(0);
      opacity.setValue(1);
      scale.setValue(1);
    });
  };

  // Gesture handler for swipe gestures
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Determine swipe direction based on translation and velocity
      if (translationX > 100 || velocityX > 500) {
        // Swipe right - Like
        animateSwipe('right');
      } else if (translationX < -100 || velocityX < -500) {
        // Swipe left - Pass
        animateSwipe('left');
      } else {
        // Return to center
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handlePass = () => {
    // Quick animation feedback for button press
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate swipe out to left
    const animateOut = () => {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        translateX.setValue(0);
        opacity.setValue(1);
        scale.setValue(1);
      });
    };
    
    handleSwipe('left');
    setTimeout(animateOut, 100); // Small delay for button press feedback
  };
  
  const handleLike = () => {
    // Quick animation feedback for button press
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate swipe out to right
    const animateOut = () => {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: screenWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        translateX.setValue(0);
        opacity.setValue(1);
        scale.setValue(1);
      });
    };
    
    handleSwipe('right');
    setTimeout(animateOut, 100); // Small delay for button press feedback
  };

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

  if (currentProfileIndex >= mockProfiles.length && !meetingMode) {
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
            <TouchableOpacity onPress={handleCheckOut} style={styles.backButton}>
              <Ionicons name="log-out" size={24} color="#E6C547" />
              <Text style={styles.backButtonText}>Check Out</Text>
            </TouchableOpacity>
            <View style={styles.venueInfo}>
              <Text style={[styles.venueName, { color: colors.text }]}>{venue.name}</Text>
              <Text style={[styles.venueDetails, { color: colors.textSecondary }]}>
                {venue.musicType} • {venue.vibe}
              </Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.noMoreContainer}>
            <Ionicons name="checkmark-circle" size={80} color="#E6C547" />
            <Text style={[styles.noMoreTitle, { color: colors.text }]}>No More Profiles</Text>
            <Text style={[styles.noMoreText, { color: colors.textSecondary }]}>
              There are no more profiles currently to swipe on at {venue.name}. If a new user checks in, they will be added automatically.
            </Text>
            
            {/* Profile Action Buttons */}
            <View style={styles.noMoreActions}>
              <TouchableOpacity
                style={styles.noMoreActionButton}
                onPress={() => {
                  const rejectedProfiles = swipedProfiles
                    .filter(swipe => swipe.direction === 'left')
                    .map(swipe => {
                      const profile = mockProfiles.find(p => p.id === swipe.profileId);
                      return profile ? {
                        ...profile,
                        rejectedAt: swipe.timestamp
                      } : null;
                    })
                    .filter(Boolean);
                  
                  navigation.navigate('RejectedProfiles', { 
                    profiles: rejectedProfiles,
                    sessionId: venueId 
                  });
                }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#E55555', '#CC4444']}
                  style={styles.noMoreButtonGradient}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                  <Text style={styles.noMoreButtonText}>View Passed Profiles</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.noMoreActionButton}
                onPress={() => {
                  // Filter for right swipes and convert to profile objects
                  const likedProfiles = swipedProfiles
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
                  
                  // Ensure we have profiles to show
                  if (likedProfiles.length === 0) {
                    Alert.alert(
                      'No Liked Profiles',
                      'You haven\'t liked any profiles in this session yet.',
                      [{ text: 'OK' }]
                    );
                    return;
                  }
                  
                  navigation.navigate('LikedProfiles', { 
                    profiles: likedProfiles,
                    sessionId: venueId 
                  });
                }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#4ECDC4', '#44B3AC', '#3A9A94']}
                  style={styles.noMoreButtonGradient}
                >
                  <Ionicons name="heart" size={24} color="#FFFFFF" />
                  <Text style={styles.noMoreButtonText}>View Liked Profiles</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
          <TouchableOpacity 
            onPress={meetingMode ? handleMeetingBackButton : handleCheckOut} 
            style={[
              styles.backButton,
              meetingMode && meetingTimeLeft > 0 && styles.disabledBackButton
            ]}
          >
            <Ionicons 
              name={meetingMode ? "arrow-back" : "log-out"} 
              size={24} 
              color={meetingMode && meetingTimeLeft > 0 ? "#666666" : "#E6C547"} 
            />
            <Text style={[
              styles.backButtonText,
              meetingMode && meetingTimeLeft > 0 && styles.disabledBackButtonText
            ]}>
              {meetingMode ? "Back" : "Check Out"}
            </Text>
          </TouchableOpacity>
          
          {!meetingMode ? (
            <View style={styles.venueInfo}>
              <Text style={[styles.venueName, { color: colors.text }]}>{venue.name}</Text>
              <Text style={[styles.venueDetails, { color: colors.textSecondary }]}>
                {venue.musicType} • {venue.vibe}
              </Text>
            </View>
          ) : (
            <View style={styles.meetingHeaderInfo}>
              <Text style={[styles.meetingHeaderText, { color: colors.text }]}>
                {meetingProfile?.name} is waiting for you at the bar!
              </Text>
            </View>
          )}
          
          <View style={styles.placeholder} />
        </View>

        {/* Meeting Warning Message */}
        {showMeetingWarning && (
          <View style={styles.meetingWarningContainer}>
            <Text style={styles.meetingWarningText}>
              You must wait {meetingTimeLeft} seconds before finding a new match!
            </Text>
          </View>
        )}
        
        {/* Top Right Profile Action Buttons */}
        {!meetingMode && (
          <View style={styles.topRightButtons}>
            <TouchableOpacity 
              style={[styles.profileActionButton, styles.rejectedButton]}
              onPress={() => {
                const rejectedProfiles = swipedProfiles
                  .filter(swipe => swipe.direction === 'left')
                  .map(swipe => {
                    const profile = mockProfiles.find(p => p.id === swipe.profileId);
                    return profile ? {
                      ...profile,
                      rejectedAt: swipe.timestamp
                    } : null;
                  })
                  .filter(Boolean);
                
                navigation.navigate('RejectedProfiles', { 
                  profiles: rejectedProfiles,
                  sessionId: venueId 
                });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#FF6B6B" />
              <Text style={[styles.profileActionButtonText, { color: '#FF6B6B' }]}>Passed</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.profileActionButton, styles.likedButton]}
              onPress={() => {
                const likedProfiles = swipedProfiles
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
                
                navigation.navigate('LikedProfiles', { 
                  profiles: likedProfiles,
                  sessionId: venueId 
                });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="heart" size={20} color="#4ECDC4" />
              <Text style={[styles.profileActionButtonText, { color: '#4ECDC4' }]}>Liked</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Card - Only show when not in meeting mode */}
        {!meetingMode && (
          <View style={styles.profileContainer}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View 
              style={[
                styles.profileCard,
                {
                  transform: [
                    { translateX },
                    { scale }
                  ],
                  opacity
                }
              ]}
            >
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
            </Animated.View>
          </PanGestureHandler>

          {/* Action Buttons - Only show when not in meeting mode */}
          {!meetingMode && (
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
          )}
        </View>
        )}

        {/* Meeting Mode UI */}
        {meetingMode && meetingProfile && (
          <View style={styles.meetingModeContainer}>
            {/* Help Button for Meeting Mode */}
            <TouchableOpacity 
              style={[styles.helpButtonMeeting]}
              onPress={handleHelp}
              activeOpacity={0.7}
            >
              <Ionicons name="help-circle" size={24} color="#E6C547" />
              <Text style={styles.helpButtonText}>Help</Text>
            </TouchableOpacity>
            
            <View style={styles.meetingProfileCard}>
              <LinearGradient
                colors={['#000000', '#1a1a1a']}
                style={styles.meetingCardGradient}
              >
                <View style={styles.meetingProfileHeader}>
                  <View style={styles.photoPlaceholder}>
                    <Ionicons name="person" size={60} color="#E6C547" />
                  </View>
                  <View style={styles.meetingProfileInfo}>
                    <Text style={[styles.meetingProfileName, { color: colors.text }]}>
                      {meetingProfile.name}, {meetingProfile.age}
                    </Text>
                    <Text style={[styles.meetingProfileDistance, { color: colors.textSecondary }]}>
                      {meetingProfile.distance} • {meetingProfile.lastActive}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.meetingProfileBio, { color: colors.text }]}>
                  {meetingProfile.bio}
                </Text>
                
                <View style={styles.interestsContainer}>
                  <Text style={[styles.interestsTitle, { color: colors.text }]}>Interests:</Text>
                  <View style={styles.interestsList}>
                    {meetingProfile.interests.map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </LinearGradient>
            </View>
            
            {/* Meeting Timer - Only show when timer is active */}
            {meetingTimeLeft > 0 && (
              <View style={styles.meetingTimer}>
                <Text style={[styles.meetingTimerText, { color: colors.text }]}>
                  Meeting Time: {meetingTimeLeft}s
                </Text>
                <Text style={[styles.meetingSubtext, { color: colors.textSecondary }]}>
                  Get to know each other!
                </Text>
              </View>
            )}
            
            {/* Timer Complete Message */}
            {meetingTimeLeft === 0 && (
              <View style={styles.meetingTimer}>
                <Text style={[styles.meetingTimerText, { color: colors.text }]}>
                  Meeting Time Complete!
                </Text>
                <Text style={[styles.meetingSubtext, { color: colors.textSecondary }]}>
                  You can now go back to continue swiping
                </Text>
              </View>
            )}
          </View>
        )}
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
    alignItems: 'center',
    marginBottom: 48,
    marginTop: 60,
    width: '100%',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: -60,
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
  noMoreActions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
    width: '100%',
    maxWidth: 400,
  },
  noMoreActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  noMoreButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  noMoreButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  topRightButtons: {
    position: 'absolute',
    top: 5,
    right: 20,
    flexDirection: 'row',
    gap: 15,
    zIndex: 999,
  },
  profileActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 85,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  rejectedButton: {
    borderColor: '#FF6B6B',
  },
  likedButton: {
    borderColor: '#4ECDC4',
  },
  profileActionButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  helpButtonMeeting: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    borderWidth: 2,
    borderColor: '#E6C547',
    zIndex: 10,
  },
  helpButtonText: {
    color: '#E6C547',
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  meetingModeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  meetingProfileCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    width: '100%',
    maxWidth: 350,
  },
  meetingCardGradient: {
    padding: 25,
  },
  meetingProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  meetingProfileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  meetingProfileName: {
    fontSize: 22,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  meetingProfileDistance: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  meetingProfileBio: {
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 22,
    marginBottom: 20,
  },
  meetingTimer: {
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.3)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  meetingTimerText: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  meetingSubtext: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  meetingHeaderInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingHeaderText: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#E6C547',
  },
  disabledBackButton: {
    opacity: 0.6,
  },
  disabledBackButtonText: {
    color: '#666666',
  },
  meetingWarningContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderColor: '#FF6B6B',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  meetingWarningText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CheckInScreen;