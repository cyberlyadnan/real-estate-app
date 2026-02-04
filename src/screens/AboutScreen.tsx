/**
 * About Screen - Expanded, professional (aligned with frontend)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

const STATS = [
  { icon: 'trending-up', value: 'AED 50B+', label: 'Assets Under Management' },
  { icon: 'home-city', value: '500+', label: 'Premium Properties' },
  { icon: 'account-group', value: '15K+', label: 'Satisfied Clients' },
  { icon: 'trophy', value: '30+', label: 'Years Experience' },
];

const WHY_US = [
  { icon: 'trophy', title: 'Proven Expertise', desc: 'Decades of experience in Dubai\'s real estate market with a track record of successful transactions.' },
  { icon: 'shield-check', title: 'Trust & Integrity', desc: 'Complete transparency and honest market insights. Our reputation is built on trust.' },
  { icon: 'trending-up', title: 'Market Knowledge', desc: 'Deep understanding of Dubai\'s dynamics, regulations, and investment trends.' },
  { icon: 'account-heart', title: 'Client-Focused', desc: 'Personalized solutions tailored to your goals and circumstances.' },
  { icon: 'domain', title: 'Premium Portfolio', desc: 'Exclusive access to Dubai\'s most prestigious developments.' },
  { icon: 'earth', title: 'Global Network', desc: 'Connections with international investors, developers, and institutions.' },
];

const CORE_VALUES = [
  { icon: 'handshake', title: 'Integrity', desc: 'Highest ethical standards in every interaction.' },
  { icon: 'target', title: 'Excellence', desc: 'Exceptional results that exceed expectations.' },
  { icon: 'heart', title: 'Client-Centric', desc: 'Your success is our success.' },
  { icon: 'lightbulb', title: 'Innovation', desc: 'Cutting-edge technology and forward-thinking solutions.' },
  { icon: 'flash', title: 'Efficiency', desc: 'Smooth, timely transactions.' },
  { icon: 'earth', title: 'Global Perspective', desc: 'International expertise for clients worldwide.' },
];

export default function AboutScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.primary + '12' }]}>
        <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
          <Icon name="domain" size={44} color="#fff" />
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>About Us</Text>
        <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
          Three decades of excellence in Dubai's premium real estate market. Trusted by investors worldwide.
        </Text>
      </View>

      {/* Stats */}
      <View style={[styles.statsWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {STATS.map((s, i) => (
          <View key={i} style={[styles.stat, i % 2 === 0 && { borderRightWidth: 1, borderRightColor: colors.border }, i < 2 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
              <Icon name={s.icon as any} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={2}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Our Heritage */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.badge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>OUR HERITAGE</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Building legacy since 1995
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Established in the heart of Dubai's dynamic real estate market, we have built an unparalleled reputation on trust, integrity, and deep market expertise. Over three decades, we have guided thousands of investors through their real estate journeys.
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          Our team combines decades of collective experience with a comprehensive understanding of market dynamics, regulatory frameworks, and investment strategies. We work exclusively with premium developments and established developers.
        </Text>
        <Text style={[styles.bodyBold, { color: colors.text }]}>
          What sets us apart is our unwavering commitment to transparency and client success. We build long-term relationships based on trust and deliver results that exceed expectations.
        </Text>
      </View>

      {/* Mission & Vision */}
      <View style={styles.twoCol}>
        <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.missionIcon, { backgroundColor: colors.primary }]}>
            <Icon name="target" size={26} color="#fff" />
          </View>
          <Text style={[styles.missionTitle, { color: colors.text }]}>Our Mission</Text>
          <Text style={[styles.missionBody, { color: colors.textSecondary }]}>
            To provide exceptional real estate advisory services that empower our clients to make informed investment decisions in Dubai's property market. We deliver transparent, professional guidance that prioritizes client success and long-term value.
          </Text>
        </View>
        <View style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.missionIcon, { backgroundColor: colors.primary }]}>
            <Icon name="eye" size={26} color="#fff" />
          </View>
          <Text style={[styles.missionTitle, { color: colors.text }]}>Our Vision</Text>
          <Text style={[styles.missionBody, { color: colors.textSecondary }]}>
            To be the most trusted real estate advisory firm in Dubai, recognized for our expertise, integrity, and commitment to client success. We envision a future where every investor has access to professional guidance that transforms aspirations into reality.
          </Text>
        </View>
      </View>

      {/* Why Choose Us */}
      <View style={styles.sectionHead}>
        <View style={[styles.badge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>WHY DUBAI ESTATES</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Why choose us</Text>
      </View>
      {WHY_US.map((item, i) => (
        <View key={i} style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.whyIcon, { backgroundColor: colors.primary + '20' }]}>
            <Icon name={item.icon as any} size={24} color={colors.primary} />
          </View>
          <View style={styles.whyContent}>
            <Text style={[styles.whyTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.whyDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
          </View>
        </View>
      ))}

      {/* Core Values */}
      <View style={styles.sectionHead}>
        <View style={[styles.badge, { backgroundColor: colors.primary + '18', borderColor: colors.primary + '40' }]}>
          <Text style={[styles.badgeText, { color: colors.primary }]}>WHAT DRIVES US</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Our core values</Text>
      </View>
      <View style={styles.valuesGrid}>
        {CORE_VALUES.map((v, i) => (
          <View key={i} style={[styles.valueCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.valueIcon, { backgroundColor: colors.primary + '18' }]}>
              <Icon name={v.icon as any} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.valueTitle, { color: colors.text }]}>{v.title}</Text>
            <Text style={[styles.valueDesc, { color: colors.textSecondary }]}>{v.desc}</Text>
          </View>
        ))}
      </View>

      {/* Contact CTA */}
      <View style={[styles.cta, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '35' }]}>
        <Text style={[styles.ctaTitle, { color: colors.text }]}>Get in touch</Text>
        <Text style={[styles.ctaSub, { color: colors.textSecondary }]}>
          Inquiries about properties or partnership opportunities
        </Text>
        <Text style={[styles.ctaEmail, { color: colors.primary }]}>info@luxuryestate.ae</Text>
        <Text style={[styles.ctaPhone, { color: colors.primary }]}>+971 50 123 4567</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 48 },
  hero: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
    marginBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  heroTitle: { fontSize: 28, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  heroSub: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  statsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  stat: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, textAlign: 'center' },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  sectionTitle: { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  body: { fontSize: 15, lineHeight: 24, marginBottom: 14 },
  bodyBold: { fontSize: 15, lineHeight: 24, fontWeight: '600' },
  twoCol: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginBottom: 24, gap: 14 },
  missionCard: {
    flex: 1,
    minWidth: '100%',
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  missionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  missionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  missionBody: { fontSize: 14, lineHeight: 22 },
  sectionHead: { marginHorizontal: 20, marginBottom: 16 },
  whyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
  },
  whyIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  whyContent: { flex: 1 },
  whyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  whyDesc: { fontSize: 14, lineHeight: 20 },
  valuesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 28,
    gap: 12,
  },
  valueCard: {
    width: '48%',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  valueIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  valueTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  valueDesc: { fontSize: 12, lineHeight: 18 },
  cta: {
    marginHorizontal: 20,
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  ctaTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  ctaSub: { fontSize: 14, marginBottom: 14, textAlign: 'center' },
  ctaEmail: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  ctaPhone: { fontSize: 16, fontWeight: '700' },
});
