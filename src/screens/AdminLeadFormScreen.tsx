/**
 * Admin Lead Form - Manually add new lead
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as AdminApi from '../api/admin';

const SOURCE_OPTIONS = [
  { value: 'lead_form', label: 'Lead Form' },
  { value: 'property_detail', label: 'Property Detail' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'contact_page', label: 'Contact Page' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'other', label: 'Other' },
];

export default function AdminLeadFormScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    source: 'lead_form',
    propertySlug: '',
    propertyName: '',
    budget: '',
    budgetMax: '',
    preferredArea: '',
    address: '',
  });

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      Alert.alert('Required', 'Name, email and phone are required');
      return;
    }
    setSaving(true);
    try {
      const res = await AdminApi.createLead({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim() || undefined,
        source: form.source,
        propertySlug: form.propertySlug.trim() || undefined,
        propertyName: form.propertyName.trim() || undefined,
        budget: form.budget ? Number(form.budget) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
        preferredArea: form.preferredArea.trim() || undefined,
        address: form.address.trim() || undefined,
      });
      if (res.success) {
        Alert.alert('Created', 'Lead created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', res.message || 'Failed to create lead');
      }
    } catch {
      Alert.alert('Error', 'Failed to create lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.toolbarSub, { color: colors.textSecondary }]}>New lead</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Info</Text>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="Lead name"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
          />
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Email *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="email@example.com"
            placeholderTextColor={colors.textMuted}
            value={form.email}
            onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Phone *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="+971 50 123 4567"
            placeholderTextColor={colors.textMuted}
            value={form.phone}
            onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Source</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {SOURCE_OPTIONS.map((o) => (
              <TouchableOpacity
                key={o.value}
                style={[styles.chip, { backgroundColor: form.source === o.value ? colors.primary + '25' : colors.bg, borderColor: colors.border }]}
                onPress={() => setForm((p) => ({ ...p, source: o.value }))}
              >
                <Text style={[styles.chipText, { color: form.source === o.value ? colors.primary : colors.text }]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Message</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="Initial message or notes..."
            placeholderTextColor={colors.textMuted}
            value={form.message}
            onChangeText={(v) => setForm((p) => ({ ...p, message: v }))}
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Property (optional)</Text>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Property Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Palm Jumeirah Residences"
            placeholderTextColor={colors.textMuted}
            value={form.propertyName}
            onChangeText={(v) => setForm((p) => ({ ...p, propertyName: v }))}
          />
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Property Slug</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. palm-jumeirah-residences"
            placeholderTextColor={colors.textMuted}
            value={form.propertySlug}
            onChangeText={(v) => setForm((p) => ({ ...p, propertySlug: v }))}
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Info</Text>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Budget (min) AED</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            value={form.budget}
            onChangeText={(v) => setForm((p) => ({ ...p, budget: v }))}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Budget (max) AED</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            value={form.budgetMax}
            onChangeText={(v) => setForm((p) => ({ ...p, budgetMax: v }))}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Preferred Area</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Palm Jumeirah, Downtown"
            placeholderTextColor={colors.textMuted}
            value={form.preferredArea}
            onChangeText={(v) => setForm((p) => ({ ...p, preferredArea: v }))}
          />
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="Full address if known"
            placeholderTextColor={colors.textMuted}
            value={form.address}
            onChangeText={(v) => setForm((p) => ({ ...p, address: v }))}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: colors.primary }]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="content-save" size={22} color="#fff" />
            <Text style={styles.submitBtnText}>Create Lead</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  backText: { fontSize: 16, fontWeight: '600' },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  toolbarSub: { fontSize: 14, fontWeight: '500' },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  headerSub: { fontSize: 14, marginTop: 4 },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  chipRow: { marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '600' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
