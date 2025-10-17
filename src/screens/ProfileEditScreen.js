import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width: screenWidth } = Dimensions.get('window');

// Interests organized by category
const interestsByCategory = [
  {
    category: 'Going Out',
    interests: [
  { value: 'jazz', label: '🎷 Jazz Music', emoji: '🎷' },
  { value: 'cocktails', label: '🍸 Cocktails', emoji: '🍸' },
  { value: 'dancing', label: '💃 Dancing', emoji: '💃' },
  { value: 'wine', label: '🍷 Wine', emoji: '🍷' },
  { value: 'live-music', label: '🎵 Live Music', emoji: '🎵' },
  { value: 'whiskey', label: '🥃 Whiskey', emoji: '🥃' },
  { value: 'karaoke', label: '🎤 Karaoke', emoji: '🎤' },
  { value: 'clubbing', label: '🕺 Clubbing', emoji: '🕺' },
  { value: 'concerts', label: '🎸 Concerts', emoji: '🎸' },
  { value: 'comedy', label: '😂 Comedy Shows', emoji: '😂' },
  { value: 'trivia', label: '🧠 Trivia Nights', emoji: '🧠' },
  { value: 'bars', label: '🍺 Bar Hopping', emoji: '🍺' },
  { value: 'rooftop-bars', label: '🌆 Rooftop Bars', emoji: '🌆' },
  { value: 'dive-bars', label: '🍻 Dive Bars', emoji: '🍻' },
  { value: 'speakeasy', label: '🚪 Speakeasies', emoji: '🚪' },
  { value: 'nightlife', label: '🌃 Nightlife', emoji: '🌃' },
  { value: 'festivals', label: '🎪 Festivals', emoji: '🎪' },
  { value: 'raves', label: '🎉 Raves', emoji: '🎉' },
  { value: 'pool-bars', label: '🎱 Pool/Billiards', emoji: '🎱' },
    ]
  },
  {
    category: 'Arts & Culture',
    interests: [
      { value: 'art', label: '🎨 Art', emoji: '🎨' },
      { value: 'museums', label: '🏛️ Museums', emoji: '🏛️' },
      { value: 'theater', label: '🎭 Theater', emoji: '🎭' },
      { value: 'photography', label: '📷 Photography', emoji: '📷' },
      { value: 'writing', label: '✍️ Writing', emoji: '✍️' },
      { value: 'poetry', label: '📝 Poetry', emoji: '📝' },
      { value: 'vintage', label: '⏰ Vintage', emoji: '⏰' },
      { value: 'painting', label: '🖼️ Painting', emoji: '🖼️' },
      { value: 'drawing', label: '✏️ Drawing', emoji: '✏️' },
      { value: 'sculpture', label: '🗿 Sculpture', emoji: '🗿' },
      { value: 'galleries', label: '🖌️ Art Galleries', emoji: '🖌️' },
      { value: 'crafts', label: '🧶 Crafts', emoji: '🧶' },
      { value: 'pottery', label: '🏺 Pottery', emoji: '🏺' },
      { value: 'jewelry-making', label: '💍 Jewelry Making', emoji: '💍' },
    ]
  },
  {
    category: 'Film & TV',
    interests: [
      { value: 'film', label: '🎬 Film & Movies', emoji: '🎬' },
      { value: 'documentaries', label: '🎥 Documentaries', emoji: '🎥' },
      { value: 'horror-movies', label: '👻 Horror Movies', emoji: '👻' },
      { value: 'romantic-movies', label: '💕 Romantic Movies', emoji: '💕' },
      { value: 'action-movies', label: '💥 Action Movies', emoji: '💥' },
      { value: 'indie-films', label: '🎞️ Indie Films', emoji: '🎞️' },
      { value: 'tv-series', label: '📺 TV Series', emoji: '📺' },
      { value: 'anime', label: '⚡ Anime', emoji: '⚡' },
      { value: 'film-making', label: '🎬 Film Making', emoji: '🎬' },
    ]
  },
  {
    category: 'Music',
    interests: [
      { value: 'rock', label: '🎸 Rock Music', emoji: '🎸' },
      { value: 'pop', label: '🎤 Pop Music', emoji: '🎤' },
      { value: 'hip-hop', label: '🎧 Hip Hop', emoji: '🎧' },
      { value: 'electronic', label: '🎹 Electronic Music', emoji: '🎹' },
      { value: 'classical', label: '🎻 Classical Music', emoji: '🎻' },
      { value: 'country', label: '🤠 Country Music', emoji: '🤠' },
      { value: 'r&b', label: '🎵 R&B', emoji: '🎵' },
      { value: 'indie-music', label: '🎼 Indie Music', emoji: '🎼' },
      { value: 'singing', label: '🎙️ Singing', emoji: '🎙️' },
      { value: 'playing-instruments', label: '🎺 Playing Instruments', emoji: '🎺' },
      { value: 'guitar', label: '🎸 Guitar', emoji: '🎸' },
      { value: 'piano', label: '🎹 Piano', emoji: '🎹' },
      { value: 'dj-ing', label: '🎧 DJing', emoji: '🎧' },
      { value: 'music-production', label: '🎚️ Music Production', emoji: '🎚️' },
    ]
  },
  {
    category: 'Reading & Literature',
    interests: [
      { value: 'literature', label: '📚 Literature', emoji: '📚' },
      { value: 'reading', label: '📖 Reading', emoji: '📖' },
      { value: 'book-clubs', label: '📚 Book Clubs', emoji: '📚' },
      { value: 'fiction', label: '📕 Fiction', emoji: '📕' },
      { value: 'non-fiction', label: '📗 Non-Fiction', emoji: '📗' },
      { value: 'sci-fi', label: '🚀 Sci-Fi', emoji: '🚀' },
      { value: 'fantasy', label: '🐉 Fantasy', emoji: '🐉' },
      { value: 'mystery', label: '🔍 Mystery', emoji: '🔍' },
      { value: 'comics', label: '💬 Comics', emoji: '💬' },
      { value: 'graphic-novels', label: '📘 Graphic Novels', emoji: '📘' },
    ]
  },
  {
    category: 'Food & Drink',
    interests: [
      { value: 'cooking', label: '👨‍🍳 Cooking', emoji: '👨‍🍳' },
      { value: 'baking', label: '🧁 Baking', emoji: '🧁' },
      { value: 'foodie', label: '🍽️ Foodie', emoji: '🍽️' },
      { value: 'coffee', label: '☕ Coffee', emoji: '☕' },
      { value: 'tea', label: '🍵 Tea', emoji: '🍵' },
      { value: 'craft-beer', label: '🍺 Craft Beer', emoji: '🍺' },
      { value: 'wine-tasting', label: '🍷 Wine Tasting', emoji: '🍷' },
      { value: 'sushi', label: '🍣 Sushi', emoji: '🍣' },
      { value: 'pizza', label: '🍕 Pizza', emoji: '🍕' },
      { value: 'brunch', label: '🥞 Brunch', emoji: '🥞' },
      { value: 'vegan', label: '🥗 Vegan Food', emoji: '🥗' },
      { value: 'desserts', label: '🍰 Desserts', emoji: '🍰' },
      { value: 'street-food', label: '🌮 Street Food', emoji: '🌮' },
      { value: 'fine-dining', label: '🍽️ Fine Dining', emoji: '🍽️' },
      { value: 'food-trucks', label: '🚚 Food Trucks', emoji: '🚚' },
    ]
  },
  {
    category: 'Sports & Fitness',
    interests: [
      { value: 'gym', label: '💪 Gym', emoji: '💪' },
      { value: 'yoga', label: '🧘 Yoga', emoji: '🧘' },
      { value: 'running', label: '🏃 Running', emoji: '🏃' },
      { value: 'hiking', label: '🥾 Hiking', emoji: '🥾' },
      { value: 'cycling', label: '🚴 Cycling', emoji: '🚴' },
      { value: 'swimming', label: '🏊 Swimming', emoji: '🏊' },
      { value: 'tennis', label: '🎾 Tennis', emoji: '🎾' },
      { value: 'basketball', label: '🏀 Basketball', emoji: '🏀' },
      { value: 'soccer', label: '⚽ Soccer', emoji: '⚽' },
      { value: 'football', label: '🏈 Football', emoji: '🏈' },
      { value: 'baseball', label: '⚾ Baseball', emoji: '⚾' },
      { value: 'volleyball', label: '🏐 Volleyball', emoji: '🏐' },
      { value: 'golf', label: '⛳ Golf', emoji: '⛳' },
      { value: 'skiing', label: '⛷️ Skiing', emoji: '⛷️' },
      { value: 'snowboarding', label: '🏂 Snowboarding', emoji: '🏂' },
      { value: 'surfing', label: '🏄 Surfing', emoji: '🏄' },
      { value: 'rock-climbing', label: '🧗 Rock Climbing', emoji: '🧗' },
      { value: 'boxing', label: '🥊 Boxing', emoji: '🥊' },
      { value: 'martial-arts', label: '🥋 Martial Arts', emoji: '🥋' },
      { value: 'pilates', label: '🤸 Pilates', emoji: '🤸' },
      { value: 'crossfit', label: '🏋️ CrossFit', emoji: '🏋️' },
      { value: 'sports-watching', label: '🏟️ Watching Sports', emoji: '🏟️' },
    ]
  },
  {
    category: 'Outdoor & Adventure',
    interests: [
      { value: 'camping', label: '⛺ Camping', emoji: '⛺' },
      { value: 'backpacking', label: '🎒 Backpacking', emoji: '🎒' },
      { value: 'kayaking', label: '🛶 Kayaking', emoji: '🛶' },
      { value: 'fishing', label: '🎣 Fishing', emoji: '🎣' },
      { value: 'nature', label: '🌲 Nature', emoji: '🌲' },
      { value: 'beaches', label: '🏖️ Beaches', emoji: '🏖️' },
      { value: 'mountain-biking', label: '🚵 Mountain Biking', emoji: '🚵' },
      { value: 'road-trips', label: '🚗 Road Trips', emoji: '🚗' },
      { value: 'stargazing', label: '⭐ Stargazing', emoji: '⭐' },
    ]
  },
  {
    category: 'Travel',
    interests: [
      { value: 'travel', label: '✈️ Travel', emoji: '✈️' },
      { value: 'backpacking-travel', label: '🌍 Backpacking', emoji: '🌍' },
      { value: 'adventure-travel', label: '🗺️ Adventure Travel', emoji: '🗺️' },
      { value: 'luxury-travel', label: '🏝️ Luxury Travel', emoji: '🏝️' },
      { value: 'solo-travel', label: '🧳 Solo Travel', emoji: '🧳' },
      { value: 'international-travel', label: '🌎 International Travel', emoji: '🌎' },
    ]
  },
  {
    category: 'Gaming & Tech',
    interests: [
      { value: 'video-games', label: '🎮 Video Games', emoji: '🎮' },
      { value: 'board-games', label: '🎲 Board Games', emoji: '🎲' },
      { value: 'card-games', label: '🃏 Card Games', emoji: '🃏' },
      { value: 'tech', label: '💻 Technology', emoji: '💻' },
      { value: 'coding', label: '👨‍💻 Coding', emoji: '👨‍💻' },
      { value: 'pc-gaming', label: '🖥️ PC Gaming', emoji: '🖥️' },
      { value: 'console-gaming', label: '🕹️ Console Gaming', emoji: '🕹️' },
      { value: 'esports', label: '🏆 Esports', emoji: '🏆' },
    ]
  },
  {
    category: 'Staying In',
    interests: [
      { value: 'netflix', label: '📺 Netflix & Chill', emoji: '📺' },
      { value: 'movie-nights', label: '🍿 Movie Nights', emoji: '🍿' },
      { value: 'game-nights', label: '🎲 Game Nights', emoji: '🎲' },
      { value: 'puzzles', label: '🧩 Puzzles', emoji: '🧩' },
      { value: 'home-cooking', label: '🍳 Home Cooking', emoji: '🍳' },
    ]
  },
  {
    category: 'Self Care & Wellness',
    interests: [
      { value: 'meditation', label: '🧘‍♀️ Meditation', emoji: '🧘‍♀️' },
      { value: 'spa', label: '💆 Spa Days', emoji: '💆' },
      { value: 'skincare', label: '✨ Skincare', emoji: '✨' },
      { value: 'wellness', label: '🌿 Wellness', emoji: '🌿' },
      { value: 'journaling', label: '📓 Journaling', emoji: '📓' },
      { value: 'therapy', label: '💭 Therapy', emoji: '💭' },
      { value: 'mindfulness', label: '🧠 Mindfulness', emoji: '🧠' },
    ]
  },
  {
    category: 'Pets & Animals',
    interests: [
      { value: 'dogs', label: '🐕 Dogs', emoji: '🐕' },
      { value: 'cats', label: '🐈 Cats', emoji: '🐈' },
      { value: 'pets', label: '🐾 Pets', emoji: '🐾' },
      { value: 'animals', label: '🦁 Animals', emoji: '🦁' },
      { value: 'wildlife', label: '🦋 Wildlife', emoji: '🦋' },
      { value: 'birdwatching', label: '🦅 Bird Watching', emoji: '🦅' },
    ]
  },
  {
    category: 'Shopping & Fashion',
    interests: [
      { value: 'fashion', label: '👗 Fashion', emoji: '👗' },
      { value: 'thrifting', label: '🛍️ Thrifting', emoji: '🛍️' },
      { value: 'shopping', label: '🛒 Shopping', emoji: '🛒' },
      { value: 'styling', label: '💄 Styling', emoji: '💄' },
      { value: 'sneakers', label: '👟 Sneakers', emoji: '👟' },
    ]
  },
  {
    category: 'Social & Volunteering',
    interests: [
      { value: 'volunteering', label: '🤝 Volunteering', emoji: '🤝' },
      { value: 'activism', label: '✊ Activism', emoji: '✊' },
      { value: 'charity', label: '❤️ Charity Work', emoji: '❤️' },
      { value: 'community', label: '👥 Community', emoji: '👥' },
      { value: 'networking', label: '🤝 Networking', emoji: '🤝' },
    ]
  },
  {
    category: 'Personality Traits',
    interests: [
      { value: 'adventurous', label: '🌟 Adventurous', emoji: '🌟' },
      { value: 'spontaneous', label: '✨ Spontaneous', emoji: '✨' },
      { value: 'intellectual', label: '🎓 Intellectual', emoji: '🎓' },
      { value: 'creative', label: '💡 Creative', emoji: '💡' },
      { value: 'ambitious', label: '🎯 Ambitious', emoji: '🎯' },
      { value: 'chill', label: '😎 Chill/Relaxed', emoji: '😎' },
      { value: 'romantic', label: '💖 Romantic', emoji: '💖' },
      { value: 'funny', label: '😄 Funny', emoji: '😄' },
      { value: 'empathetic', label: '💝 Empathetic', emoji: '💝' },
      { value: 'optimistic', label: '🌈 Optimistic', emoji: '🌈' },
      { value: 'introverted', label: '📖 Introverted', emoji: '📖' },
      { value: 'extroverted', label: '🎉 Extroverted', emoji: '🎉' },
      { value: 'spiritual', label: '🕉️ Spiritual', emoji: '🕉️' },
    ]
  },
  {
    category: 'Miscellaneous',
    interests: [
      { value: 'astrology', label: '♈ Astrology', emoji: '♈' },
      { value: 'tarot', label: '🔮 Tarot', emoji: '🔮' },
      { value: 'gardening', label: '🌱 Gardening', emoji: '🌱' },
      { value: 'plants', label: '🪴 Plants', emoji: '🪴' },
      { value: 'science', label: '🔬 Science', emoji: '🔬' },
      { value: 'history', label: '📜 History', emoji: '📜' },
      { value: 'politics', label: '🗳️ Politics', emoji: '🗳️' },
      { value: 'podcasts', label: '🎙️ Podcasts', emoji: '🎙️' },
      { value: 'languages', label: '🗣️ Languages', emoji: '🗣️' },
      { value: 'architecture', label: '🏛️ Architecture', emoji: '🏛️' },
      { value: 'interior-design', label: '🛋️ Interior Design', emoji: '🛋️' },
      { value: 'diy', label: '🔧 DIY Projects', emoji: '🔧' },
      { value: 'vintage-collecting', label: '🕰️ Vintage Collecting', emoji: '🕰️' },
      { value: 'cars', label: '🚗 Cars', emoji: '🚗' },
      { value: 'motorcycles', label: '🏍️ Motorcycles', emoji: '🏍️' },
    ]
  }
];

// Flatten all interests for backwards compatibility
const interests = interestsByCategory.flatMap(category => category.interests);

// Additional profile fields for editing
const profileFields = {
  pronouns: [
    { value: 'she/her', label: 'She/Her' },
    { value: 'he/him', label: 'He/Him' },
    { value: 'they/them', label: 'They/Them' },
    { value: 'she/they', label: 'She/They' },
    { value: 'he/they', label: 'He/They' },
    { value: 'other', label: 'Other' },
  ],
  ethnicity: [
    { value: 'asian', label: 'Asian' },
    { value: 'black', label: 'Black/African American' },
    { value: 'hispanic', label: 'Hispanic/Latino' },
    { value: 'white', label: 'White/Caucasian' },
    { value: 'native-american', label: 'Native American' },
    { value: 'pacific-islander', label: 'Pacific Islander' },
    { value: 'middle-eastern', label: 'Middle Eastern' },
    { value: 'mixed', label: 'Mixed Race' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],
  height: [
    { value: '4\'6"', label: '4\'6"' },
    { value: '4\'7"', label: '4\'7"' },
    { value: '4\'8"', label: '4\'8"' },
    { value: '4\'9"', label: '4\'9"' },
    { value: '4\'10"', label: '4\'10"' },
    { value: '4\'11"', label: '4\'11"' },
    { value: '5\'0"', label: '5\'0"' },
    { value: '5\'1"', label: '5\'1"' },
    { value: '5\'2"', label: '5\'2"' },
    { value: '5\'3"', label: '5\'3"' },
    { value: '5\'4"', label: '5\'4"' },
    { value: '5\'5"', label: '5\'5"' },
    { value: '5\'6"', label: '5\'6"' },
    { value: '5\'7"', label: '5\'7"' },
    { value: '5\'8"', label: '5\'8"' },
    { value: '5\'9"', label: '5\'9"' },
    { value: '5\'10"', label: '5\'10"' },
    { value: '5\'11"', label: '5\'11"' },
    { value: '6\'0"', label: '6\'0"' },
    { value: '6\'1"', label: '6\'1"' },
    { value: '6\'2"', label: '6\'2"' },
    { value: '6\'3"', label: '6\'3"' },
    { value: '6\'4"', label: '6\'4"' },
    { value: '6\'5"', label: '6\'5"' },
    { value: '6\'6"', label: '6\'6"' },
  ],
  exercise: [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'daily', label: 'Daily' },
  ],
  drinking: [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'socially', label: 'Socially' },
  ],
  smoking: [
    { value: 'never', label: 'Never' },
    { value: 'rarely', label: 'Rarely' },
    { value: 'sometimes', label: 'Sometimes' },
    { value: 'often', label: 'Often' },
    { value: 'socially', label: 'Socially' },
  ],
  lookingFor: [
    { value: 'casual-dating', label: 'Casual Dating' },
    { value: 'serious-relationship', label: 'Serious Relationship' },
    { value: 'friendship', label: 'Friendship' },
    { value: 'marriage', label: 'Marriage' },
    { value: 'something-casual', label: 'Something Casual' },
    { value: 'not-sure', label: 'Not Sure' },
  ],
  familyPlans: [
    { value: 'want-kids', label: 'Want Kids' },
    { value: 'dont-want-kids', label: 'Don\'t Want Kids' },
    { value: 'have-kids', label: 'Have Kids' },
    { value: 'have-kids-want-more', label: 'Have Kids & Want More' },
    { value: 'not-sure', label: 'Not Sure' },
  ],
  religion: [
    { value: 'agnostic', label: 'Agnostic' },
    { value: 'atheist', label: 'Atheist' },
    { value: 'buddhist', label: 'Buddhist' },
    { value: 'catholic', label: 'Catholic' },
    { value: 'christian', label: 'Christian' },
    { value: 'hindu', label: 'Hindu' },
    { value: 'jewish', label: 'Jewish' },
    { value: 'muslim', label: 'Muslim' },
    { value: 'spiritual', label: 'Spiritual' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],
  politics: [
    { value: 'liberal', label: 'Liberal' },
    { value: 'conservative', label: 'Conservative' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'progressive', label: 'Progressive' },
    { value: 'libertarian', label: 'Libertarian' },
    { value: 'apolitical', label: 'Apolitical' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ],
  languages: [
    { value: 'english', label: 'English' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'italian', label: 'Italian' },
    { value: 'portuguese', label: 'Portuguese' },
    { value: 'chinese', label: 'Chinese' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'russian', label: 'Russian' },
    { value: 'other', label: 'Other' },
  ],
  causesAndCommunities: [
    { value: 'blm', label: 'Black Lives Matter' },
    { value: 'environmentalism', label: 'Environmentalism' },
    { value: 'lgbtq-rights', label: 'LGBTQ+ Rights' },
    { value: 'womens-rights', label: 'Women\'s Rights' },
    { value: 'mental-health', label: 'Mental Health Awareness' },
    { value: 'animal-rights', label: 'Animal Rights' },
    { value: 'disability-rights', label: 'Disability Rights' },
    { value: 'immigration', label: 'Immigration Rights' },
    { value: 'education', label: 'Education Access' },
    { value: 'healthcare', label: 'Healthcare Access' },
    { value: 'homelessness', label: 'Homelessness' },
    { value: 'veterans', label: 'Veterans Support' },
    { value: 'local-community', label: 'Local Community' },
    { value: 'volunteering', label: 'Volunteering' },
  ],
  qualities: [
    { value: 'empathy', label: 'Empathy' },
    { value: 'humor', label: 'Humor' },
    { value: 'honesty', label: 'Honesty' },
    { value: 'loyalty', label: 'Loyalty' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'creativity', label: 'Creativity' },
    { value: 'intelligence', label: 'Intelligence' },
    { value: 'kindness', label: 'Kindness' },
    { value: 'ambition', label: 'Ambition' },
    { value: 'patience', label: 'Patience' },
    { value: 'passion', label: 'Passion' },
    { value: 'independence', label: 'Independence' },
    { value: 'openness', label: 'Openness' },
    { value: 'confidence', label: 'Confidence' },
    { value: 'compassion', label: 'Compassion' },
  ],
};

const ProfileEditScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    bio: '',
    profilePhotoUrl: '',
    work: '',
    education: '',
    pronouns: '',
    ethnicity: '',
    hometown: '',
    height: '',
    exercise: '',
    drinking: '',
    smoking: '',
    lookingFor: '',
    familyPlans: '',
    religion: '',
    politics: '',
    languages: [],
    causesAndCommunities: [],
    qualities: [],
    additionalPhotos: [],
  });
  
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showInterests, setShowInterests] = useState(false);
  const [additionalPhotos, setAdditionalPhotos] = useState([]);
  const [showProfilePreview, setShowProfilePreview] = useState(false);

  // Load existing profile
  useEffect(() => {
    const loadExistingProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem(`profile_${user?.id}`);
        if (profileData) {
          const profile = JSON.parse(profileData);
          setExistingProfile(profile);
          setFormData({
            bio: profile.bio || '',
            profilePhotoUrl: profile.profilePhotoUrl || '',
            work: profile.work || '',
            education: profile.education || '',
            pronouns: profile.pronouns || '',
            ethnicity: profile.ethnicity || '',
            hometown: profile.hometown || '',
            height: profile.height || '',
            exercise: profile.exercise || '',
            drinking: profile.drinking || '',
            smoking: profile.smoking || '',
            lookingFor: profile.lookingFor || '',
            familyPlans: profile.familyPlans || '',
            religion: profile.religion || '',
            politics: profile.politics || '',
            languages: profile.languages || [],
            causesAndCommunities: profile.causesAndCommunities || [],
            qualities: profile.qualities || [],
            additionalPhotos: profile.additionalPhotos || [],
          });
          setSelectedInterests(profile.interests || []);
          setProfilePhoto(profile.profilePhotoUrl || '');
          setAdditionalPhotos(profile.additionalPhotos || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    if (user?.id) {
      loadExistingProfile();
    }
  }, [user?.id]);

  // Save profile function
  const saveProfile = async (profileData) => {
    try {
      const profileKey = `profile_${user.id}`;
      await AsyncStorage.setItem(profileKey, JSON.stringify(profileData));
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    }
  };

  // Helper functions for multi-select fields
  const updateMultiSelectField = (field, value, maxSelections = 3) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      if (currentValues.includes(value)) {
        // Remove if already selected
        return { ...prev, [field]: currentValues.filter(v => v !== value) };
      } else if (currentValues.length < maxSelections) {
        // Add if under limit
        return { ...prev, [field]: [...currentValues, value] };
      }
      return prev; // Don't add if at limit
    });
  };

  const isSelected = (field, value) => {
    return (formData[field] || []).includes(value);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle dropdown field selection
  const handleDropdownSelect = (field, value) => {
    updateFormData(field, value);
    setShowFieldModal(false);
  };

  // Handle interest selection
  const toggleInterest = (interest) => {
    setSelectedInterests(prev => {
      if (prev.some(item => item.value === interest.value)) {
        return prev.filter(item => item.value !== interest.value);
      } else if (prev.length < 5) {
        return [...prev, interest];
      }
      return prev;
    });
  };

  // Filter interests based on search
  const filteredInterests = interests.filter(interest =>
    interest.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    interest.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding additional photos
  const handleAddPhoto = async () => {
    // Check if already at limit (4 additional photos)
    if (additionalPhotos.length >= 4) {
      Alert.alert('Photo Limit Reached', 'You can only add 4 additional photos (5 total including your main profile photo).');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const newPhoto = result.assets[0].uri;
        setAdditionalPhotos(prev => [...prev, newPhoto]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Handle removing additional photos
  const handleRemovePhoto = (index) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  // Render dropdown field
  const renderDropdownField = (field, label, options) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, { borderColor: colors.border }]}
        onPress={() => {
          setCurrentField(field);
          setShowFieldModal(true);
        }}
      >
        <Text style={[styles.dropdownText, { color: formData[field] ? colors.text : colors.textSecondary }]}>
          {formData[field] ? profileFields[field]?.find(opt => opt.value === formData[field])?.label || formData[field] : `Select ${label.toLowerCase()}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  // Render multi-select field
  const renderMultiSelectField = (field, label, options, maxSelections = 3) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>
        {label} {formData[field]?.length > 0 && `(${formData[field].length}/${maxSelections})`}
      </Text>
      <View style={styles.multiSelectContainer}>
        {formData[field]?.map((value, index) => (
          <View key={index} style={styles.selectedTag}>
            <Text style={styles.selectedTagText}>
              {options.find(opt => opt.value === value)?.label}
            </Text>
            <TouchableOpacity
              onPress={() => updateMultiSelectField(field, value, maxSelections)}
              style={styles.removeTag}
            >
              <Ionicons name="close" size={16} color="#E6C547" />
            </TouchableOpacity>
          </View>
        ))}
        {formData[field]?.length < maxSelections && (
          <TouchableOpacity
            style={[styles.addTagButton, { borderColor: colors.border }]}
            onPress={() => {
              setCurrentField(field);
              setShowFieldModal(true);
            }}
          >
            <Ionicons name="add" size={20} color={colors.textSecondary} />
            <Text style={[styles.addTagText, { color: colors.textSecondary }]}>Add</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Handle back button with save confirmation
  const handleBackPress = () => {
    Alert.alert(
      'Save Changes?',
      'Do you want to save your changes before leaving?',
      [
        {
          text: 'Don\'t Save',
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
        {
          text: 'Save Changes',
          style: 'default',
          onPress: handleSubmit
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate interests (should be exactly 5)
    if (selectedInterests.length > 5) {
      Alert.alert('Invalid Selection', 'Please select exactly 5 interests.');
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        ...formData,
        interests: selectedInterests,
        additionalPhotos: additionalPhotos,
        username: user?.username,
        phoneNumber: user?.phoneNumber,
        birthday: user?.birthday,
        gender: user?.gender,
        sexualOrientation: user?.sexuality,
        userId: user?.id,
        createdAt: existingProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await saveProfile(profileData);
      
      if (success) {
        Alert.alert('Success', 'Your profile has been updated!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Updating profile...
          </Text>
        </View>
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
            style={styles.backButton}
            onPress={handleBackPress}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color="#E6C547" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
          <TouchableOpacity style={styles.previewButton} onPress={() => setShowProfilePreview(true)}>
            <Ionicons name="eye" size={20} color="#E6C547" />
            <Text style={styles.previewButtonText}>See Profile</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Basic Information Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
              
              {/* Profile Photo */}
              <View style={styles.photoSection}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Profile Photo</Text>
                <TouchableOpacity style={styles.photoContainer} onPress={() => setShowImagePickerModal(true)}>
                  {profilePhoto ? (
                    <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="camera" size={40} color="#E6C547" />
                      <Text style={styles.photoText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Additional Photos */}
              <View style={styles.photoSection}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Additional Photos ({additionalPhotos.length}/4)</Text>
                <View style={styles.additionalPhotosContainer}>
                  {additionalPhotos.map((photo, index) => (
                    <View key={index} style={styles.additionalPhotoContainer}>
                      <Image source={{ uri: photo }} style={styles.additionalPhoto} />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={() => handleRemovePhoto(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                  {additionalPhotos.length < 4 && (
                    <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                      <Ionicons name="add" size={30} color="#E6C547" />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Bio */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Bio</Text>
                <TextInput
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                  value={formData.bio}
                  onChangeText={(text) => updateFormData('bio', text)}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
                  {formData.bio.length}/500
                </Text>
              </View>

              {/* Interests */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>
                  Interests ({selectedInterests.length}/5)
                </Text>
                <TouchableOpacity
                  style={[styles.interestsButton, { borderColor: colors.border }]}
                  onPress={() => setShowInterests(!showInterests)}
                >
                  <Text style={[styles.interestsButtonText, { color: colors.text }]}>
                    {selectedInterests.length > 0 
                      ? `${selectedInterests.length} interests selected` 
                      : 'Select your interests'}
                  </Text>
                  <Ionicons name={showInterests ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                
                {showInterests && (
                  <View style={styles.interestsContainer}>
                    <TextInput
                      style={[styles.searchInput, { color: colors.text, borderColor: colors.border }]}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholder="Search interests..."
                      placeholderTextColor={colors.textSecondary}
                    />
                    <ScrollView style={styles.interestsScroll} showsVerticalScrollIndicator={false}>
                      {searchQuery ? (
                        // Show filtered results when searching
                        <View style={styles.interestsGrid}>
                          {filteredInterests.map((interest) => (
                            <TouchableOpacity
                              key={interest.value}
                              style={[
                                styles.interestTag,
                                selectedInterests.some(item => item.value === interest.value) && styles.selectedInterestTag
                              ]}
                              onPress={() => toggleInterest(interest)}
                            >
                              <Text style={[
                                styles.interestText,
                                selectedInterests.some(item => item.value === interest.value) && styles.selectedInterestText
                              ]}>
                                {interest.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        // Show organized by category when not searching
                        interestsByCategory.map((category) => (
                          <View key={category.category} style={styles.categorySection}>
                            <Text style={[styles.categoryHeader, { color: colors.text }]}>{category.category}</Text>
                            <View style={styles.interestsGrid}>
                              {category.interests.map((interest) => (
                                <TouchableOpacity
                                  key={interest.value}
                                  style={[
                                    styles.interestTag,
                                    selectedInterests.some(item => item.value === interest.value) && styles.selectedInterestTag
                                  ]}
                                  onPress={() => toggleInterest(interest)}
                                >
                                  <Text style={[
                                    styles.interestText,
                                    selectedInterests.some(item => item.value === interest.value) && styles.selectedInterestText
                                  ]}>
                                    {interest.label}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </View>
                        ))
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Work */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Work</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={formData.work}
                  onChangeText={(text) => updateFormData('work', text)}
                  placeholder="What do you do for work?"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Education */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Education</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={formData.education}
                  onChangeText={(text) => updateFormData('education', text)}
                  placeholder="Where did you go to school?"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Pronouns */}
              {renderDropdownField('pronouns', 'Pronouns', profileFields.pronouns)}

              {/* Ethnicity */}
              {renderDropdownField('ethnicity', 'Ethnicity', profileFields.ethnicity)}

              {/* Hometown */}
              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Hometown</Text>
                <TextInput
                  style={[styles.textInput, { color: colors.text, borderColor: colors.border }]}
                  value={formData.hometown}
                  onChangeText={(text) => updateFormData('hometown', text)}
                  placeholder="What city are you from?"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Height */}
              {renderDropdownField('height', 'Height', profileFields.height)}
            </View>

            {/* Lifestyle Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Lifestyle</Text>
              
              {/* Exercise */}
              {renderDropdownField('exercise', 'Exercise', profileFields.exercise)}

              {/* Drinking */}
              {renderDropdownField('drinking', 'Drinking', profileFields.drinking)}

              {/* Smoking */}
              {renderDropdownField('smoking', 'Smoking', profileFields.smoking)}
            </View>

            {/* Relationship Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Relationship</Text>
              
              {/* Looking For */}
              {renderDropdownField('lookingFor', 'Looking For', profileFields.lookingFor)}

              {/* Family Plans */}
              {renderDropdownField('familyPlans', 'Family Plans', profileFields.familyPlans)}
            </View>

            {/* Background Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Background</Text>
              
              {/* Religion */}
              {renderDropdownField('religion', 'Religion', profileFields.religion)}

              {/* Politics */}
              {renderDropdownField('politics', 'Politics', profileFields.politics)}
            </View>

            {/* Languages Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Languages</Text>
              
              {renderMultiSelectField('languages', 'Languages Spoken', profileFields.languages, 999)}
            </View>

            {/* Causes & Communities Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Causes & Communities</Text>
              
              {renderMultiSelectField('causesAndCommunities', 'Causes & Communities', profileFields.causesAndCommunities, 3)}
            </View>

            {/* Qualities Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Qualities I Value</Text>
              
              {renderMultiSelectField('qualities', 'Qualities', profileFields.qualities, 3)}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E6C547', '#D4AF37', '#B8860B']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Field Selection Modal */}
        <Modal
          visible={showFieldModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFieldModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select {currentField === 'pronouns' ? 'Pronouns' : 
                         currentField === 'ethnicity' ? 'Ethnicity' :
                         currentField === 'height' ? 'Height' :
                         currentField === 'exercise' ? 'Exercise Frequency' :
                         currentField === 'drinking' ? 'Drinking Frequency' :
                         currentField === 'smoking' ? 'Smoking Frequency' :
                         currentField === 'lookingFor' ? 'What You\'re Looking For' :
                         currentField === 'familyPlans' ? 'Family Plans' :
                         currentField === 'religion' ? 'Religion' :
                         currentField === 'politics' ? 'Politics' :
                         currentField === 'languages' ? 'Languages' :
                         currentField === 'causesAndCommunities' ? 'Causes & Communities' :
                         currentField === 'qualities' ? 'Qualities' : currentField}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowFieldModal(false)}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView}>
                {profileFields[currentField]?.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      { borderBottomColor: colors.border },
                      isSelected(currentField, option.value) && styles.selectedOptionItem
                    ]}
                    onPress={() => {
                      if (['languages', 'causesAndCommunities', 'qualities'].includes(currentField)) {
                        updateMultiSelectField(currentField, option.value);
                      } else {
                        handleDropdownSelect(currentField, option.value);
                      }
                    }}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: colors.text },
                      isSelected(currentField, option.value) && styles.selectedOptionText
                    ]}>
                      {option.label}
                    </Text>
                    {isSelected(currentField, option.value) && (
                      <Ionicons name="checkmark" size={20} color="#E6C547" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Profile Preview Modal */}
        <Modal
          visible={showProfilePreview}
          transparent={false}
          animationType="slide"
          onRequestClose={() => setShowProfilePreview(false)}
        >
          <View style={[styles.previewContainer, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.previewScrollView} showsVerticalScrollIndicator={false}>
              {/* Main Profile Photo with Overlay */}
              <View style={styles.mainPhotoContainer}>
                <Image 
                  source={{ uri: profilePhoto || 'https://via.placeholder.com/400x500' }} 
                  style={styles.mainPhoto} 
                />
                {/* Close button in top right corner */}
                <TouchableOpacity
                  style={styles.photoCloseButton}
                  onPress={() => setShowProfilePreview(false)}
                >
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.photoOverlay}
                >
                  <View style={styles.photoInfo}>
                    <Text style={styles.nameText}>
                      {user?.firstName || user?.username || 'Your Name'}
                      {user?.birthday && (() => {
                        try {
                          // Parse birthday string (MM/DD/YYYY format)
                          const [month, day, year] = user.birthday.split('/').map(num => parseInt(num));
                          const birthDate = new Date(year, month - 1, day);
                          const age = new Date().getFullYear() - birthDate.getFullYear();
                          // Check if birthday hasn't occurred this year
                          const hasHadBirthday = new Date().getMonth() > birthDate.getMonth() || 
                            (new Date().getMonth() === birthDate.getMonth() && new Date().getDate() >= birthDate.getDate());
                          const finalAge = hasHadBirthday ? age : age - 1;
                          return <Text style={styles.ageText}>, {finalAge}</Text>;
                        } catch (error) {
                          return null;
                        }
                      })()}
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {/* Basic Info Section */}
              <View style={styles.previewSection}>
                <View style={styles.infoRow}>
                  {formData.work && (
                    <View style={styles.infoItem}>
                      <Ionicons name="briefcase" size={16} color="#E6C547" />
                      <Text style={styles.infoText}>{formData.work}</Text>
                    </View>
                  )}
                  {formData.education && (
                    <View style={styles.infoItem}>
                      <Ionicons name="school" size={16} color="#E6C547" />
                      <Text style={styles.infoText}>{formData.education}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.infoRow}>
                  {formData.pronouns && (
                    <View style={styles.infoItem}>
                      <Ionicons name="person" size={16} color="#E6C547" />
                      <Text style={styles.infoText}>{profileFields.pronouns?.find(p => p.value === formData.pronouns)?.label}</Text>
                    </View>
                  )}
                  {formData.height && (
                    <View style={styles.infoItem}>
                      <Ionicons name="resize" size={16} color="#E6C547" />
                      <Text style={styles.infoText}>{profileFields.height?.find(h => h.value === formData.height)?.label}</Text>
                    </View>
                  )}
                </View>

                {formData.ethnicity && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Ionicons name="globe" size={16} color="#E6C547" />
                      <Text style={styles.infoText}>{profileFields.ethnicity?.find(e => e.value === formData.ethnicity)?.label}</Text>
                    </View>
                  </View>
                )}

                {formData.hometown && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Ionicons name="location" size={16} color="#E6C547" />
                      <Text style={styles.infoText}>{formData.hometown}</Text>
                    </View>
                  </View>
                )}

                {formData.languages && formData.languages.length > 0 && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Ionicons name="chatbubbles" size={16} color="#E6C547" />
                      <Text style={styles.infoText}>
                        {formData.languages.map(lang => 
                          profileFields.languages?.find(l => l.value === lang)?.label
                        ).join(', ')}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Interests */}
                {selectedInterests && selectedInterests.length > 0 && (
                  <View style={styles.interestsPreview}>
                    <Text style={styles.interestsPreviewTitle}>Interests</Text>
                    <View style={styles.interestsPreviewGrid}>
                      {selectedInterests.slice(0, 5).map((interest, index) => (
                        <View key={index} style={styles.interestPreviewTag}>
                          <Text style={styles.interestPreviewText}>{interest.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Bio Section */}
              {formData.bio && (
                <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>About</Text>
                  <Text style={styles.bioText}>{formData.bio}</Text>
                </View>
              )}

              {/* Looking For Section */}
              {(formData.lookingFor || formData.familyPlans || (formData.qualities && formData.qualities.length > 0)) && (
                <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>I'm Looking For</Text>
                  {formData.lookingFor && (
                    <View style={styles.lookingForItem}>
                      <Text style={styles.lookingForLabel}>Relationship:</Text>
                      <Text style={styles.lookingForValue}>
                        {profileFields.lookingFor?.find(l => l.value === formData.lookingFor)?.label}
                      </Text>
                    </View>
                  )}
                  {formData.familyPlans && (
                    <View style={styles.lookingForItem}>
                      <Text style={styles.lookingForLabel}>Family Plans:</Text>
                      <Text style={styles.lookingForValue}>
                        {profileFields.familyPlans?.find(f => f.value === formData.familyPlans)?.label}
                      </Text>
                    </View>
                  )}
                  {formData.qualities && formData.qualities.length > 0 && (
                    <View style={styles.lookingForItem}>
                      <Text style={styles.lookingForLabel}>Qualities I Value:</Text>
                      <Text style={styles.lookingForValue}>
                        {formData.qualities.map(quality => 
                          profileFields.qualities?.find(q => q.value === quality)?.label
                        ).join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Second Photo */}
              {additionalPhotos.length > 0 && (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: additionalPhotos[0] }} style={styles.previewPhoto} />
                </View>
              )}

              {/* Lifestyle Section */}
              {(formData.exercise || formData.drinking || formData.smoking) && (
                <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>Lifestyle</Text>
                  {formData.exercise && (
                    <View style={styles.lifestyleItem}>
                      <Text style={styles.lifestyleLabel}>Exercise:</Text>
                      <Text style={styles.lifestyleValue}>
                        {profileFields.exercise?.find(e => e.value === formData.exercise)?.label}
                      </Text>
                    </View>
                  )}
                  {formData.drinking && (
                    <View style={styles.lifestyleItem}>
                      <Text style={styles.lifestyleLabel}>Drinking:</Text>
                      <Text style={styles.lifestyleValue}>
                        {profileFields.drinking?.find(d => d.value === formData.drinking)?.label}
                      </Text>
                    </View>
                  )}
                  {formData.smoking && (
                    <View style={styles.lifestyleItem}>
                      <Text style={styles.lifestyleLabel}>Smoking:</Text>
                      <Text style={styles.lifestyleValue}>
                        {profileFields.smoking?.find(s => s.value === formData.smoking)?.label}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Third Photo */}
              {additionalPhotos.length > 1 && (
                <View style={styles.photoPreviewContainer}>
                  <Image source={{ uri: additionalPhotos[1] }} style={styles.previewPhoto} />
                </View>
              )}

              {/* Background Section */}
              {(formData.religion || formData.politics || (formData.causesAndCommunities && formData.causesAndCommunities.length > 0)) && (
                <View style={styles.previewSection}>
                  <Text style={styles.sectionTitle}>Background</Text>
                  {formData.religion && (
                    <View style={styles.backgroundItem}>
                      <Text style={styles.backgroundLabel}>Religion:</Text>
                      <Text style={styles.backgroundValue}>
                        {profileFields.religion?.find(r => r.value === formData.religion)?.label}
                      </Text>
                    </View>
                  )}
                  {formData.politics && (
                    <View style={styles.backgroundItem}>
                      <Text style={styles.backgroundLabel}>Politics:</Text>
                      <Text style={styles.backgroundValue}>
                        {profileFields.politics?.find(p => p.value === formData.politics)?.label}
                      </Text>
                    </View>
                  )}
                  {formData.causesAndCommunities && formData.causesAndCommunities.length > 0 && (
                    <View style={styles.backgroundItem}>
                      <Text style={styles.backgroundLabel}>Causes & Communities:</Text>
                      <Text style={styles.backgroundValue}>
                        {formData.causesAndCommunities.map(cause => 
                          profileFields.causesAndCommunities?.find(c => c.value === cause)?.label
                        ).join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Remaining Photos */}
              {additionalPhotos.length > 2 && (
                <View style={styles.remainingPhotosContainer}>
                  {additionalPhotos.slice(2).map((photo, index) => (
                    <View key={index} style={styles.photoPreviewContainer}>
                      <Image source={{ uri: photo }} style={styles.previewPhoto} />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#E6C547',
    fontSize: 16,
    fontFamily: 'Georgia',
    marginLeft: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 4,
    textAlign: 'right',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  photoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    color: '#E6C547',
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 8,
  },
  saveButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 20,
  },
  saveButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  // Dropdown styles
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  // Multi-select styles
  multiSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    borderColor: '#E6C547',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  selectedTagText: {
    color: '#E6C547',
    fontSize: 14,
    fontFamily: 'Georgia',
    marginRight: 6,
  },
  removeTag: {
    marginLeft: 4,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addTagText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginLeft: 4,
  },
  // Interests styles
  interestsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  interestsButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  interestsContainer: {
    marginTop: 10,
  },
  interestsScroll: {
    maxHeight: 400,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 15,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedInterestTag: {
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    borderColor: '#E6C547',
  },
  interestText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  selectedInterestText: {
    color: '#E6C547',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalScrollView: {
    flex: 1,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  selectedOptionItem: {
    backgroundColor: 'rgba(230, 197, 71, 0.1)',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    flex: 1,
  },
  selectedOptionText: {
    color: '#E6C547',
    fontWeight: '600',
  },
  // Preview button styles
  previewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    borderColor: '#E6C547',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  previewButtonText: {
    color: '#E6C547',
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginLeft: 4,
  },
  // Additional photos styles
  additionalPhotosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  additionalPhotoContainer: {
    position: 'relative',
  },
  additionalPhoto: {
    width: 80,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 100,
    borderWidth: 2,
    borderColor: '#E6C547',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(230, 197, 71, 0.1)',
  },
  addPhotoText: {
    color: '#E6C547',
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 4,
    textAlign: 'center',
  },
  // Profile preview styles
  previewContainer: {
    flex: 1,
  },
  previewScrollView: {
    flex: 1,
  },
  mainPhotoContainer: {
    position: 'relative',
    height: 400,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  photoInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  nameText: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ageText: {
    fontSize: 24,
    fontFamily: 'Georgia',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  previewSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Georgia',
    marginLeft: 6,
  },
  interestsPreview: {
    marginTop: 15,
  },
  interestsPreviewTitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    color: '#E6C547',
    marginBottom: 10,
  },
  interestsPreviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestPreviewTag: {
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    borderColor: '#E6C547',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestPreviewText: {
    color: '#E6C547',
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  bioText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 24,
  },
  lookingForItem: {
    marginBottom: 10,
  },
  lookingForLabel: {
    color: '#E6C547',
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  lookingForValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  photoPreviewContainer: {
    height: 300,
  },
  previewPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  lifestyleItem: {
    marginBottom: 10,
  },
  lifestyleLabel: {
    color: '#E6C547',
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  lifestyleValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  backgroundItem: {
    marginBottom: 10,
  },
  backgroundLabel: {
    color: '#E6C547',
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  backgroundValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 2,
  },
  remainingPhotosContainer: {
    gap: 0,
  },
});

export default ProfileEditScreen;
