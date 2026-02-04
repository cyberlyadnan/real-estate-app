/**
 * Placeholder for admin sections (Properties, Leads, Queries)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';

export default function AdminPlaceholderScreen() {
  const { colors } = useTheme();
  const route = useRoute<any>();
  const title = route.params?.title ?? 'Section';
  const icon = route.params?.icon ?? 'folder';

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Icon name={icon as any} size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>Coming soon</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  sub: { fontSize: 15 },
});
