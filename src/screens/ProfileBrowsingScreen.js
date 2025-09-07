import React, { useState } from 'react';
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
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProfileCard from '../components/ProfileCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { venueApi, matchApi } from '../utils/api';

const ProfileBrowsingScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const queryClient = useQueryClient();

  const { venueId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ['venue', venueId],
    queryFn: async () => {
      const response = await venueApi.getVenue(venueId);
      return response.json();
    },
    enabled: !!venueId,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['venueUsers', venueId],
    queryFn: async () => {
      const response = await venueApi.getUsersAtVenue(venueId);
      return response.json();
    },
    enabled: !!venueId,
    onError: (error) => {
      Alert.alert('Error', 'Failed to load users at this venue. Please try again.');
    },
  });

  const matchMutation = useMutation({
    mutationFn: async (data) => {
      const response = await matchApi.createMatch(data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.isMatch) {
        Alert.alert('🎉 It\'s a Match!', 'You both want to meet! Time to grab a drink together.');
      } else {
        Alert.alert('Request Sent', 'Your interest has been sent. If they\'re interested too, you\'ll both be notified!');
      }
      // Move to next profile
      setCurrentIndex(prev => prev + 1);
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to send request. Please try again.');
    },
  });

  const handleMeetAtBar = (targetUserId) => {
    matchMutation.mutate({
      targetId: targetUserId,
      venueId,
    });
  };

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleGoBack = () => {
    navigation.navigate('VenueDiscovery');
  };

  const currentUser = users[currentIndex];

  if (venueLoading || usersLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading profiles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (users.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.secondary }]}>
              {venue?.name || 'Venue'}
            </Text>
            <Button
              title="←"
              onPress={handleGoBack}
              variant="ghost"
              size="small"
              style={styles.backButton}
            />
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>👥</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No one here yet
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Be the first to check in and start meeting people!
          </Text>
          <Button
            title="Back to Venues"
            onPress={handleGoBack}
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= users.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.secondary }]}>
              {venue?.name || 'Venue'}
            </Text>
            <Button
              title="←"
              onPress={handleGoBack}
              variant="ghost"
              size="small"
              style={styles.backButton}
            />
          </View>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>✨</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            That's everyone!
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            You've seen all the people at this venue. Check back later for new faces!
          </Text>
          <Button
            title="Back to Venues"
            onPress={handleGoBack}
            style={styles.emptyButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: colors.secondary }]}>
              {venue?.name || 'Venue'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {currentIndex + 1} of {users.length} people
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
          <ProfileCard
            user={currentUser.user}
            profile={currentUser.profile}
            onMeetAtBar={() => handleMeetAtBar(currentUser.user.id)}
            onPass={handlePass}
            isLoading={matchMutation.isPending}
          />

          {/* Venue Info */}
          <Card style={styles.venueInfoCard}>
            <View style={styles.venueInfo}>
              <Text style={[styles.venueTitle, { color: colors.text }]}>
                You're at {venue?.name}
              </Text>
              <Text style={[styles.venueDescription, { color: colors.textSecondary }]}>
                {venue?.description || 'Great atmosphere and cocktails'}
              </Text>
              <View style={styles.venueStats}>
                <View style={styles.venueStat}>
                  <Text style={[styles.venueStatIcon, { color: colors.accent }]}>🔥</Text>
                  <Text style={[styles.venueStatText, { color: colors.text }]}>
                    <Text style={{ color: colors.accent, fontWeight: 'bold' }}>
                      {venue?.currentUsers || 0}
                    </Text> people here
                  </Text>
                </View>
                <View style={styles.venueStat}>
                  <Text style={[styles.venueStatIcon, { color: colors.textSecondary }]}>📍</Text>
                  <Text style={[styles.venueStatText, { color: colors.textSecondary }]}>
                    {venue?.address}
                  </Text>
                </View>
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
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
  },
  venueInfoCard: {
    marginTop: 16,
  },
  venueInfo: {
    alignItems: 'center',
  },
  venueTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  venueDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  venueStats: {
    gap: 8,
  },
  venueStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueStatIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  venueStatText: {
    fontSize: 14,
  },
});

export default ProfileBrowsingScreen;
