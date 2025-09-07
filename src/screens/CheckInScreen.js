import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Switch from '../components/ui/Switch';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { venueApi, checkInApi } from '../utils/api';

const CheckInScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();

  const { venueId } = route.params;
  const [mode, setMode] = useState('dating');
  const [aiRecommendations, setAiRecommendations] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      const response = await venueApi.getVenue(venueId);
      return response.json();
    },
    enabled: !!venueId,
    onError: (error) => {
      Alert.alert('Error', 'Failed to load venue details. Please try again.');
    },
  });

  const { data: currentCheckIn } = useQuery({
    queryKey: ['currentCheckIn'],
    queryFn: async () => {
      const response = await checkInApi.getCurrentCheckIn();
      if (response.ok) {
        return response.json();
      }
      return null;
    },
    retry: false,
  });

  const checkInMutation = useMutation({
    mutationFn: async (data) => {
      const response = await checkInApi.checkIn(data);
      return response.json();
    },
    onSuccess: () => {
      Alert.alert('Success', `You're now checked in at ${venue?.name}. Time to see who else is here!`);
      queryClient.invalidateQueries({ queryKey: ['currentCheckIn'] });
      navigation.navigate('ProfileBrowsing', { venueId });
    },
    onError: (error) => {
      Alert.alert('Error', 'Unable to check in at this venue. Please try again.');
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (data) => {
      const response = await checkInApi.checkOut(data);
      return response.json();
    },
    onSuccess: () => {
      Alert.alert('Success', "You've been checked out from your previous venue.");
      queryClient.invalidateQueries({ queryKey: ['currentCheckIn'] });
    },
  });

  // Auto check-out from previous venue if user is already checked in somewhere else
  useEffect(() => {
    if (currentCheckIn && currentCheckIn.venueId !== venueId) {
      checkOutMutation.mutate({ venueId: currentCheckIn.venueId });
    }
  }, [currentCheckIn, venueId]);

  // Get user's current location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission denied. Check-in will work without location verification.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Location error:', error);
        setLocationError('Unable to get your location. Check-in will work without location verification.');
      }
    };

    getLocation();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const isWithinRange = () => {
    if (!userLocation || !venue?.latitude || !venue?.longitude) return true;
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      parseFloat(venue.latitude),
      parseFloat(venue.longitude)
    );
    return distance <= 0.1; // Within 0.1 miles
  };

  const handleCheckIn = () => {
    checkInMutation.mutate({
      venueId,
      mode,
      aiRecommendations,
    });
  };

  const handleGoBack = () => {
    navigation.navigate('VenueDiscovery');
  };

  if (venueLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading venue...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!venue) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorIcon, { color: colors.destructive }]}>⚠️</Text>
          <Text style={[styles.errorText, { color: colors.text }]}>Venue not found</Text>
          <Button title="Back to Venues" onPress={handleGoBack} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.venueInfo}>
            <Text style={[styles.venueName, { color: colors.secondary }]}>
              {venue.name}
            </Text>
            <Text style={[styles.venueAddress, { color: colors.textSecondary }]}>
              {venue.address}
            </Text>
          </View>
          <Button
            title="←"
            onPress={handleGoBack}
            variant="ghost"
            size="small"
            style={styles.backButton}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Check In Section */}
          <View style={styles.checkInSection}>
            <View style={styles.checkInIcon}>
              <Text style={styles.checkInIconText}>📍</Text>
            </View>
            <Text style={[styles.checkInTitle, { color: colors.text }]}>
              You're here!
            </Text>
            <Text style={[styles.checkInDescription, { color: colors.textSecondary }]}>
              Check in to see who else is looking to connect
            </Text>

            {/* Location Status */}
            <Card style={[styles.locationCard, { backgroundColor: colors.muted + '30' }]}>
              <View style={styles.locationStatus}>
                {userLocation ? (
                  isWithinRange() ? (
                    <>
                      <Text style={[styles.statusIcon, { color: '#10B981' }]}>✅</Text>
                      <Text style={[styles.statusText, { color: colors.text }]}>
                        Location verified - you're at the venue!
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.statusIcon, { color: '#F59E0B' }]}>⚠️</Text>
                      <Text style={[styles.statusText, { color: colors.text }]}>
                        You seem far from this venue. Get closer to check in.
                      </Text>
                    </>
                  )
                ) : locationError ? (
                  <>
                    <Text style={[styles.statusIcon, { color: '#3B82F6' }]}>ℹ️</Text>
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                      {locationError}
                    </Text>
                  </>
                ) : (
                  <>
                    <ActivityIndicator size="small" color={colors.secondary} />
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                      Getting your location...
                    </Text>
                  </>
                )}
              </View>
            </Card>

            <Button
              title={
                checkInMutation.isPending
                  ? 'Checking In...'
                  : !isWithinRange() && userLocation
                  ? 'Get Closer to Check In'
                  : 'Check In'
              }
              onPress={handleCheckIn}
              disabled={checkInMutation.isPending || (!isWithinRange() && userLocation)}
              loading={checkInMutation.isPending}
              style={styles.checkInButton}
              icon={checkInMutation.isPending ? null : '✅'}
            />
          </View>

          {/* Mode Selection */}
          <Card style={styles.modeCard}>
            <Text style={[styles.modeTitle, { color: colors.text }]}>
              What are you looking for?
            </Text>
            <View style={styles.modeButtons}>
              <Button
                title="Dating"
                onPress={() => setMode('dating')}
                variant={mode === 'dating' ? 'primary' : 'secondary'}
                style={[
                  styles.modeButton,
                  mode === 'dating' && { backgroundColor: colors.primary },
                ]}
                icon="❤️"
              />
              <Button
                title="Friends"
                onPress={() => setMode('friends')}
                variant={mode === 'friends' ? 'primary' : 'secondary'}
                style={[
                  styles.modeButton,
                  mode === 'friends' && { backgroundColor: colors.primary },
                ]}
                icon="👥"
              />
            </View>
          </Card>

          {/* AI Recommendations Toggle */}
          <Card style={styles.aiCard}>
            <View style={styles.aiContent}>
              <View style={styles.aiText}>
                <Text style={[styles.aiTitle, { color: colors.text }]}>
                  Smart Recommendations
                </Text>
                <Text style={[styles.aiDescription, { color: colors.textSecondary }]}>
                  Use AI to prioritize compatible matches
                </Text>
              </View>
              <Switch
                value={aiRecommendations}
                onValueChange={setAiRecommendations}
              />
            </View>
          </Card>

          {/* Venue Info */}
          <Card style={styles.venueInfoCard}>
            <View style={styles.venueStats}>
              <View style={styles.venueStat}>
                <Text style={[styles.venueStatIcon, { color: colors.accent }]}>🔥</Text>
                <Text style={[styles.venueStatText, { color: colors.text }]}>
                  <Text style={{ color: colors.accent, fontWeight: 'bold' }}>
                    {venue.currentUsers || 0}
                  </Text> people currently here
                </Text>
              </View>
              {venue.description && (
                <Text style={[styles.venueDescription, { color: colors.textSecondary }]}>
                  {venue.description}
                </Text>
              )}
              <View style={styles.venueTags}>
                {venue.venueType && (
                  <Text style={[styles.venueTag, { color: colors.textSecondary }]}>
                    {venue.venueType.replace('_', ' ')}
                  </Text>
                )}
                {venue.musicType && (
                  <Text style={[styles.venueTag, { color: colors.textSecondary }]}>
                    {venue.musicType} Music
                  </Text>
                )}
                {venue.vibe && (
                  <Text style={[styles.venueTag, { color: colors.textSecondary }]}>
                    {venue.vibe} Vibe
                  </Text>
                )}
              </View>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  venueAddress: {
    fontSize: 14,
    marginTop: 2,
  },
  backButton: {
    paddingHorizontal: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  checkInSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  checkInIcon: {
    marginBottom: 16,
  },
  checkInIconText: {
    fontSize: 32,
  },
  checkInTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  checkInDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  locationCard: {
    marginBottom: 24,
    padding: 12,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
  },
  checkInButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  modeCard: {
    marginBottom: 16,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
  },
  aiCard: {
    marginBottom: 16,
  },
  aiContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiText: {
    flex: 1,
    marginRight: 16,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  aiDescription: {
    fontSize: 14,
  },
  venueInfoCard: {
    marginBottom: 24,
  },
  venueStats: {
    alignItems: 'center',
  },
  venueStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueStatIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  venueStatText: {
    fontSize: 14,
  },
  venueDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  venueTags: {
    flexDirection: 'row',
    gap: 16,
  },
  venueTag: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});

export default CheckInScreen;
