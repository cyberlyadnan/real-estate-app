/**
 * Explore Screen - Browse properties (User App)
 * Theme-aware (light/dark)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

function ExploreScreen(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgSecondary }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Browse Properties
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Find your dream home from our property listings
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
          Property listings will appear here
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

export default ExploreScreen;
