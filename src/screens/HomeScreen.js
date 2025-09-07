import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { profileApi } from '../utils/api';

const HomeScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await profileApi.getProfile();
      return response.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (!profileLoading && profile) {
      // User has profile, go to venue discovery
      navigation.navigate('VenueDiscovery');
    } else if (!profileLoading && !profile) {
      // User needs to create profile
      navigation.navigate('ProfileCreation');
    }
  }, [profile, profileLoading, navigation]);

  const handleLogout = async () => {
    await logout();
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
              Welcome Back
            </Text>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {user?.firstName ? `Hello, ${user.firstName}!` : 'Ready for another night out?'}
            </Text>
          </View>

          {/* Status Card */}
          <Card style={styles.statusCard}>
            <View style={styles.statusContent}>
              <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
                <Text style={styles.statusIcon}>🍸</Text>
              </View>
              <View style={styles.statusText}>
                <Text style={[styles.statusTitle, { color: colors.text }]}>
                  Ready to Mingle?
                </Text>
                <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
                  {profile ? 'Your profile is complete. Time to find your scene!' : 'Complete your profile to start meeting people.'}
                </Text>
              </View>
              <Button
                title={profile ? 'Find Venues' : 'Complete Profile'}
                onPress={() => navigation.navigate(profile ? 'VenueDiscovery' : 'ProfileCreation')}
                style={styles.continueButton}
              />
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={styles.actions}>
            <Button
              title="Discover Venues"
              onPress={() => navigation.navigate('VenueDiscovery')}
              variant="secondary"
              style={[styles.actionButton, !profile && styles.disabledButton]}
              disabled={!profile}
            />
            
            <Button
              title={profile ? 'Edit Profile' : 'Create Profile'}
              onPress={() => navigation.navigate('ProfileCreation')}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>

          {/* Logout */}
          <View style={styles.logoutContainer}>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="ghost"
              style={styles.logoutButton}
            />
          </View>
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
  greeting: {
    fontSize: 16,
    textAlign: 'center',
  },
  statusCard: {
    marginBottom: 24,
  },
  statusContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 32,
  },
  statusText: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  continueButton: {
    width: '100%',
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  logoutContainer: {
    alignItems: 'center',
  },
  logoutButton: {
    paddingHorizontal: 24,
  },
});

export default HomeScreen;
