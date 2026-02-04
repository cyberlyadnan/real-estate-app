/**
 * Home Screen - Website-like, mobile-native
 */

import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { fetchProperties } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import type { PropertyListItem } from '../api/properties';

const { width } = Dimensions.get('window');

const STATS = [
  { value: 'AED 50B+', label: 'Assets' },
  { value: '500+', label: 'Properties' },
  { value: '12%', label: 'Avg ROI' },
  { value: '15K+', label: 'Clients' },
];

const WHY_INVEST = [
  { icon: 'shield-check', title: 'Stable Market', desc: 'Government-backed, strong regulations' },
  { icon: 'trending-up', title: 'High Returns', desc: '12% avg ROI, capital appreciation' },
  { icon: 'earth', title: 'Global Hub', desc: 'Tax-free, world-class infrastructure' },
];

const STEPS = [
  { num: '01', title: 'Explore', desc: 'Browse our premium portfolio' },
  { num: '02', title: 'Consult', desc: 'Personalized investment strategy' },
  { num: '03', title: 'Secure', desc: 'Smooth transaction & documentation' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [featured, setFeatured] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await fetchProperties({ limit: 6, featured: true });
      setFeatured(data);
    } catch {
      setFeatured([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.card }]}>
        <View style={[styles.heroBadge, { backgroundColor: colors.primary + '20' }]}>
          <View style={[styles.heroDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.heroBadgeText, { color: colors.text }]}>
            30+ Years of Excellence
          </Text>
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>
          Dubai's Premier Real Estate
        </Text>
        <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
          Exclusive luxury properties for discerning investors
        </Text>
      </View>

      {/* Stats */}
      <View style={[styles.stats, { backgroundColor: colors.bgSecondary }]}>
        {STATS.map((s, i) => (
          <View key={i} style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Featured */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Featured Properties
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Properties')}
            style={styles.seeAll}
          >
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            <Icon name="chevron-right" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 32 }} />
        ) : featured.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Icon name="home-search" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No featured properties yet
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {featured.map((p) => (
              <View key={p._id} style={{ width: width * 0.82, marginRight: 16 }}>
                <PropertyCard
                  property={p}
                  onPress={() => navigation.navigate('PropertyDetail', { slug: p.slug })}
                />
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Why Invest */}
      <View style={[styles.section, { backgroundColor: colors.bgSecondary }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 20 }]}>
          Why Invest in Dubai
        </Text>
        {WHY_INVEST.map((item, i) => (
          <View
            key={i}
            style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.whyIcon, { backgroundColor: colors.primary + '20' }]}>
              <Icon name={item.icon as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.whyContent}>
              <Text style={[styles.whyTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.whyDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 20 }]}>
          How It Works
        </Text>
        {STEPS.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <View style={[styles.stepNum, { backgroundColor: colors.primary }]}>
              <Text style={styles.stepNumText}>{step.num}</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={[styles.cta, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}>
        <Text style={[styles.ctaTitle, { color: colors.text }]}>Ready to invest?</Text>
        <Text style={[styles.ctaSub, { color: colors.textSecondary }]}>
          Browse our full portfolio of premium properties
        </Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Properties')}
        >
          <Text style={styles.ctaBtnText}>Explore Properties</Text>
          <Icon name="arrow-right" size={20} color="#111827" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  hero: {
    padding: 24,
    paddingTop: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginBottom: 16,
  },
  heroDot: { width: 6, height: 6, borderRadius: 3 },
  heroBadgeText: { fontSize: 13, fontWeight: '600' },
  heroTitle: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  heroSub: { fontSize: 15, lineHeight: 22 },
  stats: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '500' },
  section: { padding: 20, paddingTop: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 22, fontWeight: '700' },
  seeAll: { flexDirection: 'row', alignItems: 'center' },
  seeAllText: { fontSize: 15, fontWeight: '600', marginRight: 4 },
  featuredScroll: { paddingRight: 20 },
  empty: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyText: { marginTop: 12, fontSize: 15 },
  whyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  whyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  whyContent: { flex: 1 },
  whyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  whyDesc: { fontSize: 14 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepNum: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumText: { fontSize: 14, fontWeight: '800', color: '#111827' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  stepDesc: { fontSize: 14 },
  cta: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  ctaTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  ctaSub: { fontSize: 15, marginBottom: 20, textAlign: 'center' },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 10,
  },
  ctaBtnText: { fontSize: 16, fontWeight: '700', color: '#111827' },
});
