/**
 * Contact Screen - Professional contact form and quick actions
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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { submitQuery } from '../api/queries';

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select subject' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'property', label: 'Property Inquiry' },
  { value: 'viewing', label: 'Schedule Viewing' },
  { value: 'investment', label: 'Investment Opportunity' },
  { value: 'other', label: 'Other' },
];

export default function ContactScreen() {
  const { colors } = useTheme();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (!name) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (!email) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Required', 'Please enter a valid phone number (at least 10 digits).');
      return;
    }
    if (!message) {
      Alert.alert('Required', 'Please enter your message.');
      return;
    }

    setSubmitting(true);
    try {
      await submitQuery({
        name,
        email,
        phone,
        message,
        subject: form.subject ? SUBJECT_OPTIONS.find((o) => o.value === form.subject)?.label || form.subject : undefined,
        source: 'mobile_app',
      });
      Alert.alert('Thank You', 'Your message has been sent. We will get back to you shortly.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to send message');
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
          <Icon name="email-outline" size={44} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Get in Touch</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Have a question? We're here to help
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Send us a message</Text>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>Fill in the form below and we'll respond within 24 hours.</Text>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Your full name"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={(t) => setForm((p) => ({ ...p, name: t }))}
            autoCapitalize="words"
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            value={form.email}
            onChangeText={(t) => setForm((p) => ({ ...p, email: t }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Phone *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="+971 50 123 4567"
            placeholderTextColor={colors.textMuted}
            value={form.phone}
            onChangeText={(t) => setForm((p) => ({ ...p, phone: t }))}
            keyboardType="phone-pad"
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectRow}>
            {SUBJECT_OPTIONS.filter((o) => o.value).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.subjectChip,
                  { backgroundColor: form.subject === opt.value ? colors.primary + '25' : colors.bg, borderColor: colors.border },
                ]}
                onPress={() => setForm((p) => ({ ...p, subject: form.subject === opt.value ? '' : opt.value }))}
              >
                <Text style={[styles.subjectChipText, { color: form.subject === opt.value ? colors.primary : colors.text }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Message *</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Tell us how we can help..."
            placeholderTextColor={colors.textMuted}
            value={form.message}
            onChangeText={(t) => setForm((p) => ({ ...p, message: t }))}
            multiline
            numberOfLines={5}
          />

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="send" size={20} color="#fff" />
                <Text style={styles.btnText}>Send Message</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Contact</Text>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={openWhatsApp}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: '#25D366' + '20' }]}>
              <Icon name="whatsapp" size={28} color="#25D366" />
            </View>
            <View style={styles.quickBtnContent}>
              <Text style={[styles.quickBtnText, { color: colors.text }]}>WhatsApp</Text>
              <Text style={[styles.quickBtnSub, { color: colors.textMuted }]}>Chat with us instantly</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={openCall}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="phone" size={24} color={colors.primary} />
            </View>
            <View style={styles.quickBtnContent}>
              <Text style={[styles.quickBtnText, { color: colors.text }]}>Call Us</Text>
              <Text style={[styles.quickBtnSub, { color: colors.textMuted }]}>+971 50 123 4567</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
            onPress={openEmail}
          >
            <View style={[styles.quickIconWrap, { backgroundColor: colors.primary + '20' }]}>
              <Icon name="email" size={24} color={colors.primary} />
            </View>
            <View style={styles.quickBtnContent}>
              <Text style={[styles.quickBtnText, { color: colors.text }]}>Email</Text>
              <Text style={[styles.quickBtnSub, { color: colors.textMuted }]}>info@luxuryestate.ae</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textMuted} />
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
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: { fontSize: 28, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 15 },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: 14, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: { height: 120, paddingTop: 14, textAlignVertical: 'top' },
  subjectRow: { marginBottom: 16 },
  subjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  subjectChipText: { fontSize: 14, fontWeight: '600' },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
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
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnContent: { flex: 1 },
  quickBtnText: { fontSize: 16, fontWeight: '600' },
  quickBtnSub: { fontSize: 13, marginTop: 2 },
});
