/**
 * Admin Settings - Theme, User info + Logout
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function AdminSettingsScreen() {
  const { colors, theme, themeMode, setThemeMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const themeLabel =
    themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark';

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
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
          <Text style={[styles.rowValue, { color: colors.primary }]}>{themeLabel}</Text>
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
            <Text style={[styles.themeBtnText, { color: themeMode === 'light' ? colors.primary : colors.textSecondary }]}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              { backgroundColor: themeMode === 'dark' ? colors.primary + '25' : colors.bg, borderColor: colors.border },
            ]}
            onPress={() => setThemeMode('dark')}
          >
            <Icon name="weather-night" size={22} color={themeMode === 'dark' ? colors.primary : colors.textMuted} />
            <Text style={[styles.themeBtnText, { color: themeMode === 'dark' ? colors.primary : colors.textSecondary }]}>Dark</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              { backgroundColor: themeMode === 'system' ? colors.primary + '25' : colors.bg, borderColor: colors.border },
            ]}
            onPress={() => setThemeMode('system')}
          >
            <Icon name="cellphone" size={22} color={themeMode === 'system' ? colors.primary : colors.textMuted} />
            <Text style={[styles.themeBtnText, { color: themeMode === 'system' ? colors.primary : colors.textSecondary }]}>System</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Icon name="account" size={24} color={colors.primary} />
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.name ?? '–'}</Text>
          </View>
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Icon name="email" size={24} color={colors.primary} />
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Email</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.email ?? '–'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.error + '15', borderColor: colors.error + '40' }]}
        onPress={handleLogout}
      >
        <Icon name="logout" size={24} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  rowSub: { fontSize: 13 },
  rowValue: { fontSize: 14, fontWeight: '600' },
  rowText: { flex: 1 },
  label: { fontSize: 12, marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '600' },
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: { fontSize: 16, fontWeight: '700' },
});
