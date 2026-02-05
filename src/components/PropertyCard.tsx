/**
 * Property card - used in Home & Properties list
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';

interface PropertyListItem {
  _id: string;
  slug: string;
  name: string;
  location: string;
  price: string;
  image: string;
  bedrooms: number | string;
  bathrooms: number | string;
  area: string;
  propertyType?: string;
  category?: string;
}

interface PropertyCardProps {
  property: PropertyListItem;
  onPress: () => void;
  compact?: boolean;
}

export default function PropertyCard({ property, onPress, compact }: PropertyCardProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.imageWrap, compact && { height: 120 }]}>
        <Image
          source={{ uri: property.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={[styles.priceBadge, { backgroundColor: colors.primary }, compact && { paddingHorizontal: 8, paddingVertical: 4 }]}>
          <Text style={[styles.priceText, compact && { fontSize: 11 }]} numberOfLines={1}>{property.price}</Text>
        </View>
      </View>
      <View style={[styles.content, compact && { padding: 12 }]}>
        <Text style={[styles.name, { color: colors.text }, compact && { fontSize: 15 }]} numberOfLines={2}>
          {property.name}
        </Text>
        <View style={styles.locationRow}>
          <Icon name="map-marker" size={14} color={colors.primary} />
          <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
            {property.location}
          </Text>
        </View>
        <View style={[styles.specs, { borderTopColor: colors.border }, compact && { paddingTop: 8, gap: 8 }]}>
          <View style={styles.spec}>
            <Icon name="bed" size={16} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textSecondary }]} numberOfLines={1}>{property.bedrooms}</Text>
          </View>
          <View style={styles.spec}>
            <Icon name="shower" size={16} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textSecondary }]} numberOfLines={1}>{property.bathrooms}</Text>
          </View>
          <View style={[styles.spec, styles.specArea]}>
            <Icon name="square-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.specText, styles.specTextArea, { color: colors.textSecondary }]} numberOfLines={1}>{property.area}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  imageWrap: { position: 'relative', height: 180 },
  image: { width: '100%', height: '100%' },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  priceText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  content: { padding: 16 },
  name: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  location: { fontSize: 14, flex: 1 },
  specs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  specArea: { flex: 1, minWidth: 0 },
  specText: { fontSize: 13 },
  specTextArea: { flex: 1, minWidth: 0 },
});
