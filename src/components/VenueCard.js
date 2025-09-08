import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from './ui/Card';
import { useTheme } from '../contexts/ThemeContext';

const VenueCard = ({ venue, onSelect, userLocation }) => {
  const { colors } = useTheme();

  // Use real distance if available, otherwise show placeholder
  const distance = venue.distance ? venue.distance.toFixed(1) : 'N/A';

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.cardGradient}
      >
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.name}>
              {venue.name}
            </Text>
            <Text style={styles.description}>
              {venue.description || 'Great atmosphere and cocktails'}
            </Text>
            
            <View style={styles.addressContainer}>
              <Ionicons name="location" size={14} color="#E6C547" />
              <Text style={styles.address}>
                {venue.address}
              </Text>
            </View>
            
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Ionicons name="flame" size={16} color="#E6C547" />
                <Text style={styles.detailText}>
                  {venue.currentUsers || 0} here now
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="walk" size={16} color="#E6C547" />
                <Text style={styles.detailText}>
                  {distance} miles
                </Text>
              </View>
            </View>
            
            {venue.type && (
              <View style={styles.venueTypeContainer}>
                <Ionicons name="musical-notes" size={16} color="#E6C547" />
                <Text style={styles.venueTypeText}>
                  {venue.type.replace('_', ' ')}
                </Text>
              </View>
            )}

            {(venue.musicType || venue.vibe) && (
              <View style={styles.tags}>
                {venue.musicType && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {venue.musicType} music
                    </Text>
                  </View>
                )}
                {venue.vibe && (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>
                      {venue.vibe} vibe
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
          
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={onSelect}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#E6C547', '#D4AF37', '#B8860B']}
              style={styles.directionsButtonGradient}
            >
              <Ionicons name="navigate" size={20} color="#000000" />
              <Text style={styles.directionsButtonText}>
                Directions
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6C547',
    overflow: 'hidden',
    shadowColor: '#E6C547',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardGradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#E6C547',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginBottom: 8,
    lineHeight: 20,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#E6C547',
    marginLeft: 6,
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginLeft: 4,
    fontWeight: '500',
  },
  venueTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueTypeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginLeft: 4,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6C547',
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    color: '#E6C547',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  directionsButton: {
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 100,
  },
  directionsButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  directionsButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 6,
  },
});

export default VenueCard;

