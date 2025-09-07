import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTheme } from '../contexts/ThemeContext';

const VenueCard = ({ venue, onSelect }) => {
  const { colors } = useTheme();

  // Calculate distance placeholder (in real app, would use geolocation)
  const distance = Math.random() * 2 + 0.1; // Random distance between 0.1-2.1 miles

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>
            {venue.name}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {venue.description || 'Great atmosphere and cocktails'}
          </Text>
          
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailIcon, { color: colors.accent }]}>🔥</Text>
              <Text style={[styles.detailText, { color: colors.accent }]}>
                {venue.currentUsers || 0}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {distance.toFixed(1)} miles
              </Text>
            </View>
            {venue.venueType && (
              <View style={styles.detailItem}>
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {venue.venueType.replace('_', ' ')}
                </Text>
              </View>
            )}
          </View>

          {(venue.musicType || venue.vibe) && (
            <View style={styles.tags}>
              {venue.musicType && (
                <Text style={[styles.tag, { color: colors.textSecondary }]}>
                  {venue.musicType} music
                </Text>
              )}
              {venue.vibe && (
                <Text style={[styles.tag, { color: colors.textSecondary }]}>
                  {venue.vibe} vibe
                </Text>
              )}
            </View>
          )}
        </View>
        
        <Button
          title="Go"
          onPress={onSelect}
          style={styles.goButton}
          icon="🧭"
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  goButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
  },
});

export default VenueCard;
