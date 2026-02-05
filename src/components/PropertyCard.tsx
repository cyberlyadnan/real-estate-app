/**
 * Property card - Professional real estate listing card
 */

import React, { useState } from 'react';
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

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  penthouse: 'Penthouse',
  townhouse: 'Townhouse',
  commercial: 'Commercial',
  land: 'Land',
  office: 'Office',
};

const CATEGORY_LABELS: Record<string, string> = {
  sale: 'For Sale',
  rent: 'For Rent',
  both: 'Sale & Rent',
};

interface PropertyCardProps {
  property: PropertyListItem;
  onPress: () => void;
  compact?: boolean;
}

export default function PropertyCard({ property, onPress, compact }: PropertyCardProps) {
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);
  const imageUri = imgError ? 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80' : property.image;
  const typeLabel = property.propertyType ? PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType : null;
  const categoryLabel = property.category ? CATEGORY_LABELS[property.category] : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image container with overlay */}
      <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
        {/* Subtle gradient at top for badge readability */}
        <View style={styles.imageOverlayTop} />

        {/* Type badge - top left */}
        {/* {typeLabel && (
          <View style={[styles.typeBadge, { backgroundColor: colors.card + 'F2' }]}>
            <Text style={[styles.typeText, { color: colors.primary }]} numberOfLines={1}>{typeLabel}</Text>
          </View>
        )} */}

        {/* Price badge - top right */}
        <View style={[styles.priceBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.priceText} numberOfLines={1}>{property.price}</Text>
        </View>

      </View>

      {/* Content */}
      <View style={[styles.content, compact && styles.contentCompact]}>
        {categoryLabel && (
          <View style={[styles.categoryChip, { backgroundColor: colors.primary + '18' }]}>
            <Text style={[styles.categoryChipText, { color: colors.primary }]}>{categoryLabel}</Text>
          </View>
        )}
        <Text style={[styles.name, { color: colors.text }, compact && styles.nameCompact]} numberOfLines={2}>
          {property.name}
        </Text>
        <View style={styles.locationRow}>
          <Icon name="map-marker" size={14} color={colors.primary} />
          <Text style={[styles.location, { color: colors.textSecondary }]} numberOfLines={1}>
            {property.location}
          </Text>
        </View>
        <View style={[styles.specs, { borderTopColor: colors.border }, compact && styles.specsCompact]}>
          <View style={styles.spec}>
            <Icon name="bed-king-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>{property.bedrooms}</Text>
          </View>
          <View style={styles.spec}>
            <Icon name="shower" size={16} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>{property.bathrooms}</Text>
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
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  cardCompact: {
    borderRadius: 16,
  },
  imageWrap: {
    position: 'relative',
    height: 200,
  },
  imageWrapCompact: {
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  typeText: { fontSize: 12, fontWeight: '700' },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    maxWidth: '70%',
  },
  priceText: { fontSize: 13, fontWeight: '800', color: '#111827' },
  content: { padding: 18 },
  contentCompact: { padding: 14 },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryChipText: { fontSize: 11, fontWeight: '700' },
  name: { fontSize: 17, fontWeight: '800', lineHeight: 22, marginBottom: 8 },
  nameCompact: { fontSize: 15, fontWeight: '700' },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  location: { fontSize: 14, flex: 1 },
  specs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  specsCompact: {
    paddingTop: 12,
    gap: 10,
  },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  specArea: { flex: 1, minWidth: 0 },
  specText: { fontSize: 13, fontWeight: '600' },
  specTextArea: { flex: 1, minWidth: 0 },
});
