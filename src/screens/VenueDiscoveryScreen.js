import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import VenueCard from '../components/VenueCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { venueApi } from '../utils/api';

const filters = [
  { value: 'all', label: 'All' },
  { value: 'jazz_club', label: 'Jazz Clubs' },
  { value: 'cocktail_bar', label: 'Cocktail Bars' },
  { value: 'dance_club', label: 'Dance Clubs' },
  { value: 'speakeasy', label: 'Speakeasy' },
];

const VenueDiscoveryScreen = () => {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [friendMode, setFriendMode] = useState(false);

  // Initialize venues on first load
  const initializeVenuesMutation = useMutation({
    mutationFn: async () => {
      const response = await venueApi.initializeVenues();
      return response.json();
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to initialize venues. Please try again.');
    },
  });

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['venues', activeFilter],
    queryFn: async () => {
      const response = await venueApi.getVenues(activeFilter === 'all' ? null : activeFilter);
      return response.json();
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to load venues. Please try again.');
    },
  });

  // Initialize venues if none exist
  useEffect(() => {
    if (!isLoading && venues.length === 0) {
      initializeVenuesMutation.mutate();
    }
  }, [venues.length, isLoading]);

  // Refresh venues after initialization
  useEffect(() => {
    if (initializeVenuesMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    }
  }, [initializeVenuesMutation.isSuccess, queryClient]);

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVenueSelect = (venueId) => {
    // Mock opening directions (in real app, would open maps)
    Alert.alert('Directions', 'Opening directions in your maps app...');
    
    // Navigate to check-in after a short delay
    setTimeout(() => {
      navigation.navigate('CheckIn', { venueId });
    }, 1000);
  };

  const handleLogout = async () => {
    await logout();
  };

  const recommendedVenues = filteredVenues
    .sort((a, b) => (b.currentUsers || 0) - (a.currentUsers || 0))
    .slice(0, 3);

  const nearbyVenues = filteredVenues.filter(venue => !recommendedVenues.includes(venue));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.secondary }]}>
            Find Your Scene
          </Text>
          <View style={styles.headerActions}>
            <Button
              title={friendMode ? 'Friend Mode' : 'Dating Mode'}
              onPress={() => setFriendMode(!friendMode)}
              variant={friendMode ? 'primary' : 'ghost'}
              size="small"
              style={[styles.modeButton, friendMode && { backgroundColor: colors.accent }]}
            />
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={[styles.headerButtonText, { color: colors.textSecondary }]}>👤</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleLogout}
            >
              <Text style={[styles.headerButtonText, { color: colors.textSecondary }]}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.muted,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Search bars & clubs..."
              placeholderTextColor={colors.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <Text style={[styles.searchIcon, { color: colors.textSecondary }]}>🔍</Text>
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
          >
            {filters.map((filter) => (
              <Button
                key={filter.value}
                title={filter.label}
                onPress={() => setActiveFilter(filter.value)}
                variant={activeFilter === filter.value ? 'primary' : 'secondary'}
                size="small"
                style={[
                  styles.filterButton,
                  activeFilter === filter.value && {
                    backgroundColor: colors.secondary,
                  },
                ]}
              />
            ))}
          </ScrollView>

          {isLoading || initializeVenuesMutation.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {initializeVenuesMutation.isPending ? 'Setting up venues...' : 'Loading venues...'}
              </Text>
            </View>
          ) : (
            <>
              {/* Recommendations */}
              {recommendedVenues.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Recommended for You
                  </Text>
                  <View style={styles.venuesList}>
                    {recommendedVenues.map((venue) => (
                      <VenueCard
                        key={venue.id}
                        venue={venue}
                        onSelect={() => handleVenueSelect(venue.id)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Nearby Venues */}
              {nearbyVenues.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Nearby Venues
                  </Text>
                  <View style={styles.venuesList}>
                    {nearbyVenues.map((venue) => (
                      <VenueCard
                        key={venue.id}
                        venue={venue}
                        onSelect={() => handleVenueSelect(venue.id)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {filteredVenues.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyIcon, { color: colors.textSecondary }]}>🔍</Text>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No venues found matching your search.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    fontSize: 20,
  },
  filtersContainer: {
    marginBottom: 24,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterButton: {
    marginRight: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  venuesList: {
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VenueDiscoveryScreen;
