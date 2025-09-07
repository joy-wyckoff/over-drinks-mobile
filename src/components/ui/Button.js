import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
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
        baseStyle.push({ color: colors.primaryForeground });
    }

    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.primaryForeground : colors.text}
          />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text style={getTextStyle()}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});

export default Button;
