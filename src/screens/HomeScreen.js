import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

// Mock venue data - in a real app, this would come from an API
const mockVenues = [
  {
    id: 1,
    name: "The Velvet Room",
    distance: 0.2,
    vibe: "Upscale Cocktails",
    music: "Jazz & Blues",
    checkIns: 24,
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
    rating: 4.8,
    priceRange: "$$$",
    address: "123 Main St, Downtown"
  },
  {
    id: 2,
    name: "Prohibition Bar",
    distance: 0.4,
    vibe: "Speakeasy",
    music: "Live Piano",
    checkIns: 18,
    image: "https://images.unsplash.com/photo-1572116469696-31d0f8b4b8b8?w=400",
    rating: 4.6,
    priceRange: "$$",
    address: "456 Oak Ave, Historic District"
  },
  {
    id: 3,
    name: "Sky Lounge",
    distance: 0.8,
    vibe: "Rooftop",
    music: "Electronic",
    checkIns: 12,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
    rating: 4.4,
    priceRange: "$$$",
    address: "789 High St, Rooftop"
  },
  {
    id: 4,
    name: "Neon Nights",
    distance: 1.2,
    vibe: "Club",
    music: "Hip Hop",
    checkIns: 31,
    image: "https://images.unsplash.com/photo-1571266028243-e68f8570c0e5?w=400",
    rating: 4.2,
    priceRange: "$$",
    address: "321 Club St, Nightlife District"
  }
];

const musicFilters = [
  'All', 'Jazz & Blues', 'Live Piano', 'Electronic', 'Hip Hop', 'Rock', 'Pop', 'Classical'
];

const vibeFilters = [
  'All', 'Speakeasy', 'Upscale Cocktails', 'Rooftop', 'Club', 'Lounge', 'Bar', 'Pub'
];

const distanceOptions = [2, 5, 10, 15, 25];

const HomeScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(2);
  const [selectedMusicFilter, setSelectedMusicFilter] = useState('All');
  const [selectedVibeFilter, setSelectedVibeFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [venues, setVenues] = useState(mockVenues);
  const [recommendedVenues, setRecommendedVenues] = useState([]);

  // Filter venues based on search and filters
  useEffect(() => {
    let filtered = mockVenues.filter(venue => {
      const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           venue.vibe.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           venue.music.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDistance = venue.distance <= selectedDistance;
      const matchesMusic = selectedMusicFilter === 'All' || venue.music === selectedMusicFilter;
      const matchesVibe = selectedVibeFilter === 'All' || venue.vibe === selectedVibeFilter;
      
      return matchesSearch && matchesDistance && matchesMusic && matchesVibe;
    });

    // Sort by check-ins (most popular first)
    filtered.sort((a, b) => b.checkIns - a.checkIns);
    setVenues(filtered);
  }, [searchQuery, selectedDistance, selectedMusicFilter, selectedVibeFilter]);

  // Generate AI recommendations based on user profile
  useEffect(() => {
    if (user?.profile?.interests) {
      // Simple AI matching based on interests
      const userInterests = user.profile.interests;
      const recommended = mockVenues
        .filter(venue => {
          // Match based on interests and bio keywords
          const bioKeywords = user.profile.bio?.toLowerCase() || '';
          const interestKeywords = userInterests.join(' ').toLowerCase();
          const allKeywords = `${bioKeywords} ${interestKeywords}`;
          
          return allKeywords.includes(venue.music.toLowerCase()) ||
                 allKeywords.includes(venue.vibe.toLowerCase()) ||
                 allKeywords.includes('jazz') && venue.music.includes('Jazz') ||
                 allKeywords.includes('cocktail') && venue.vibe.includes('Cocktail');
        })
        .slice(0, 3); // Top 3 recommendations
      
      setRecommendedVenues(recommended);
    }
  }, [user]);

  const handleVenuePress = (venue) => {
    navigation.navigate('CheckIn', { venue });
  };

  const handleCheckInPress = () => {
    Alert.alert(
      'Check In',
      'Get within 100 feet of a venue to check in and start meeting people!',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Find Nearby Venues', onPress: () => navigation.navigate('VenueDiscovery') }
      ]
    );
  };

  const handleSettingsPress = () => {
    setShowSettingsModal(true);
  };

  const handleEditProfile = () => {
    setShowSettingsModal(false);
    navigation.navigate('ProfileCreation');
  };

  const handleLogout = () => {
    setShowSettingsModal(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const renderVenueCard = (venue, isRecommended = false) => (
    <Card key={venue.id} style={[styles.venueCard, isRecommended && styles.recommendedCard]}>
      <View style={styles.venueHeader}>
        <View style={styles.venueInfo}>
          <Text style={[styles.venueName, { color: colors.text }]}>{venue.name}</Text>
          <Text style={[styles.venueDetails, { color: colors.textSecondary }]}>
            {venue.distance} mi • {venue.vibe}
          </Text>
        </View>
        <View style={styles.checkInBadge}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={styles.checkInCount}>{venue.checkIns}</Text>
        </View>
      </View>
      
      <View style={styles.venueTags}>
        <View style={[styles.musicTag, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.tagText, { color: colors.primaryForeground }]}>
            {venue.music}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.directionsButton, { backgroundColor: colors.muted }]}
        onPress={() => handleVenuePress(venue)}
      >
        <Ionicons name="paper-plane" size={16} color={colors.text} />
        <Text style={[styles.directionsText, { color: colors.text }]}>Directions</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft} />
              <Text style={[styles.title, { color: colors.secondary }]}>Over Drinks</Text>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={[styles.headerIcon, { backgroundColor: colors.muted }]}
                  onPress={handleSettingsPress}
                >
                  <Ionicons name="settings" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.headerLine}>
              <Ionicons name="wine" size={20} color="#e11d48" />
              <View style={[styles.line, { backgroundColor: colors.secondary }]} />
              <View style={[styles.lineDot, { backgroundColor: colors.secondary }]} />
              <View style={[styles.line, { backgroundColor: colors.secondary }]} />
              <Ionicons name="wine" size={20} color="#e11d48" />
            </View>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Find your perfect evening companions
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search bars, clubs, lounges..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.secondary }]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons name="filter" size={16} color={colors.primaryForeground} />
              <Text style={[styles.filterText, { color: colors.primaryForeground }]}>Filters</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.distanceButton, { backgroundColor: colors.muted, borderColor: colors.border }]}
              onPress={() => {
                const currentIndex = distanceOptions.indexOf(selectedDistance);
                const nextIndex = (currentIndex + 1) % distanceOptions.length;
                setSelectedDistance(distanceOptions[nextIndex]);
              }}
            >
              <Ionicons name="location" size={16} color={colors.text} />
              <Text style={[styles.distanceText, { color: colors.text }]}>
                Within {selectedDistance} miles
              </Text>
            </TouchableOpacity>
          </View>

          {/* Filter Options */}
          {showFilters && (
            <Card style={styles.filtersCard}>
              <Text style={[styles.filterTitle, { color: colors.text }]}>Music Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {musicFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedMusicFilter === filter ? colors.primary : colors.muted,
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => setSelectedMusicFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: selectedMusicFilter === filter ? colors.primaryForeground : colors.text,
                        }
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <Text style={[styles.filterTitle, { color: colors.text }]}>Vibe</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {vibeFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: selectedVibeFilter === filter ? colors.primary : colors.muted,
                        borderColor: colors.border,
                      }
                    ]}
                    onPress={() => setSelectedVibeFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: selectedVibeFilter === filter ? colors.primaryForeground : colors.text,
                        }
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          )}

          {/* Tonight's Hotspots */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Tonight's Hotspots</Text>
            <View style={styles.venuesList}>
              {venues.map(venue => renderVenueCard(venue))}
            </View>
          </View>

          {/* Recommended for You */}
          {recommendedVenues.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.secondary }]}>Recommended for You</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Based on your interests and preferences
              </Text>
              <View style={styles.venuesList}>
                {recommendedVenues.map(venue => renderVenueCard(venue, true))}
              </View>
            </View>
          )}

          {/* Check In Section */}
          <View style={styles.checkInSection}>
            <Text style={[styles.checkInTitle, { color: colors.text }]}>Ready to check in?</Text>
            <Text style={[styles.checkInDescription, { color: colors.textSecondary }]}>
              Get within 100 feet of a venue to check in and start meeting people
            </Text>
            <Button
              title="Check in when near venue"
              onPress={handleCheckInPress}
              style={styles.checkInButton}
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.settingsModal, { backgroundColor: colors.background }]}>
            <View style={styles.settingsHeader}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>Settings</Text>
              <TouchableOpacity
                onPress={() => setShowSettingsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingsContent}>
              <TouchableOpacity
                style={[styles.settingsItem, { borderBottomColor: colors.border }]}
                onPress={handleEditProfile}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="person" size={20} color={colors.text} />
                  <Text style={[styles.settingsItemText, { color: colors.text }]}>Edit Profile</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.settingsItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setShowSettingsModal(false);
                  Alert.alert('Notifications', 'Notification settings coming soon!');
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="notifications" size={20} color={colors.text} />
                  <Text style={[styles.settingsItemText, { color: colors.text }]}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.settingsItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setShowSettingsModal(false);
                  Alert.alert('Privacy', 'Privacy settings coming soon!');
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="shield-checkmark" size={20} color={colors.text} />
                  <Text style={[styles.settingsItemText, { color: colors.text }]}>Privacy</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.settingsItem, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setShowSettingsModal(false);
                  Alert.alert('Help', 'Help & Support coming soon!');
                }}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="help-circle" size={20} color={colors.text} />
                  <Text style={[styles.settingsItemText, { color: colors.text }]}>Help & Support</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.settingsItem, { borderBottomColor: 'transparent' }]}
                onPress={handleLogout}
              >
                <View style={styles.settingsItemLeft}>
                  <Ionicons name="log-out" size={20} color="#ef4444" />
                  <Text style={[styles.settingsItemText, { color: '#ef4444' }]}>Logout</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  headerLeft: {
    width: 80, // Same width as headerRight to center the title
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
    width: 80,
    justifyContent: 'flex-end',
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  line: {
    height: 2,
    width: 40,
    marginHorizontal: 8,
  },
  lineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  distanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filtersCard: {
    padding: 16,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  venuesList: {
    gap: 12,
  },
  venueCard: {
    padding: 16,
  },
  recommendedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  venueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  venueDetails: {
    fontSize: 14,
  },
  checkInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fireEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  checkInCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  venueTags: {
    marginBottom: 12,
  },
  musicTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  directionsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  checkInSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 12,
    marginTop: 8,
  },
  checkInTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  checkInDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  checkInButton: {
    width: '100%',
  },
  // Settings Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsContent: {
    paddingTop: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
});

export default HomeScreen;