import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const TextArea = ({ style, ...props }) => {
  const { colors } = useTheme();

  return (
    <TextInput
      style={[
        styles.textArea,
        {
          backgroundColor: colors.muted,
          borderColor: colors.border,
          color: colors.text,
        },
        style,
      ]}
      placeholderTextColor={colors.textSecondary}
      multiline
      textAlignVertical="top"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
});

export default TextArea;
