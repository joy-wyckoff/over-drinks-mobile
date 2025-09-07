import React from 'react';
import { Switch as RNSwitch, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const Switch = ({ value, onValueChange, ...props }) => {
  const { colors } = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      trackColor={{
        false: colors.muted,
        true: colors.primary,
      }}
      thumbColor={value ? colors.primaryForeground : colors.textSecondary}
      {...props}
    />
  );
};

export default Switch;
