import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  ...props
}) => {
  const { colors } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
      default:
        baseStyle.push(styles.medium);
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.push({
          backgroundColor: colors.muted,
          borderWidth: 1,
          borderColor: colors.border,
        });
        break;
      case 'ghost':
        baseStyle.push({
          backgroundColor: 'transparent',
          borderWidth: 0,
        });
        break;
      case 'destructive':
        baseStyle.push({
          backgroundColor: colors.destructive,
        });
        break;
      default: // primary
        baseStyle.push({
          backgroundColor: colors.primary,
        });
    }

    if (disabled || loading) {
      baseStyle.push({ opacity: 0.5 });
    }

    if (style) {
      baseStyle.push(style);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
      default:
        baseStyle.push(styles.mediumText);
    }

    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.push({ color: colors.text });
        break;
      case 'ghost':
        baseStyle.push({ color: colors.textSecondary });
        break;
      case 'destructive':
        baseStyle.push({ color: colors.primaryForeground });
        break;
      default: // primary
        baseStyle.push({ color: '#ffffff' }); // White text for gold gradient
    }

    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  const renderButtonContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color="#ffffff"
        />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        style={[styles.button, styles.medium, style]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        {...props}
      >
        <LinearGradient
          colors={['#D4AF37', '#B8860B', '#9A7B0F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {renderButtonContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      {...props}
    >
      {renderButtonContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 44,
    width: '100%',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 16,
  },
  mediumText: {
    fontSize: 18,
  },
  largeText: {
    fontSize: 20,
  },
  gradient: {
    flex: 1,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default Button;
