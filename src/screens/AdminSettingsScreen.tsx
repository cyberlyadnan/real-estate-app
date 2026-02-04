/**
 * Admin Settings - User info + Logout
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function AdminSettingsScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
          <Icon name="account" size={24} color={colors.primary} />
          <View style={styles.rowText}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
            <Text style={[styles.value, { color: colors.text }]}>{user?.name ?? '–'}</Text>
          </View>
        </View>
        <View style={styles.row}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  rowText: { flex: 1 },
  label: { fontSize: 12, marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '600' },
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
