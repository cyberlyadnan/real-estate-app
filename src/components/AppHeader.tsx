/**
 * App Header - Back button (chevron-left) + optional title, themed
 * Use on screens where native header is not shown
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

export interface AppHeaderProps {
  onBack: () => void;
  title?: string;
  right?: React.ReactNode;
}

export default function AppHeader({ onBack, title, right }: AppHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border, backgroundColor: colors.bg }]}>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Icon name="chevron-left" size={28} color={colors.primary} />
      </TouchableOpacity>
      {title ? (
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.title} />
      )}
      <View style={styles.right}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
    marginRight: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  right: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
});
