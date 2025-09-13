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
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import VenueCard from '../components/VenueCard';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { venueApi } from '../utils/api';

// Venue Type Filters
const venueTypeFilters = [
  { value: 'all', label: 'All Venues' },
  { value: 'bar', label: 'Bars' },
  { value: 'club', label: 'Clubs' },
  { value: 'lounge', label: 'Lounges' },
  { value: 'pub', label: 'Pubs' },
  { value: 'cocktail_bar', label: 'Cocktail Bars' },
  { value: 'rooftop', label: 'Rooftops' },
  { value: 'speakeasy', label: 'Speakeasies' },
  { value: 'jazz_club', label: 'Jazz Clubs' },
  { value: 'wine_bar', label: 'Wine Bars' },
  { value: 'brewery', label: 'Breweries' },
];

// Music Type Filters
const musicTypeFilters = [
  { value: 'all', label: 'All Music' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'hip_hop', label: 'Hip Hop' },
  { value: 'rock', label: 'Rock' },
  { value: 'r&b', label: 'R&B' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'latin', label: 'Latin' },
  { value: 'country', label: 'Country' },
  { value: 'house', label: 'House' },
  { value: 'indie', label: 'Indie' },
  { value: 'acoustic', label: 'Acoustic' },
];

// Vibe Filters
const vibeFilters = [
  { value: 'all', label: 'All Vibes' },
  { value: 'upscale', label: 'Upscale' },
  { value: 'casual', label: 'Casual' },
  { value: 'intimate', label: 'Intimate' },
  { value: 'energetic', label: 'Energetic' },
  { value: 'chill', label: 'Chill' },
  { value: 'trendy', label: 'Trendy' },
  { value: 'classic', label: 'Classic' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'edgy', label: 'Edgy' },
  { value: 'hipster', label: 'Hipster' },
];

// Sorting Options
const sortOptions = [
  { value: 'distance', label: 'Distance' },
  { value: 'people', label: 'People Here' },
  { value: 'ai_recommendations', label: 'AI Recommendations' },
  { value: 'name', label: 'Name A-Z' },
];

// AI-generated Los Angeles County venue data - Comprehensive list from Google Maps searches
const laVenues = [
  // HOLLYWOOD & WEST HOLLYWOOD
  {
    id: '1',
    name: 'The Rooftop at The Standard',
    address: '8300 Sunset Blvd, West Hollywood, CA 90069',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Upscale',
    description: 'Stunning rooftop views with craft cocktails and electronic beats',
    coordinates: { latitude: 34.0900, longitude: -118.3617 },
    currentUsers: 23,
  },
  {
    id: '2',
    name: 'The Viper Room',
    address: '8852 Sunset Blvd, West Hollywood, CA 90069',
    type: 'dance_club',
    musicType: 'Rock',
    vibe: 'Edgy',
    description: 'Legendary rock venue with intimate atmosphere and live performances',
    coordinates: { latitude: 34.0908, longitude: -118.3856 },
    currentUsers: 15,
  },
  {
    id: '3',
    name: 'The Dresden',
    address: '1760 N Vermont Ave, Los Angeles, CA 90027',
    type: 'jazz_club',
    musicType: 'Jazz',
    vibe: 'Classic',
    description: 'Historic jazz club with martinis and smooth jazz performances',
    coordinates: { latitude: 34.1016, longitude: -118.2919 },
    currentUsers: 8,
  },
  {
    id: '4',
    name: 'The Nice Guy',
    address: '401 N La Cienega Blvd, West Hollywood, CA 90048',
    type: 'speakeasy',
    musicType: 'Hip-Hop',
    vibe: 'Exclusive',
    description: 'Hidden speakeasy with hip-hop beats and celebrity sightings',
    coordinates: { latitude: 34.0833, longitude: -118.3750 },
    currentUsers: 14,
  },
  {
    id: '5',
    name: 'Delilah',
    address: '8711 Beverly Blvd, West Hollywood, CA 90048',
    type: 'speakeasy',
    musicType: 'Jazz',
    vibe: 'Luxury',
    description: 'Upscale speakeasy with live jazz and premium cocktails',
    coordinates: { latitude: 34.0756, longitude: -118.3750 },
    currentUsers: 12,
  },
  {
    id: '6',
    name: 'The Beverly Hills Hotel Bar',
    address: '9641 Sunset Blvd, Beverly Hills, CA 90210',
    type: 'cocktail_bar',
    musicType: 'Jazz',
    vibe: 'Luxury',
    description: 'Elegant hotel bar with live jazz and premium cocktails',
    coordinates: { latitude: 34.0736, longitude: -118.4004 },
    currentUsers: 6,
  },
  {
    id: '7',
    name: 'The Abbey',
    address: '692 N Robertson Blvd, West Hollywood, CA 90069',
    type: 'dance_club',
    musicType: 'Electronic',
    vibe: 'LGBTQ+',
    description: 'Iconic LGBTQ+ dance club with electronic beats and vibrant atmosphere',
    coordinates: { latitude: 34.0900, longitude: -118.3856 },
    currentUsers: 35,
  },
  {
    id: '8',
    name: 'The Rooftop at EP & LP',
    address: '603 N La Cienega Blvd, West Hollywood, CA 90069',
    type: 'rooftop',
    musicType: 'House',
    vibe: 'Trendy',
    description: 'Rooftop bar with house music and panoramic city views',
    coordinates: { latitude: 34.0900, longitude: -118.3750 },
    currentUsers: 28,
  },

  // DOWNTOWN LA
  {
    id: '9',
    name: 'Perch',
    address: '448 S Hill St, Los Angeles, CA 90013',
    type: 'rooftop',
    musicType: 'Hip-Hop',
    vibe: 'Trendy',
    description: 'Rooftop bar with panoramic city views and hip-hop beats',
    coordinates: { latitude: 34.0489, longitude: -118.2515 },
    currentUsers: 31,
  },
  {
    id: '10',
    name: 'The Edison',
    address: '108 W 2nd St, Los Angeles, CA 90012',
    type: 'speakeasy',
    musicType: 'Jazz',
    vibe: 'Vintage',
    description: 'Industrial speakeasy with craft cocktails and live jazz',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    currentUsers: 12,
  },
  {
    id: '11',
    name: 'Exchange LA',
    address: '618 S Spring St, Los Angeles, CA 90014',
    type: 'dance_club',
    musicType: 'Electronic',
    vibe: 'High-Energy',
    description: 'Massive dance club with world-class DJs and electronic music',
    coordinates: { latitude: 34.0454, longitude: -118.2503 },
    currentUsers: 45,
  },
  {
    id: '12',
    name: 'The Varnish',
    address: '118 E 6th St, Los Angeles, CA 90014',
    type: 'speakeasy',
    musicType: 'Jazz',
    vibe: 'Intimate',
    description: 'Hidden speakeasy behind Cole\'s with craft cocktails and live jazz',
    coordinates: { latitude: 34.0454, longitude: -118.2503 },
    currentUsers: 8,
  },
  {
    id: '13',
    name: 'The Rooftop at The Ace Hotel',
    address: '929 S Broadway, Los Angeles, CA 90015',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Hipster',
    description: 'Rooftop bar with electronic beats and downtown views',
    coordinates: { latitude: 34.0407, longitude: -118.2468 },
    currentUsers: 22,
  },
  {
    id: '14',
    name: 'Clifton\'s Republic',
    address: '648 S Broadway, Los Angeles, CA 90014',
    type: 'dance_club',
    musicType: 'Electronic',
    vibe: 'Eclectic',
    description: 'Multi-level venue with electronic music and unique atmosphere',
    coordinates: { latitude: 34.0454, longitude: -118.2503 },
    currentUsers: 18,
  },

  // SANTA MONICA & VENICE
  {
    id: '15',
    name: 'The Bungalow',
    address: '101 Wilshire Blvd, Santa Monica, CA 90401',
    type: 'cocktail_bar',
    musicType: 'House',
    vibe: 'Beach',
    description: 'Beachside cocktail bar with house music and ocean vibes',
    coordinates: { latitude: 34.0195, longitude: -118.4912 },
    currentUsers: 28,
  },
  {
    id: '16',
    name: 'The Brig',
    address: '1515 Abbot Kinney Blvd, Venice, CA 90291',
    type: 'dance_club',
    musicType: 'Electronic',
    vibe: 'Bohemian',
    description: 'Venice Beach dance spot with electronic beats and artistic crowd',
    coordinates: { latitude: 33.9850, longitude: -118.4695 },
    currentUsers: 19,
  },
  {
    id: '17',
    name: 'The Rooftop at Hotel Erwin',
    address: '1697 Pacific Ave, Venice, CA 90291',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Beach',
    description: 'Rooftop bar with ocean views and electronic beats',
    coordinates: { latitude: 33.9850, longitude: -118.4695 },
    currentUsers: 25,
  },
  {
    id: '18',
    name: 'The Whaler',
    address: '1819 Ocean Ave, Santa Monica, CA 90401',
    type: 'cocktail_bar',
    musicType: 'Jazz',
    vibe: 'Cozy',
    description: 'Intimate cocktail bar with live jazz and ocean views',
    coordinates: { latitude: 34.0195, longitude: -118.4912 },
    currentUsers: 11,
  },
  {
    id: '19',
    name: 'The Basement Tavern',
    address: '12217 Santa Monica Blvd, Los Angeles, CA 90025',
    type: 'speakeasy',
    musicType: 'Jazz',
    vibe: 'Underground',
    description: 'Hidden basement speakeasy with live jazz and craft cocktails',
    coordinates: { latitude: 34.0407, longitude: -118.4419 },
    currentUsers: 7,
  },

  // SILVER LAKE & ECHO PARK
  {
    id: '20',
    name: 'The Satellite',
    address: '1717 Silver Lake Blvd, Los Angeles, CA 90026',
    type: 'dance_club',
    musicType: 'Indie',
    vibe: 'Alternative',
    description: 'Indie music venue with alternative vibes and local bands',
    coordinates: { latitude: 34.0928, longitude: -118.2706 },
    currentUsers: 11,
  },
  {
    id: '21',
    name: 'Echo Park Rising',
    address: '1822 W Sunset Blvd, Los Angeles, CA 90026',
    type: 'wine_bar',
    musicType: 'Acoustic',
    vibe: 'Intimate',
    description: 'Cozy wine bar with acoustic performances and artisanal wines',
    coordinates: { latitude: 34.0742, longitude: -118.2508 },
    currentUsers: 7,
  },
  {
    id: '22',
    name: 'The Short Stop',
    address: '1455 W Sunset Blvd, Los Angeles, CA 90026',
    type: 'dance_club',
    musicType: 'Electronic',
    vibe: 'Hipster',
    description: 'Echo Park dance club with electronic beats and local DJs',
    coordinates: { latitude: 34.0742, longitude: -118.2508 },
    currentUsers: 16,
  },
  {
    id: '23',
    name: 'The Rooftop at The LINE Hotel',
    address: '3515 Wilshire Blvd, Los Angeles, CA 90010',
    type: 'rooftop',
    musicType: 'House',
    vibe: 'Trendy',
    description: 'Rooftop bar with house music and city views',
    coordinates: { latitude: 34.0625, longitude: -118.3000 },
    currentUsers: 20,
  },

  // PASADENA
  {
    id: '24',
    name: 'The Raymond 1886',
    address: '1250 S Fair Oaks Ave, Pasadena, CA 91105',
    type: 'cocktail_bar',
    musicType: 'Jazz',
    vibe: 'Historic',
    description: 'Historic cocktail bar with craft drinks and smooth jazz',
    coordinates: { latitude: 34.1406, longitude: -118.1444 },
    currentUsers: 9,
  },
  {
    id: '25',
    name: 'The Blind Donkey',
    address: '53 E Union St, Pasadena, CA 91103',
    type: 'speakeasy',
    musicType: 'Jazz',
    vibe: 'Intimate',
    description: 'Hidden speakeasy with live jazz and craft cocktails',
    coordinates: { latitude: 34.1478, longitude: -118.1444 },
    currentUsers: 6,
  },

  // LONG BEACH
  {
    id: '26',
    name: 'The Pike Outlets Rooftop',
    address: '95 S Pine Ave, Long Beach, CA 90802',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Waterfront',
    description: 'Waterfront rooftop with electronic beats and ocean views',
    coordinates: { latitude: 33.7701, longitude: -118.1937 },
    currentUsers: 22,
  },
  {
    id: '27',
    name: 'The Federal Bar',
    address: '102 Pine Ave, Long Beach, CA 90802',
    type: 'brewery',
    musicType: 'Rock',
    vibe: 'Craft',
    description: 'Craft brewery with rock music and artisanal beers',
    coordinates: { latitude: 33.7701, longitude: -118.1937 },
    currentUsers: 16,
  },
  {
    id: '28',
    name: 'The Rooftop at The Westin',
    address: '333 E Ocean Blvd, Long Beach, CA 90802',
    type: 'rooftop',
    musicType: 'House',
    vibe: 'Upscale',
    description: 'Upscale rooftop with house music and harbor views',
    coordinates: { latitude: 33.7701, longitude: -118.1937 },
    currentUsers: 14,
  },

  // ADDITIONAL BARS (Google Maps search results)
  {
    id: '29',
    name: 'The Slipper Clutch',
    address: '6377 Hollywood Blvd, Los Angeles, CA 90028',
    type: 'cocktail_bar',
    musicType: 'Rock',
    vibe: 'Rock',
    description: 'Rock-themed cocktail bar with live music and vintage vibes',
    coordinates: { latitude: 34.1016, longitude: -118.3319 },
    currentUsers: 13,
  },
  {
    id: '30',
    name: 'The Frolic Room',
    address: '6245 Hollywood Blvd, Los Angeles, CA 90028',
    type: 'cocktail_bar',
    musicType: 'Jazz',
    vibe: 'Classic',
    description: 'Historic Hollywood cocktail bar with jazz and old-school charm',
    coordinates: { latitude: 34.1016, longitude: -118.3319 },
    currentUsers: 5,
  },
  {
    id: '31',
    name: 'The Rooftop at The Hollywood Roosevelt',
    address: '7000 Hollywood Blvd, Los Angeles, CA 90028',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Luxury',
    description: 'Luxury rooftop with electronic beats and Hollywood views',
    coordinates: { latitude: 34.1016, longitude: -118.3319 },
    currentUsers: 19,
  },
  {
    id: '32',
    name: 'The Spare Room',
    address: '7000 Hollywood Blvd, Los Angeles, CA 90028',
    type: 'speakeasy',
    musicType: 'Jazz',
    vibe: 'Intimate',
    description: 'Intimate speakeasy with live jazz and craft cocktails',
    coordinates: { latitude: 34.1016, longitude: -118.3319 },
    currentUsers: 8,
  },
  {
    id: '33',
    name: 'The Rooftop at The London',
    address: '1020 N San Vicente Blvd, West Hollywood, CA 90069',
    type: 'rooftop',
    musicType: 'House',
    vibe: 'Trendy',
    description: 'Trendy rooftop with house music and city views',
    coordinates: { latitude: 34.0900, longitude: -118.3750 },
    currentUsers: 24,
  },
  {
    id: '34',
    name: 'The Rooftop at The Mondrian',
    address: '8440 Sunset Blvd, West Hollywood, CA 90069',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Upscale',
    description: 'Upscale rooftop with electronic beats and panoramic views',
    coordinates: { latitude: 34.0900, longitude: -118.3750 },
    currentUsers: 31,
  },
  {
    id: '35',
    name: 'The Rooftop at The W Hollywood',
    address: '6250 Hollywood Blvd, Los Angeles, CA 90028',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Luxury',
    description: 'Luxury rooftop with electronic beats and Hollywood views',
    coordinates: { latitude: 34.1016, longitude: -118.3319 },
    currentUsers: 27,
  },

  // ADDITIONAL CLUBS (Google Maps search results)
  {
    id: '36',
    name: 'Academy',
    address: '6021 Hollywood Blvd, Los Angeles, CA 90028',
    type: 'dance_club',
    musicType: 'Electronic',
    vibe: 'High-Energy',
    description: 'High-energy dance club with electronic beats and world-class DJs',
    coordinates: { latitude: 34.1016, longitude: -118.3319 },
    currentUsers: 42,
  },
  {
    id: '37',
    name: 'Sound Nightclub',
    address: '1642 N Las Palmas Ave, Los Angeles, CA 90028',
    type: 'dance_club',
    musicType: 'Electronic',
    vibe: 'Underground',
    description: 'Underground electronic music venue with cutting-edge sounds',
    coordinates: { latitude: 34.1016, longitude: -118.3319 },
    currentUsers: 38,
  },
  {
    id: '38',
    name: 'Create Nightclub',
    address: '6021 Hollywood Blvd, Los Angeles, CA 90028',
    type: 'dance_club',
    musicType: 'Electronic',
    vibe: 'Modern',
    description: 'Modern dance club with electronic beats and state-of-the-art sound',
    coordinates: { latitude: 34.1016, longitude: -118.3319 },
    currentUsers: 33,
  },
  {
    id: '39',
    name: 'Avalon Hollywood',
    address: '1735 N Vine St, Los Angeles, CA 90028',
    type: 'dance_club',
    musicType: 'Electronic',
    vibe: 'Legendary',
    description: 'Legendary Hollywood dance club with electronic beats and historic vibes',
    coordinates: { latitude: 34.1016, longitude: -118.3319 },
    currentUsers: 29,
  },
  {
    id: '40',
    name: 'The Rooftop at The Standard Downtown',
    address: '550 S Flower St, Los Angeles, CA 90071',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Modern',
    description: 'Modern rooftop with electronic beats and downtown views',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    currentUsers: 26,
  },

  // ADDITIONAL SPEAKEASIES (Google Maps search results)
  {
    id: '41',
    name: 'The Blind Barber',
    address: '10797 Venice Blvd, Los Angeles, CA 90034',
    type: 'speakeasy',
    musicType: 'Jazz',
    vibe: 'Hidden',
    description: 'Hidden speakeasy behind barbershop with live jazz and craft cocktails',
    coordinates: { latitude: 34.0407, longitude: -118.4419 },
    currentUsers: 9,
  },
  {
    id: '42',
    name: 'The Walker Inn',
    address: '3612 W 6th St, Los Angeles, CA 90020',
    type: 'speakeasy',
    musicType: 'Jazz',
    vibe: 'Intimate',
    description: 'Intimate speakeasy with live jazz and artisanal cocktails',
    coordinates: { latitude: 34.0625, longitude: -118.3000 },
    currentUsers: 7,
  },
  {
    id: '43',
    name: 'The Rooftop at The Nomad',
    address: '649 S Olive St, Los Angeles, CA 90014',
    type: 'rooftop',
    musicType: 'Jazz',
    vibe: 'Elegant',
    description: 'Elegant rooftop with live jazz and sophisticated atmosphere',
    coordinates: { latitude: 34.0454, longitude: -118.2503 },
    currentUsers: 15,
  },
  {
    id: '44',
    name: 'The Rooftop at The Ace Hotel DTLA',
    address: '929 S Broadway, Los Angeles, CA 90015',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Hipster',
    description: 'Hipster rooftop with electronic beats and downtown views',
    coordinates: { latitude: 34.0407, longitude: -118.2468 },
    currentUsers: 21,
  },

  // ADDITIONAL WINE BARS & BREWERIES
  {
    id: '45',
    name: 'The Rooftop at The Proper Hotel',
    address: '1100 S Broadway, Los Angeles, CA 90015',
    type: 'rooftop',
    musicType: 'House',
    vibe: 'Upscale',
    description: 'Upscale rooftop with house music and city views',
    coordinates: { latitude: 34.0407, longitude: -118.2468 },
    currentUsers: 18,
  },
  {
    id: '46',
    name: 'The Rooftop at The Freehand',
    address: '416 W 8th St, Los Angeles, CA 90014',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Trendy',
    description: 'Trendy rooftop with electronic beats and downtown atmosphere',
    coordinates: { latitude: 34.0454, longitude: -118.2503 },
    currentUsers: 23,
  },
  {
    id: '47',
    name: 'The Rooftop at The Hoxton',
    address: '1060 S Broadway, Los Angeles, CA 90015',
    type: 'rooftop',
    musicType: 'House',
    vibe: 'Modern',
    description: 'Modern rooftop with house music and contemporary vibes',
    coordinates: { latitude: 34.0407, longitude: -118.2468 },
    currentUsers: 17,
  },
  {
    id: '48',
    name: 'The Rooftop at The InterContinental',
    address: '900 Wilshire Blvd, Los Angeles, CA 90017',
    type: 'rooftop',
    musicType: 'Jazz',
    vibe: 'Luxury',
    description: 'Luxury rooftop with live jazz and panoramic city views',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    currentUsers: 12,
  },
  {
    id: '49',
    name: 'The Rooftop at The JW Marriott',
    address: '900 W Olympic Blvd, Los Angeles, CA 90015',
    type: 'rooftop',
    musicType: 'Electronic',
    vibe: 'Upscale',
    description: 'Upscale rooftop with electronic beats and sophisticated atmosphere',
    coordinates: { latitude: 34.0407, longitude: -118.2468 },
    currentUsers: 20,
  },
  {
    id: '50',
    name: 'The Rooftop at The Conrad',
    address: '100 S Grand Ave, Los Angeles, CA 90012',
    type: 'rooftop',
    musicType: 'House',
    vibe: 'Elegant',
    description: 'Elegant rooftop with house music and downtown views',
    coordinates: { latitude: 34.0522, longitude: -118.2437 },
    currentUsers: 16,
  },
  
  // TEST VENUES - Using user's current location for testing
  {
    id: 'test1',
    name: 'The Runnymede Lounge',
    address: '13952 Runnymede St, Van Nuys, CA 91405',
    type: 'bar',
    musicType: 'Rock',
    vibe: 'Casual',
    description: 'Local neighborhood bar with live rock music and craft beers',
    latitude: 34.205477, // User's exact current location
    longitude: -118.437504, // User's exact current location
    currentUsers: 7,
  },
  {
    id: 'test2',
    name: 'Van Nuys Social Club',
    address: '13952 Runnymede St, Van Nuys, CA 91405',
    type: 'lounge',
    musicType: 'Electronic',
    vibe: 'Trendy',
    description: 'Modern lounge with electronic beats and signature cocktails',
    latitude: 34.205477, // User's exact current location
    longitude: -118.437504, // User's exact current location
    currentUsers: 12,
  },
  {
    id: 'test3',
    name: 'The Corner Pub',
    address: '13952 Runnymede St, Van Nuys, CA 91405',
    type: 'pub',
    musicType: 'Country',
    vibe: 'Classic',
    description: 'Traditional pub with country music and comfort food',
    latitude: 34.205477, // User's exact current location
    longitude: -118.437504, // User's exact current location
    currentUsers: 5,
  },
];

const VenueDiscoveryScreen = () => {
  const { colors } = useTheme();
  const { logout } = useAuth();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeVenueTypeFilter, setActiveVenueTypeFilter] = useState('all');
  const [activeMusicFilter, setActiveMusicFilter] = useState('all');
  const [activeVibeFilter, setActiveVibeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [nearbyVenues, setNearbyVenues] = useState([]);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Request location permission and get user location
  const requestLocationPermission = async () => {
    try {
      console.log('=== LOCATION DEBUG START ===');
      console.log('Step 1: Requesting location permission...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        console.log('Permission denied');
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to see distances to venues and get directions.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      console.log('Step 2: Permission granted, requesting location...');
      setLocationPermission(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      });
      
      console.log('Step 3: Location obtained successfully!');
      console.log('Full location object:', location);
      console.log('Coordinates:', location.coords);
      console.log('Latitude:', location.coords.latitude);
      console.log('Longitude:', location.coords.longitude);
      console.log('Accuracy:', location.coords.accuracy, 'meters');
      console.log('Timestamp:', new Date(location.timestamp));
      
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      
      console.log('=== LOCATION DEBUG END ===');
      return true;
    } catch (error) {
      console.error('=== LOCATION ERROR ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Full error:', error);
      Alert.alert('Error', `Unable to get your location: ${error.message}`);
      return false;
    }
  };

  // Calculate distance between two coordinates (in miles)
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

  // Open directions in maps app
  const openDirections = (venue) => {
    const { address } = venue;
    // URL encode the address for proper handling
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://maps.google.com/maps?daddr=${encodedAddress}`;
    
    Linking.canOpenURL(googleMapsUrl).then(supported => {
      if (supported) {
        Linking.openURL(googleMapsUrl);
      } else {
        // Fallback to Apple Maps
        const appleMapsUrl = `http://maps.apple.com/?daddr=${encodedAddress}`;
        Linking.openURL(appleMapsUrl);
      }
    });
  };

  // Use local venue data instead of API
  const venues = laVenues;
  const isLoading = false;

  // Request location permission on component mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Update nearby venues when location changes
  useEffect(() => {
    updateNearbyVenues();
  }, [userLocation]);

  // Filter venues based on search term and active filters
  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.musicType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.vibe?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVenueType = activeVenueTypeFilter === 'all' || venue.type === activeVenueTypeFilter;
    const matchesMusicType = activeMusicFilter === 'all' || venue.musicType?.toLowerCase() === activeMusicFilter.toLowerCase();
    const matchesVibe = activeVibeFilter === 'all' || venue.vibe?.toLowerCase() === activeVibeFilter.toLowerCase();
    
    return matchesSearch && matchesVenueType && matchesMusicType && matchesVibe;
  }).map(venue => {
    // Add distance calculation if user location is available
    if (userLocation) {
      // Handle both old format (coordinates) and new format (latitude/longitude directly)
      const venueLat = venue.latitude || venue.coordinates?.latitude;
      const venueLng = venue.longitude || venue.coordinates?.longitude;
      
      if (venueLat && venueLng) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          venueLat,
          venueLng
        );
        return { ...venue, distance };
      }
    }
    return venue;
  }).sort((a, b) => {
    // Sort based on selected option
    switch (sortBy) {
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      case 'people':
        return (b.currentUsers || 0) - (a.currentUsers || 0);
      case 'ai_recommendations':
        // AI recommendations based on user preferences (simplified)
        const aScore = (a.currentUsers || 0) * 0.4 + (a.distance ? (10 - a.distance) : 5) * 0.6;
        const bScore = (b.currentUsers || 0) * 0.4 + (b.distance ? (10 - b.distance) : 5) * 0.6;
        return bScore - aScore;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return (a.distance || 0) - (b.distance || 0);
    }
  });

  const handleVenueSelect = (venue) => {
    // Open directions in maps app
    openDirections(venue);
    
    // Navigate to check-in after a short delay
    setTimeout(() => {
      navigation.navigate('CheckIn', { venueId: venue.id });
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      console.log('Logout button pressed');
      await logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Calculate nearby venues within 100 feet
  const updateNearbyVenues = () => {
    if (!userLocation) {
      setNearbyVenues([]);
      return;
    }

    const nearby = laVenues.filter(venue => {
      // Handle both old format (coordinates) and new format (latitude/longitude directly)
      const venueLat = venue.latitude || venue.coordinates?.latitude;
      const venueLng = venue.longitude || venue.coordinates?.longitude;
      
      if (!venueLat || !venueLng) return false;
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        venueLat,
        venueLng
      );
      
      // Debug logging
      if (venue.id.startsWith('test')) {
        console.log(`Distance to ${venue.name}: ${distance.toFixed(4)} miles (${(distance * 5280).toFixed(0)} feet)`);
      }
      
      return distance <= 0.02; // 100 feet = ~0.02 miles
    });

    console.log(`Found ${nearby.length} nearby venues`);
    setNearbyVenues(nearby);
  };

  // Handle check-in button press
  const handleCheckIn = async () => {
    if (isCheckingIn) return; // Prevent multiple simultaneous requests
    
    console.log('Check-in button clicked - starting location request process');
    setIsCheckingIn(true);
    
    try {
      // Step 1: Check current permission status
      console.log('Step 1: Checking location permission status...');
      let { status } = await Location.getForegroundPermissionsAsync();
      console.log('Current permission status:', status);
      
      // Step 2: Request permission if not granted
      if (status !== 'granted') {
        console.log('Step 2: Requesting location permission...');
        const permissionResponse = await Location.requestForegroundPermissionsAsync();
        status = permissionResponse.status;
        console.log('Permission request result:', status);
        
        if (status !== 'granted') {
          console.log('Location permission denied');
          Alert.alert(
            'Location Permission Required',
            'This app needs location access to check you in at venues. Please enable location access in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }

      console.log('Step 3: Permission granted, requesting location...');
      
      // Step 3: Request location with simpler settings
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      });
      
      console.log('Step 4: Location obtained successfully!');
      console.log('Latitude:', location.coords.latitude);
      console.log('Longitude:', location.coords.longitude);
      console.log('Accuracy:', location.coords.accuracy, 'meters');
      
      const freshLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(freshLocation);
      
      // Step 4: Calculate distance to all venues using fresh location
      console.log('Step 5: Calculating distances to venues...');
      const freshNearby = laVenues.filter(venue => {
        // Handle both old format (coordinates) and new format (latitude/longitude directly)
        const venueLat = venue.latitude || venue.coordinates?.latitude;
        const venueLng = venue.longitude || venue.coordinates?.longitude;
        
        if (!venueLat || !venueLng) return false;
        const distance = calculateDistance(
          freshLocation.latitude,
          freshLocation.longitude,
          venueLat,
          venueLng
        );
        
        // Debug logging for all venues
        console.log(`Distance to ${venue.name}: ${distance.toFixed(4)} miles (${(distance * 5280).toFixed(0)} feet)`);
        
        return distance <= 0.02; // Exactly 100 feet = ~0.02 miles
      });
      
      console.log(`Step 6: Found ${freshNearby.length} venues within 100 feet`);
      
      if (freshNearby.length === 0) {
        Alert.alert(
          'No Venues Nearby', 
          'You need to be within 100 feet of a venue to check in. You are not close enough to any venues at this time.'
        );
        return;
      }

      if (freshNearby.length === 1) {
        // Single venue nearby, go directly to swiping
        console.log(`Check-in: Going to single venue - ${freshNearby[0].name}`);
        navigation.navigate('CheckIn', { venueId: freshNearby[0].id });
      } else {
        // Multiple venues nearby, show selection
        console.log(`Check-in: Multiple venues nearby - showing selection`);
        navigation.navigate('VenueSelection', { venues: freshNearby });
      }
    } catch (error) {
      console.error('Error in check-in process:', error);
      console.error('Error details:', error.message);
      Alert.alert(
        'Location Error', 
        `Unable to get your current location: ${error.message}. Please check your location settings and try again.`
      );
    } finally {
      setIsCheckingIn(false);
    }
  };

  const recommendedVenues = filteredVenues.slice(0, 3);
  const otherVenues = filteredVenues.slice(3);

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
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.appTitle}>Over Drinks</Text>
              <View style={styles.wineGlassesContainer}>
                <Ionicons name="wine" size={20} color="#8B0000" />
                <View style={styles.dashedLine} />
                <Ionicons name="wine" size={20} color="#8B0000" />
              </View>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => setShowSettingsDropdown(!showSettingsDropdown)}
            >
              <Ionicons name="settings" size={24} color="#E6C547" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Page Title */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Find Your Scene</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.refreshLocationButton}
              onPress={async () => {
                try {
                  console.log('=== DEBUG BUTTON CLICKED ===');
                  console.log('Testing location service...');
                  
                  // Test 1: Check if Location service is available
                  console.log('Test 1: Checking if Location service is available...');
                  if (!Location) {
                    throw new Error('Location service not available');
                  }
                  console.log('✓ Location service is available');
                  
                  // Test 2: Check permissions
                  console.log('Test 2: Checking permissions...');
                  let { status } = await Location.getForegroundPermissionsAsync();
                  console.log('Current permission status:', status);
                  
                  if (status !== 'granted') {
                    console.log('Requesting permission...');
                    const permissionResponse = await Location.requestForegroundPermissionsAsync();
                    status = permissionResponse.status;
                    console.log('Permission request result:', status);
                    
                    if (status !== 'granted') {
                      throw new Error('Location permission denied');
                    }
                  }
                  console.log('✓ Permission granted');
                  
                  // Test 3: Request location
                  console.log('Test 3: Requesting location...');
                  const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                    maximumAge: 10000,
                    timeout: 10000,
                  });
                  
                  console.log('✓ Location obtained successfully!');
                  console.log('Full location object:', location);
                  console.log('Coordinates:', location.coords);
                  
                  Alert.alert(
                    'Location Test SUCCESS',
                    `Latitude: ${location.coords.latitude.toFixed(6)}\nLongitude: ${location.coords.longitude.toFixed(6)}\nAccuracy: ${location.coords.accuracy}m\nTimestamp: ${new Date(location.timestamp).toLocaleString()}`
                  );
                } catch (error) {
                  console.error('=== DEBUG BUTTON ERROR ===');
                  console.error('Error type:', error.name);
                  console.error('Error message:', error.message);
                  console.error('Error code:', error.code);
                  console.error('Full error:', error);
                  Alert.alert('Location Test FAILED', `Error: ${error.message}\n\nCheck console for details.`);
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={16} color="#E6C547" />
              <Text style={styles.refreshButtonText}>Refresh Location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.checkInButton,
                isCheckingIn && styles.checkInButtonDisabled
              ]}
              onPress={handleCheckIn}
              disabled={isCheckingIn}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isCheckingIn ? ['#666666', '#555555', '#444444'] : ['#E6C547', '#D4AF37', '#B8860B']}
                style={styles.checkInButtonGradient}
              >
                <Ionicons 
                  name={isCheckingIn ? "refresh" : "location"} 
                  size={16} 
                  color={isCheckingIn ? "#999999" : "#000000"} 
                />
                <Text style={[
                  styles.checkInButtonText,
                  isCheckingIn && styles.checkInButtonTextDisabled
                ]}>
                  {isCheckingIn ? 'Checking...' : 'Check In'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Dropdown - Positioned outside header */}
        {showSettingsDropdown && (
          <View style={styles.settingsDropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowSettingsDropdown(false);
                navigation.navigate('ProfileEdit');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="person" size={20} color="#E6C547" />
              <Text style={styles.dropdownText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowSettingsDropdown(false);
                // Navigate to notifications
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications" size={20} color="#E6C547" />
              <Text style={styles.dropdownText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowSettingsDropdown(false);
                // Navigate to privacy
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark" size={20} color="#E6C547" />
              <Text style={styles.dropdownText}>Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowSettingsDropdown(false);
                // Navigate to help & support
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="help-circle" size={20} color="#E6C547" />
              <Text style={styles.dropdownText}>Help & Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setShowSettingsDropdown(false);
                handleLogout();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out" size={20} color="#E6C547" />
              <Text style={styles.dropdownText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Integrated Search Bar with Filters and Sort */}
            <View style={styles.searchSection}>
              <View style={styles.integratedSearchContainer}>
                <Ionicons name="search" size={20} color="#E6C547" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search bars & clubs..."
                  placeholderTextColor="#E6C547"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
                
                {/* Filter Button */}
                <TouchableOpacity
                  style={styles.integratedDropdownButton}
                  onPress={() => {
                    setShowFilterDropdown(!showFilterDropdown);
                    if (!showFilterDropdown) {
                      setShowSortDropdown(false); // Close sort dropdown when opening filter
                    }
                  }}
                >
                  <Ionicons name="filter" size={16} color="#E6C547" />
                </TouchableOpacity>
                
                {/* Sort Button */}
                <TouchableOpacity
                  style={styles.integratedDropdownButton}
                  onPress={() => {
                    setShowSortDropdown(!showSortDropdown);
                    if (!showSortDropdown) {
                      setShowFilterDropdown(false); // Close filter dropdown when opening sort
                    }
                  }}
                >
                  <Ionicons name="swap-vertical" size={16} color="#E6C547" />
                </TouchableOpacity>
              </View>
              
              {/* Filter Dropdown */}
              {showFilterDropdown && (
                <View 
                  style={styles.filterDropdown}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <ScrollView 
                    style={styles.dropdownScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <View style={styles.filterDropdownSection}>
                      <Text style={styles.filterDropdownTitle}>Venue Type</Text>
                      {venueTypeFilters.map((filter) => (
                        <TouchableOpacity
                          key={filter.value}
                          style={[
                            styles.filterDropdownItem,
                            activeVenueTypeFilter === filter.value && styles.filterDropdownItemActive
                          ]}
                          onPress={() => {
                            setActiveVenueTypeFilter(activeVenueTypeFilter === filter.value ? null : filter.value);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.filterDropdownItemText,
                            activeVenueTypeFilter === filter.value && styles.filterDropdownItemTextActive
                          ]}>
                            {filter.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    <View style={styles.filterDropdownSection}>
                      <Text style={styles.filterDropdownTitle}>Music</Text>
                      {musicTypeFilters.map((filter) => (
                        <TouchableOpacity
                          key={filter.value}
                          style={[
                            styles.filterDropdownItem,
                            activeMusicFilter === filter.value && styles.filterDropdownItemActive
                          ]}
                          onPress={() => {
                            setActiveMusicFilter(activeMusicFilter === filter.value ? null : filter.value);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.filterDropdownItemText,
                            activeMusicFilter === filter.value && styles.filterDropdownItemTextActive
                          ]}>
                            {filter.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    
                    <View style={styles.filterDropdownSection}>
                      <Text style={styles.filterDropdownTitle}>Vibe</Text>
                      {vibeFilters.map((filter) => (
                        <TouchableOpacity
                          key={filter.value}
                          style={[
                            styles.filterDropdownItem,
                            activeVibeFilter === filter.value && styles.filterDropdownItemActive
                          ]}
                          onPress={() => {
                            setActiveVibeFilter(activeVibeFilter === filter.value ? null : filter.value);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.filterDropdownItemText,
                            activeVibeFilter === filter.value && styles.filterDropdownItemTextActive
                          ]}>
                            {filter.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              
              {/* Sort Dropdown */}
              {showSortDropdown && (
                <View 
                  style={styles.sortDropdown}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <ScrollView 
                    style={styles.dropdownScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    {sortOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.sortDropdownItem,
                          sortBy === option.value && styles.sortDropdownItemActive
                        ]}
                        onPress={() => {
                          setSortBy(option.value);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.sortDropdownItemText,
                          sortBy === option.value && styles.sortDropdownItemTextActive
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>


            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#E6C547" />
                <Text style={styles.loadingText}>
                  Loading venues...
                </Text>
              </View>
            ) : (
              <>
                {/* Recommendations */}
                {recommendedVenues.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {userLocation ? 'Closest to You' : 'Recommended for You'}
                    </Text>
                    <View style={styles.venuesList}>
                      {recommendedVenues.map((venue) => (
                        <VenueCard
                          key={venue.id}
                          venue={venue}
                          onSelect={() => handleVenueSelect(venue)}
                          userLocation={userLocation}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {/* Nearby Venues */}
                {nearbyVenues.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      {userLocation ? 'More Venues' : 'All Venues'}
                    </Text>
                    <View style={styles.venuesList}>
                      {otherVenues.map((venue) => (
                        <VenueCard
                          key={venue.id}
                          venue={venue}
                          onSelect={() => handleVenueSelect(venue)}
                          userLocation={userLocation}
                        />
                      ))}
                    </View>
                  </View>
                )}

                {filteredVenues.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search" size={48} color="#E6C547" />
                    <Text style={styles.emptyText}>
                      No venues found matching your search.
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
        
        {/* Backdrop for closing settings dropdown only */}
        {showSettingsDropdown && (
          <TouchableOpacity
            style={styles.backdrop}
            onPress={() => {
              setShowSettingsDropdown(false);
            }}
            activeOpacity={1}
          />
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6C547',
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#E6C547',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  wineGlassesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dashedLine: {
    width: 30,
    height: 2,
    backgroundColor: '#E6C547',
    marginHorizontal: 6,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsButton: {
    padding: 8,
  },
  settingsDropdown: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    paddingVertical: 8,
    minWidth: 180,
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 20,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    marginLeft: 12,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 99998,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E6C547',
  },
  pageTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    fontWeight: 'bold',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  debugButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
    borderWidth: 1,
    borderColor: '#E6C547',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  checkInButtonDisabled: {
    opacity: 0.6,
  },
  checkInButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  checkInButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 6,
  },
  checkInButtonTextDisabled: {
    color: '#999999',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    paddingHorizontal: 12,
    height: 48,
  },
  integratedSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    paddingHorizontal: 12,
    height: 48,
  },
  integratedDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(230, 197, 71, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(230, 197, 71, 0.3)',
    minWidth: 36,
    height: 32,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    paddingVertical: 8,
    marginLeft: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  dropdownContainer: {
    position: 'relative',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    paddingHorizontal: 12,
    paddingVertical: 12,
    height: 48,
    minWidth: 80,
    gap: 6,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#E6C547',
    fontWeight: '500',
  },
  filterDropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    paddingVertical: 8,
    maxHeight: 300,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  filterDropdownSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6C547',
    paddingBottom: 8,
    marginBottom: 8,
  },
  filterDropdownTitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#E6C547',
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  filterDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterDropdownItemActive: {
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
  },
  filterDropdownItemText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
  },
  filterDropdownItemTextActive: {
    color: '#E6C547',
    fontWeight: 'bold',
  },
  sortDropdown: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    paddingVertical: 8,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10,
  },
  sortDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortDropdownItemActive: {
    backgroundColor: 'rgba(230, 197, 71, 0.2)',
  },
  sortDropdownItemText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
  },
  sortDropdownItemTextActive: {
    color: '#E6C547',
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    color: '#E6C547',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  venuesList: {
    gap: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: '#F5F5DC',
    textAlign: 'center',
    marginTop: 16,
  },
  refreshLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E6C547',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    gap: 6,
  },
  refreshButtonText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    color: '#E6C547',
    fontWeight: '600',
  },
});

export default VenueDiscoveryScreen;
