/**
 * About Screen - Company info, mission, values
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.hero, { backgroundColor: colors.primary + '15' }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
          <Icon name="domain" size={48} color="#fff" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>About Us</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Your trusted partner in luxury real estate
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          We are committed to helping clients find their perfect property in Dubai and the UAE. With years of expertise in luxury real estate, we deliver exceptional service and transparent guidance throughout every transaction.
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>What We Offer</Text>
        {[
          { icon: 'home-city', title: 'Premium Properties', desc: 'Exclusive listings across Dubai, Abu Dhabi, and beyond' },
          { icon: 'handshake', title: 'Personalized Service', desc: 'Dedicated support tailored to your needs' },
          { icon: 'shield-check', title: 'Trusted Expertise', desc: 'Transparent guidance backed by industry knowledge' },
        ].map((item, i) => (
          <View key={i} style={[styles.feature, { borderBottomColor: colors.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
              <Icon name={item.icon as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
        <Text style={[styles.body, { color: colors.textSecondary, marginBottom: 12 }]}>
          Get in touch for inquiries about properties or partnership opportunities.
        </Text>
        <Text style={[styles.contactText, { color: colors.primary }]}>info@luxuryestate.ae</Text>
        <Text style={[styles.contactText, { color: colors.primary }]}>+971 50 123 4567</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  tagline: { fontSize: 15 },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  body: { fontSize: 15, lineHeight: 24 },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  featureDesc: { fontSize: 14, lineHeight: 20 },
  contactText: { fontSize: 16, fontWeight: '600', marginTop: 8 },
});
