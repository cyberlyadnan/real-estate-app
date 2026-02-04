/**
 * Settings Screen - Theme & preferences (customer app only)
 * Admin is a separate area – use More → Admin Panel to enter
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

export default function SettingsScreen() {
  const { colors, theme, themeMode, setThemeMode, toggleTheme } = useTheme();

  const themeLabel =
    themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: colors.primary + '15' }]}>
        <Icon name="cog" size={40} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Customize your experience
        </Text>
      </View>

      {/* Appearance */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>

        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <View style={styles.rowLeft}>
            <Icon name="theme-light-dark" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Toggle light or dark theme
              </Text>
            </View>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primary + '60' }}
            thumbColor={theme === 'dark' ? colors.primary : colors.card}
          />
        </View>

        <TouchableOpacity
          style={[styles.row, { borderBottomWidth: 0 }]}
          onPress={() => setThemeMode(themeMode === 'system' ? 'light' : 'system')}
        >
          <View style={styles.rowLeft}>
            <Icon name="cellphone" size={24} color={colors.primary} />
            <View>
              <Text style={[styles.rowTitle, { color: colors.text }]}>Theme</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Current: {themeLabel}
              </Text>
            </View>
          </View>
          <Text style={[styles.rowValue, { color: colors.primary }]}>
            {themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark'}
          </Text>
        </TouchableOpacity>

        <View style={[styles.themeOptions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              { backgroundColor: themeMode === 'light' ? colors.primary + '25' : colors.bg, borderColor: colors.border },
            ]}
            onPress={() => setThemeMode('light')}
          >
            <Icon name="white-balance-sunny" size={22} color={themeMode === 'light' ? colors.primary : colors.textMuted} />
            <Text style={[styles.themeBtnText, { color: themeMode === 'light' ? colors.primary : colors.textSecondary }]}>
              Light
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              { backgroundColor: themeMode === 'dark' ? colors.primary + '25' : colors.bg, borderColor: colors.border },
            ]}
            onPress={() => setThemeMode('dark')}
          >
            <Icon name="weather-night" size={22} color={themeMode === 'dark' ? colors.primary : colors.textMuted} />
            <Text style={[styles.themeBtnText, { color: themeMode === 'dark' ? colors.primary : colors.textSecondary }]}>
              Dark
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              { backgroundColor: themeMode === 'system' ? colors.primary + '25' : colors.bg, borderColor: colors.border },
            ]}
            onPress={() => setThemeMode('system')}
          >
            <Icon name="cellphone" size={22} color={themeMode === 'system' ? colors.primary : colors.textMuted} />
            <Text style={[styles.themeBtnText, { color: themeMode === 'system' ? colors.primary : colors.textSecondary }]}>
              System
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* App info */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About App</Text>
        <Text style={[styles.appVersion, { color: colors.textSecondary }]}>Version 1.0.0</Text>
        <Text style={[styles.appDesc, { color: colors.textMuted }]}>
          Luxury Real Estate – Browse premium properties in Dubai & UAE
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 26, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 15 },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 18 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  rowSub: { fontSize: 13 },
  rowValue: { fontSize: 14, fontWeight: '600' },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  themeBtnText: { fontSize: 13, fontWeight: '600' },
  appVersion: { fontSize: 14, marginBottom: 8 },
  appDesc: { fontSize: 13, lineHeight: 20 },
});
