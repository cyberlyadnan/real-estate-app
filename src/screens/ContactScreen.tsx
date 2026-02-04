/**
 * Contact Screen - Contact form and info
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { submitQuery } from '../api/queries';

export default function ContactScreen() {
  const { colors } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      Alert.alert('Missing fields', 'Please fill in name, email and phone.');
      return;
    }
    setSubmitting(true);
    try {
      await submitQuery({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        message: form.message.trim() || 'General inquiry from app',
        source: 'contact_page',
      });
      Alert.alert('Thank you', 'We will get back to you shortly.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    Linking.openURL('https://wa.me/971501234567?text=Hi, I have an inquiry.');
  };

  const openEmail = () => {
    Linking.openURL('mailto:info@luxuryestate.ae');
  };

  const openCall = () => {
    Linking.openURL('tel:+971501234567');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.hero, { backgroundColor: colors.primary + '15' }]}>
          <Icon name="email-outline" size={40} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Get in Touch</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We'd love to hear from you
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Form</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Name *"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
            autoCapitalize="words"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Email *"
            placeholderTextColor={colors.textMuted}
            value={form.email}
            onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Phone *"
            placeholderTextColor={colors.textMuted}
            value={form.phone}
            onChangeText={(t) => setForm((p) => ({ ...p, phone: t }))}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Message"
            placeholderTextColor={colors.textMuted}
            value={form.message}
            onChangeText={(t) => setForm((p) => ({ ...p, message: t }))}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Icon name="send" size={20} color="#fff" />
            <Text style={styles.btnText}>{submitting ? 'Sending...' : 'Send Message'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Contact</Text>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={openWhatsApp}
          >
            <Icon name="whatsapp" size={28} color="#25D366" />
            <Text style={[styles.quickBtnText, { color: colors.text }]}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={openCall}
          >
            <Icon name="phone" size={24} color={colors.primary} />
            <Text style={[styles.quickBtnText, { color: colors.text }]}>Call +971 50 123 4567</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={openEmail}
          >
            <Icon name="email" size={24} color={colors.primary} />
            <Text style={[styles.quickBtnText, { color: colors.text }]}>info@luxuryestate.ae</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 14,
  },
  textArea: { height: 100, paddingTop: 14, textAlignVertical: 'top' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
    marginTop: 8,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  quickBtnText: { fontSize: 16, fontWeight: '600', flex: 1 },
});
