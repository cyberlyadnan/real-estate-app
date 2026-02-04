/**
 * Admin Dashboard - Overview (placeholder for future stats)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

export default function AdminDashboardScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Icon name="view-dashboard" size={48} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Overview, stats and quick actions will appear here
        </Text>
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
  sub: { fontSize: 15, textAlign: 'center' },
});
