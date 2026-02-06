/**
 * Property Detail Screen - Full property data, professional design
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  ActivityIndicator,
  Platform,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video from 'react-native-video';
import { useTheme } from '../contexts/ThemeContext';
import { useRoute, useNavigation } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import { fetchPropertyBySlug } from '../api/properties';
import { getUploadBase } from '../api/config';
import { submitQuery } from '../api/queries';

interface PropertyDetail {
  _id: string;
  slug: string;
  name: string;
  location: string;
  price: string;
  image: string;
  bedrooms: number | string;
  bathrooms: number | string;
  area: string;
  description: string;
  shortDescription?: string;
  images: string[];
  priceAmount?: number;
  priceCurrency?: string;
  pricePerSqft?: number;
  originalPrice?: number;
  discount?: number;
  paymentPlan?: string;
  downPayment?: number;
  monthlyPayment?: number;
  locationFull?: Record<string, any>;
  details?: Record<string, any>;
  features?: string[];
  amenities?: string[];
  locationInfo?: Array<{ title: string; value: string; description: string; icon?: string }>;
  investmentHighlights?: Array<{ title: string; value: string; description: string; color?: string }>;
  developer?: string;
  handoverDate?: string;
  ownershipType?: string;
  titleDeed?: boolean;
  mortgageAvailable?: boolean;
  status?: string;
  propertyType?: string;
  category?: string;
  virtualTour?: string;
  floorPlan?: string;
  videos?: string[];
}

const { width } = Dimensions.get('window');

const SECTION_SPACING = 24;
const CARD_RADIUS = 16;

function formatNum(v: number | undefined): string {
  if (v == null) return '–';
  return v.toLocaleString();
}

function Section({
  title,
  icon,
  children,
  colors,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  colors: Record<string, string>;
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '20' }]}>
          <Icon name={icon as any} size={22} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function PropertyDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const slug = route.params?.slug;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const imageListRef = useRef<FlatList>(null);

  const onImageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i >= 0 && i !== imageIndex) setImageIndex(i);
  };

  useEffect(() => {
    if (!slug) {
      navigation.goBack();
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const p = await fetchPropertyBySlug(slug);
        if (!cancelled) setProperty(p);
      } catch {
        if (!cancelled) setProperty(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

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
        message: form.message.trim() || 'Interested in this property',
        propertySlug: slug,
        propertyName: property?.name,
        source: 'mobile_app',
      });
      Alert.alert('Thank you', 'We will contact you shortly.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hi, I'm interested in: ${property?.name || ''}. Please share more details.`
    );
    Linking.openURL(`https://wa.me/971501234567?text=${msg}`);
  };

  const openLink = (url: string) => {
    const u = url.startsWith('http') ? url : `${getUploadBase()}${url.startsWith('/') ? '' : '/'}${url}`;
    Linking.openURL(u);
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!property) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Icon name="alert-circle" size={48} color={colors.textMuted} />
        <Text style={[styles.errorText, { color: colors.text }]}>Property not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={28} color={colors.primary} />
          <Text style={[styles.backBtnText, { color: colors.text }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = property.images?.length ? property.images : [property.image];
  const loc = property.locationFull || {};
  const det = property.details || {};
  const videos = property.videos || [];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader onBack={() => navigation.goBack()} title={property.name ? undefined : 'Property'} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Swipeable image gallery */}
        <View style={styles.galleryWrap}>
          <FlatList
            ref={imageListRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onImageScroll}
            scrollEventThrottle={16}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.mainImage}
                resizeMode="cover"
              />
            )}
          />
          {images.length > 1 && (
            <View style={styles.pageIndicator}>
              <Text style={[styles.pageIndicatorText, { color: colors.text }]}>
                {imageIndex + 1} / {images.length}
              </Text>
            </View>
          )}
          <View style={[styles.priceTag, { backgroundColor: colors.primary }]}>
            <Text style={styles.priceTagText}>{property.price}</Text>
          </View>
          {property.status && property.status !== 'available' && (
            <View style={[styles.statusTag, { backgroundColor: colors.text }]}>
              <Text style={styles.statusTagText}>{property.status}</Text>
            </View>
          )}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badges}>
            {property.propertyType && (
              <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>{property.propertyType}</Text>
              </View>
            )}
            {property.category && (
              <View style={[styles.badge, { backgroundColor: colors.border }]}>
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>{property.category}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{property.name}</Text>
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={18} color={colors.primary} />
            <Text style={[styles.location, { color: colors.textSecondary }]}>
              {[loc.area, loc.city, loc.country].filter(Boolean).join(', ') || property.location}
            </Text>
          </View>
          {property.shortDescription ? (
            <Text style={[styles.shortDesc, { color: colors.textSecondary }]}>{property.shortDescription}</Text>
          ) : null}
        </View>

        {/* Key specs */}
        <View style={[styles.specsCard, { backgroundColor: colors.card }]}>
          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Icon name="bed" size={24} color={colors.primary} />
              <Text style={[styles.specVal, { color: colors.text }]}>{property.bedrooms}</Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>Beds</Text>
            </View>
            <View style={styles.specItem}>
              <Icon name="shower" size={24} color={colors.primary} />
              <Text style={[styles.specVal, { color: colors.text }]}>{property.bathrooms}</Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>Baths</Text>
            </View>
            <View style={styles.specItem}>
              <Icon name="car" size={24} color={colors.primary} />
              <Text style={[styles.specVal, { color: colors.text }]}>{det.parking ?? '–'}</Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>Parking</Text>
            </View>
            <View style={styles.specItem}>
              <Icon name="square-outline" size={24} color={colors.primary} />
              <Text style={[styles.specVal, { color: colors.text }]}>{property.area}</Text>
              <Text style={[styles.specLabel, { color: colors.textMuted }]}>Area</Text>
            </View>
          </View>
        </View>

        {/* Price details */}
        <Section title="Price & Payment" icon="cash-multiple" colors={colors}>
          <View style={[styles.priceRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Price</Text>
            <Text style={[styles.priceValue, { color: colors.primary }]}>{property.price}</Text>
          </View>
          {property.pricePerSqft != null && (
            <View style={[styles.priceRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Price per sqft</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{formatNum(property.pricePerSqft)} {property.priceCurrency}/sqft</Text>
            </View>
          )}
          {property.paymentPlan && (
            <View style={[styles.priceRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Payment plan</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{property.paymentPlan}</Text>
            </View>
          )}
          {property.downPayment != null && (
            <View style={[styles.priceRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Down payment</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{property.priceCurrency} {formatNum(property.downPayment)}</Text>
            </View>
          )}
          {property.monthlyPayment != null && (
            <View style={[styles.priceRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Monthly</Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>{property.priceCurrency} {formatNum(property.monthlyPayment)}</Text>
            </View>
          )}
        </Section>

        {/* Property details */}
        <Section title="Property Details" icon="home-search" colors={colors}>
          <View style={styles.detailGrid}>
            {det.yearBuilt != null && (
              <View style={[styles.detailItem, { backgroundColor: colors.bg }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Year built</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{det.yearBuilt}</Text>
              </View>
            )}
            {det.furnishing && (
              <View style={[styles.detailItem, { backgroundColor: colors.bg }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Furnishing</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{det.furnishing}</Text>
              </View>
            )}
            {det.facing && (
              <View style={[styles.detailItem, { backgroundColor: colors.bg }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Facing</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{det.facing}</Text>
              </View>
            )}
            {det.floorNumber != null && (
              <View style={[styles.detailItem, { backgroundColor: colors.bg }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Floor</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{det.floorNumber} of {det.totalFloors ?? '–'}</Text>
              </View>
            )}
            {property.ownershipType && (
              <View style={[styles.detailItem, { backgroundColor: colors.bg }]}>
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Ownership</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{property.ownershipType}</Text>
              </View>
            )}
            {property.titleDeed && (
              <View style={[styles.detailItem, { backgroundColor: colors.bg }]}>
                <Icon name="file-document-check" size={20} color={colors.primary} />
                <Text style={[styles.detailValue, { color: colors.text, marginLeft: 8 }]}>Title deed available</Text>
              </View>
            )}
            {property.mortgageAvailable && (
              <View style={[styles.detailItem, { backgroundColor: colors.bg }]}>
                <Icon name="bank" size={20} color={colors.primary} />
                <Text style={[styles.detailValue, { color: colors.text, marginLeft: 8 }]}>Mortgage available</Text>
              </View>
            )}
          </View>
        </Section>

        {/* Location */}
        {(loc.address || (loc.landmarks && loc.landmarks.length > 0)) && (
          <Section title="Location" icon="map-marker-radius" colors={colors}>
            {loc.address ? (
              <Text style={[styles.addressText, { color: colors.textSecondary }]}>{loc.address}</Text>
            ) : null}
            {loc.landmarks && loc.landmarks.length > 0 ? (
              <View style={styles.landmarks}>
                {loc.landmarks.map((l, i) => (
                  <View key={i} style={[styles.landmarkTag, { backgroundColor: colors.primary + '15' }]}>
                    <Icon name="map-marker" size={14} color={colors.primary} />
                    <Text style={[styles.landmarkText, { color: colors.text }]}>{l}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Section>
        )}

        {/* Location info (distance, etc.) */}
        {property.locationInfo && property.locationInfo.length > 0 && (
          <Section title="Prime Location" icon="clock-outline" colors={colors}>
            {property.locationInfo.map((item, i) => (
              <View key={i} style={[styles.locationInfoRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.locationInfoTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.locationInfoValue, { color: colors.primary }]}>{item.value}</Text>
                <Text style={[styles.locationInfoDesc, { color: colors.textMuted }]}>{item.description}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* Description */}
        {property.description ? (
          <Section title="Description" icon="text" colors={colors}>
            <Text style={[styles.desc, { color: colors.textSecondary }]}>{property.description}</Text>
          </Section>
        ) : null}

        {/* Features */}
        {property.features && property.features.length > 0 && (
          <Section title="Features" icon="star-circle" colors={colors}>
            <View style={styles.featureGrid}>
              {property.features.map((f, i) => (
                <View key={i} style={[styles.featureChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                  <Icon name="check-circle" size={16} color={colors.primary} />
                  <Text style={[styles.featureText, { color: colors.text }]}>{f}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <Section title="Amenities" icon="home-city" colors={colors}>
            <View style={styles.featureGrid}>
              {property.amenities.map((a, i) => (
                <View key={i} style={[styles.amenityChip, { backgroundColor: colors.bg }]}>
                  <Icon name="checkbox-marked-circle-outline" size={16} color={colors.primary} />
                  <Text style={[styles.amenityText, { color: colors.textSecondary }]}>{a}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Investment highlights */}
        {property.investmentHighlights && property.investmentHighlights.length > 0 && (
          <Section title="Investment Highlights" icon="chart-line" colors={colors}>
            {property.investmentHighlights.map((h, i) => (
              <View key={i} style={[styles.highlightCard, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '25' }]}>
                <Text style={[styles.highlightValue, { color: colors.primary }]}>{h.value}</Text>
                <Text style={[styles.highlightTitle, { color: colors.text }]}>{h.title}</Text>
                <Text style={[styles.highlightDesc, { color: colors.textSecondary }]}>{h.description}</Text>
              </View>
            ))}
          </Section>
        )}

        {/* Developer & handover */}
        {(property.developer || property.handoverDate) && (
          <Section title="Developer" icon="domain" colors={colors}>
            {property.developer ? (
              <Text style={[styles.developerText, { color: colors.text }]}>{property.developer}</Text>
            ) : null}
            {property.handoverDate ? (
              <View style={[styles.handoverRow, { backgroundColor: colors.bg }]}>
                <Icon name="calendar" size={20} color={colors.primary} />
                <Text style={[styles.handoverText, { color: colors.text }]}>Handover: {property.handoverDate}</Text>
              </View>
            ) : null}
          </Section>
        )}

        {/* Videos - play in-app */}
        {videos.length > 0 && (
          <Section title="Videos" icon="video" colors={colors}>
            {videos.map((url, i) => {
              const fullUrl = url.startsWith('http') ? url : `${getUploadBase()}${url.startsWith('/') ? '' : '/'}${url}`;
              return (
                <View key={i} style={[styles.videoWrap, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[styles.videoLabel, { color: colors.textSecondary }]}>Video {i + 1}</Text>
                  <Video
                    source={{ uri: fullUrl }}
                    style={styles.videoPlayer}
                    controls
                    resizeMode="contain"
                  />
                </View>
              );
            })}
          </Section>
        )}

        {/* Floor plan & virtual tour */}
        {(property.floorPlan || property.virtualTour) && (
          <Section title="Resources" icon="file-document-multiple" colors={colors}>
            {property.floorPlan ? (
              <TouchableOpacity
                style={[styles.resourceBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                onPress={() => openLink(property.floorPlan!)}
              >
                <Icon name="floor-plan" size={24} color={colors.primary} />
                <Text style={[styles.resourceBtnText, { color: colors.text }]}>View Floor Plan</Text>
                <Icon name="open-in-new" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
            {property.virtualTour ? (
              <TouchableOpacity
                style={[styles.resourceBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                onPress={() => openLink(property.virtualTour!)}
              >
                <Icon name="video" size={24} color={colors.primary} />
                <Text style={[styles.resourceBtnText, { color: colors.text }]}>Virtual Tour</Text>
                <Icon name="open-in-new" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null}
          </Section>
        )}

        {/* Contact form */}
        <Section title="Request Information" icon="email-outline" colors={colors}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Name"
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={(t) => setForm((f) => ({ ...f, name: t }))}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            value={form.email}
            onChangeText={(t) => setForm((f) => ({ ...f, email: t }))}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Phone"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(t) => setForm((f) => ({ ...f, phone: t }))}
          />
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Message (optional)"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={form.message}
            onChangeText={(t) => setForm((f) => ({ ...f, message: t }))}
          />
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <>
                <Text style={styles.submitText}>Submit Enquiry</Text>
                <Icon name="send" size={20} color="#111827" />
              </>
            )}
          </TouchableOpacity>
        </Section>

        {/* WhatsApp */}
        <TouchableOpacity style={styles.whatsappBtn} onPress={openWhatsApp}>
          <Icon name="whatsapp" size={28} color="#fff" />
          <Text style={styles.whatsappText}>Chat on WhatsApp</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 18, marginTop: 16 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
  },
  backBtnText: { fontSize: 16, fontWeight: '700' },
  galleryWrap: { position: 'relative', marginBottom: SECTION_SPACING, height: 300 },
  mainImage: { width, height: 300 },
  pageIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pageIndicatorText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  priceTag: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  priceTagText: { fontSize: 15, fontWeight: '800', color: '#111827' },
  statusTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusTagText: { fontSize: 12, fontWeight: '700', color: '#fff', textTransform: 'capitalize' },
  header: { paddingHorizontal: 20, marginBottom: SECTION_SPACING },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  name: { fontSize: 26, fontWeight: '800', marginBottom: 10, lineHeight: 34 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  location: { fontSize: 15, flex: 1 },
  shortDesc: { fontSize: 15, lineHeight: 22 },
  specsCard: {
    marginHorizontal: 20,
    marginBottom: SECTION_SPACING,
    padding: 20,
    borderRadius: CARD_RADIUS,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  specsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  specItem: { alignItems: 'center' },
  specVal: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  specLabel: { fontSize: 11, marginTop: 4 },
  section: {
    marginHorizontal: 20,
    marginBottom: SECTION_SPACING,
    padding: 20,
    borderRadius: CARD_RADIUS,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  sectionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  priceLabel: { fontSize: 14 },
  priceValue: { fontSize: 15, fontWeight: '600' },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  detailLabel: { fontSize: 11, marginRight: 6 },
  detailValue: { fontSize: 14, fontWeight: '600' },
  addressText: { fontSize: 15, marginBottom: 12, lineHeight: 22 },
  landmarks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  landmarkTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6 },
  landmarkText: { fontSize: 13 },
  locationInfoRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  locationInfoTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  locationInfoValue: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  locationInfoDesc: { fontSize: 13 },
  desc: { fontSize: 15, lineHeight: 24 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  featureText: { fontSize: 14, fontWeight: '500' },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  amenityText: { fontSize: 14 },
  highlightCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  highlightValue: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  highlightTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  highlightDesc: { fontSize: 13 },
  developerText: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  handoverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 10,
  },
  handoverText: { fontSize: 15, fontWeight: '600' },
  videoWrap: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  videoLabel: { fontSize: 13, marginBottom: 8, fontWeight: '600' },
  videoPlayer: { width: '100%', height: 200 },
  resourceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  resourceBtnText: { fontSize: 16, fontWeight: '600', flex: 1 },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    marginTop: 8,
  },
  submitDisabled: { opacity: 0.7 },
  submitText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 12,
  },
  whatsappText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
