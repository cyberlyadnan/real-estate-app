/**
 * More Screen - Professional menu with About, Contact, Settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const QUICK_LINKS = [
  { id: 'about', icon: 'domain', title: 'About Us', desc: 'Mission, values & expertise', screen: 'About' },
  { id: 'contact', icon: 'email-outline', title: 'Contact', desc: 'Get in touch with us', screen: 'Contact' },
];

const APP_SECTION = [
  { id: 'settings', icon: 'cog-outline', title: 'Settings', desc: 'Theme, admin & preferences', screen: 'Settings' },
];

export default function MoreScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const renderSection = (title: string, items: typeof QUICK_LINKS) => (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{title}</Text>
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            ...Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4 },
              android: { elevation: 2 },
            }),
          },
        ]}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.row,
              index < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
            ]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.6}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.primary + '18' }]}>
              <Icon name={item.icon as any} size={22} color={colors.primary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.rowDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.primary + '12' }]}>
        <View style={[styles.logoWrap, { backgroundColor: colors.primary }]}>
          <Icon name="domain" size={36} color="#fff" />
        </View>
        <Text style={[styles.brandName, { color: colors.text }]}>Luxury Real Estate</Text>
        <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
          Your trusted partner in premium properties
        </Text>
      </View>

      {/* Quick Links */}
      {renderSection('Quick Links', QUICK_LINKS)}

      {/* App */}
      {renderSection('App', APP_SECTION)}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandName: { fontSize: 24, fontWeight: '800', marginBottom: 6, letterSpacing: 0.3 },
  brandTagline: { fontSize: 14, textAlign: 'center' },
  section: { marginBottom: 28, paddingHorizontal: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  rowDesc: { fontSize: 13 },
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { fontSize: 12 },
});
