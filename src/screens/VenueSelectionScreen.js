import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const VenueSelectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { venues } = route.params;

  const handleVenueSelect = (venue) => {
    navigation.navigate('CheckIn', { venueId: venue.id });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
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
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#E6C547" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>Select Venue</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.subtitle}>
              You're within 100 feet of {venues.length} venue{venues.length > 1 ? 's' : ''}. 
              Which one are you checking into?
            </Text>

            <View style={styles.venuesList}>
              {venues.map((venue) => (
                <TouchableOpacity
                  key={venue.id}
                  style={styles.venueCard}
                  onPress={() => handleVenueSelect(venue)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#2a2a2a', '#1a1a1a']}
                    style={styles.venueCardGradient}
                  >
                    <View style={styles.venueInfo}>
                      <Text style={styles.venueName}>{venue.name}</Text>
                      <Text style={styles.venueAddress}>{venue.address}</Text>
                      <Text style={styles.venueType}>{venue.type}</Text>
                      {venue.musicType && (
                        <Text style={styles.venueMusic}>🎵 {venue.musicType}</Text>
                      )}
                      {venue.vibe && (
                        <Text style={styles.venueVibe}>✨ {venue.vibe}</Text>
                      )}
                    </View>
                    <View style={styles.venueArrow}>
                      <Ionicons name="chevron-forward" size={20} color="#E6C547" />
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A0D0F',
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6C547',
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
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#E6C547',
    marginLeft: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    color: '#E6C547',
    textAlign: 'center',
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
    color: '#F5F5DC',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  venuesList: {
    gap: 16,
  },
  venueCard: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E6C547',
  },
  venueCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  venueInfo: {
    flex: 1,
  },
  venueName: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    color: '#E6C547',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginBottom: 4,
  },
  venueType: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#E6C547',
    marginBottom: 2,
  },
  venueMusic: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginBottom: 2,
  },
  venueVibe: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
  },
  venueArrow: {
    marginLeft: 12,
  },
});

export default VenueSelectionScreen;
