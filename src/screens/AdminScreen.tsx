/**
 * Admin Screen - Manage admin activities
 * Theme-aware (light/dark)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

function AdminScreen(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgSecondary }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Admin Dashboard
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage properties, leads, and listings
        </Text>
      </View>
      <View
        style={[
          styles.placeholder,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
          Admin management features will appear here
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 24 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  placeholder: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  placeholderText: { fontSize: 16 },
});

export default AdminScreen;
