/**
 * Welcome Flow - 3-page app-style onboarding
 * Professional, minimal, native feel
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const PAGES = [
  {
    id: '1',
    icon: 'domain',
    title: "Dubai's Premier\nReal Estate",
    subtitle: '30+ years of excellence. Your trusted partner for luxury investments in the UAE.',
  },
  {
    id: '2',
    icon: 'home-search',
    title: 'Discover\nExclusive Properties',
    subtitle: 'Curated portfolio of premium apartments, villas & penthouses in prime locations.',
  },
  {
    id: '3',
    icon: 'chart-line',
    title: 'Smart\nInvestments',
    subtitle: 'Data-driven insights and expert guidance for above-market returns.',
  },
];

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

function WelcomeScreen({ onGetStarted }: WelcomeScreenProps): React.JSX.Element {
  const { colors, theme, toggleTheme } = useTheme();
  const [index, setIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isDark = theme === 'dark';

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const goNext = () => {
    if (index < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      onGetStarted();
    }
  };

  const renderPage = ({ item }: { item: (typeof PAGES)[0] }) => (
    <View style={[styles.page, { width }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '18' }]}>
        <Icon name={item.icon as any} size={48} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {item.subtitle}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={{ width: 44 }} />
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? colors.primary : colors.border,
                  width: i === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: colors.card }]}
          onPress={toggleTheme}
        >
          <Icon
            name={isDark ? 'white-balance-sunny' : 'moon-waning-crescent'}
            size={20}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: 20 }]}>
        <TouchableOpacity
          style={styles.cta}
          onPress={goNext}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>
            {index === PAGES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Icon
            name={index === PAGES.length - 1 ? 'check' : 'arrow-right'}
            size={22}
            color="#111827"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  themeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  page: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  footer: { paddingHorizontal: 24, paddingTop: 8 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 18,
    borderRadius: 14,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#111827' },
});

export default WelcomeScreen;
