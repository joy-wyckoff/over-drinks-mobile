import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Card from './ui/Card';
import Button from './ui/Button';
import { useTheme } from '../contexts/ThemeContext';

const ProfileCard = ({ user, profile, onMeetAtBar, onPass, isLoading = false }) => {
  const { colors } = useTheme();

  // Calculate age from birthday
  const age = profile.birthday 
    ? Math.floor((Date.now() - new Date(profile.birthday).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  const displayName = user.firstName 
    ? `${user.firstName}${age ? `, ${age}` : ''}`
    : profile.username;

  const interestEmojis = {
    // Nightlife & Entertainment
    jazz: '🎷', cocktails: '🍸', dancing: '💃', wine: '🍷', 'live-music': '🎵', 
    whiskey: '🥃', karaoke: '🎤', clubbing: '🕺', concerts: '🎸', comedy: '😂', trivia: '🧠',
    
    // Arts & Culture
    art: '🎨', literature: '📚', museums: '🏛️', theater: '🎭', photography: '📷', 
    writing: '✍️', poetry: '📝', film: '🎬', vintage: '⏰',
    
    // Food & Drink
    cooking: '👨‍🍳', foodie: '🍽️', coffee: '☕', 'craft-beer': '🍺', brunch: '🥞', baking: '🧁',
    
    // Lifestyle
    travel: '✈️', fashion: '👗', wellness: '🧘', spirituality: '🙏', astrology: '⭐', 
    meditation: '🧘‍♀️', yoga: '🧘‍♂️',
    
    // Social & Personality
    socializing: '🗣️', networking: '🤝', debates: '💬', volunteering: '❤️', activism: '✊',
    
    // Hobbies
    reading: '📖', gaming: '🎮', 'board-games': '🎲', chess: '♟️', collecting: '🏺', 
    crafts: '🧵', gardening: '🌱',
    
    // Music & Performance
    music: '🎶', singing: '🎤', piano: '🎹', guitar: '🎸', violin: '🎻',
    
    // Business & Career
    entrepreneurship: '💼', investing: '📈', 'real-estate': '🏠', technology: '💻', crypto: '₿',
  };

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        {/* Profile Photo */}
        <View style={[styles.photoContainer, { borderColor: colors.border }]}>
          {user.profileImageUrl ? (
            <Image 
              source={{ uri: user.profileImageUrl }} 
              style={styles.photo}
            />
          ) : (
            <Text style={[styles.photoPlaceholder, { color: colors.textSecondary }]}>
              👤
            </Text>
          )}
        </View>
        
        {/* Profile Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>
              {displayName}
            </Text>
            <TouchableOpacity style={styles.infoButton}>
              <Text style={[styles.infoIcon, { color: colors.accent }]}>ℹ️</Text>
            </TouchableOpacity>
          </View>
          
          {profile.bio && (
            <Text style={[styles.bio, { color: colors.textSecondary }]}>
              {profile.bio}
            </Text>
          )}
          
          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <View style={styles.interests}>
              {profile.interests.slice(0, 3).map((interest) => (
                <View 
                  key={interest}
                  style={[styles.interestTag, { backgroundColor: colors.secondary + '20' }]}
                >
                  <Text style={[styles.interestText, { color: colors.secondary }]}>
                    {interestEmojis[interest] || '•'} {interest.replace('-', ' ')}
                  </Text>
                </View>
              ))}
              {profile.interests.length > 3 && (
                <View style={[styles.interestTag, { backgroundColor: colors.secondary + '20' }]}>
                  <Text style={[styles.interestText, { color: colors.secondary }]}>
                    +{profile.interests.length - 3} more
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button 
              title="Meet at Bar"
              onPress={onMeetAtBar}
              disabled={isLoading}
              loading={isLoading}
              style={styles.meetButton}
              icon="❤️"
            />
            <Button 
              title="Pass"
              onPress={onPass}
              variant="secondary"
              style={styles.passButton}
            />
          </View>
        </View>
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
    alignItems: 'flex-start',
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  infoIcon: {
    fontSize: 16,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  interests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  interestTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  meetButton: {
    flex: 1,
    paddingHorizontal: 16,
  },
  passButton: {
    paddingHorizontal: 16,
  },
});

export default ProfileCard;
