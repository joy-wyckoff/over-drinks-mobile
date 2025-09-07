# Over Drinks - Mobile App

A React Native mobile app for meeting people at bars and clubs, built with Expo.

## Features

- **Venue Discovery**: Find bars, clubs, and speakeasies in your area
- **Check-in System**: Check into venues with location verification
- **Profile Creation**: Create detailed profiles with interests and photos
- **Matching System**: Meet people at the same venue
- **Real-time Updates**: See who's currently at each venue

## Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Run on iOS Simulator**:
   ```bash
   npm run ios
   ```

4. **Run on Android Emulator**:
   ```bash
   npm run android
   ```

## Backend Configuration

Update the `API_BASE_URL` in the following files to point to your backend:
- `src/contexts/AuthContext.js`
- `src/utils/api.js`

## Building for Production

### iOS

1. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

2. **Submit to App Store**:
   ```bash
   eas submit --platform ios
   ```

### Android

1. **Build for Android**:
   ```bash
   eas build --platform android
   ```

2. **Submit to Google Play**:
   ```bash
   eas submit --platform android
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Card, Input, etc.)
│   ├── VenueCard.js    # Venue display component
│   └── ProfileCard.js  # Profile display component
├── contexts/           # React contexts
│   ├── AuthContext.js  # Authentication state
│   └── ThemeContext.js # Theme and styling
├── navigation/         # Navigation configuration
│   └── AppNavigator.js # Main navigation setup
├── screens/           # Screen components
│   ├── LandingScreen.js
│   ├── HomeScreen.js
│   ├── ProfileCreationScreen.js
│   ├── VenueDiscoveryScreen.js
│   ├── CheckInScreen.js
│   └── ProfileBrowsingScreen.js
├── shared/            # Shared utilities and schemas
│   └── schema.js      # Data validation schemas
└── utils/             # Utility functions
    └── api.js         # API client and endpoints
```

## Key Features Implemented

### Authentication
- Secure token storage using Expo SecureStore
- Automatic token refresh and logout handling
- Protected routes based on authentication status

### Location Services
- GPS location detection for venue check-ins
- Distance calculation and verification
- Location permission handling

### Image Handling
- Profile photo upload with image compression
- Camera and gallery access
- Image picker integration

### Navigation
- Stack navigation between screens
- Parameter passing between screens
- Back navigation handling

### State Management
- React Query for server state management
- React Context for global app state
- Local state management with hooks

## Customization

### Theming
The app uses a dark theme by default to match the "speakeasy" aesthetic. You can customize colors in `src/contexts/ThemeContext.js`.

### API Integration
All API calls are centralized in `src/utils/api.js`. Update the base URL and add new endpoints as needed.

### Styling
The app uses React Native StyleSheet for styling. All components are designed to be responsive and work on both iOS and Android.

## Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **iOS Simulator not starting**: Make sure Xcode is installed and simulator is available
3. **Android build issues**: Ensure Android Studio and SDK are properly configured
4. **Location permissions**: Make sure location permissions are granted in device settings

### Development Tips

- Use the Expo Go app for quick testing on physical devices
- Enable hot reloading for faster development
- Use React Native Debugger for debugging
- Check the Expo documentation for platform-specific features

## License

MIT License - see LICENSE file for details.
