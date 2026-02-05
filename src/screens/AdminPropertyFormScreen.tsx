/**
 * Admin Property Form - Add / Edit (CRUD)
 * Full property form matching Next.js frontend - all fields
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as AdminApi from '../api/admin';
import { API_BASE } from '../api/config';

const PROPERTY_TYPES = ['apartment', 'villa', 'penthouse', 'townhouse', 'commercial', 'land', 'office'];
const CATEGORIES = ['sale', 'rent', 'both'];
const STATUSES = ['available', 'sold', 'rented', 'pending', 'off-market'];
const CURRENCIES = ['AED', 'USD', 'EUR', 'GBP'];
const FURNISHING = ['', 'furnished', 'semi-furnished', 'unfurnished'];
const OWNERSHIP = ['freehold', 'leasehold'];
const LOC_ICONS = ['navigation', 'clock', 'car', 'mapPin'];
const INV_COLORS = ['from-primary to-primary-light', 'from-green-500 to-emerald-600', 'from-blue-500 to-cyan-600', 'from-purple-500 to-pink-600'];

type LocInfo = { title: string; value: string; description: string; icon: string };
type InvHighlight = { title: string; value: string; description: string; color: string };

export default function AdminPropertyFormScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const propertyId = route.params?.propertyId as string | undefined;
  const isEdit = !!propertyId;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [videoUris, setVideoUris] = useState<string[]>([]);
  const [floorPlanUri, setFloorPlanUri] = useState<string | null>(null);
  const [existingImagePaths, setExistingImagePaths] = useState<string[]>([]);
  const [existingVideoPaths, setExistingVideoPaths] = useState<string[]>([]);
  const [existingFloorPlanPath, setExistingFloorPlanPath] = useState<string>('');
  const [landmarkInput, setLandmarkInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [amenityInput, setAmenityInput] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    shortDescription: '',
    propertyType: 'apartment',
    category: 'sale',
    status: 'available',
    address: '',
    area: '',
    city: 'Dubai',
    emirate: 'Dubai',
    country: 'United Arab Emirates',
    zipCode: '',
    lat: '',
    lng: '',
    landmarks: [] as string[],
    amount: '',
    currency: 'AED',
    pricePerSqft: '',
    originalPrice: '',
    discount: '',
    paymentPlan: '',
    downPayment: '',
    monthlyPayment: '',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    builtUp: '',
    plot: '',
    balcony: '',
    yearBuilt: '',
    floorNumber: '',
    totalFloors: '',
    furnishing: '',
    facing: '',
    features: [] as string[],
    amenities: [] as string[],
    locationInfo: [] as LocInfo[],
    investmentHighlights: [] as InvHighlight[],
    developer: '',
    handoverDate: '',
    ownershipType: '',
    titleDeed: false,
    mortgageAvailable: false,
    metaTitle: '',
    metaDescription: '',
    virtualTour: '',
    isPublished: false,
    featured: false,
    featuredUntil: '',
  });

  useEffect(() => {
    if (propertyId) {
      AdminApi.getProperty(propertyId).then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          const loc = p.location || {};
          const price = p.price || {};
          const details = p.details || {};
          const area = details.area || {};
          setForm({
            name: p.name || '',
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            propertyType: p.propertyType || 'apartment',
            category: p.category || 'sale',
            status: p.status || 'available',
            address: loc.address || '',
            area: loc.area || '',
            city: loc.city || 'Dubai',
            emirate: loc.emirate || 'Dubai',
            country: loc.country || 'United Arab Emirates',
            zipCode: loc.zipCode || '',
            lat: loc.coordinates?.lat?.toString() || '',
            lng: loc.coordinates?.lng?.toString() || '',
            landmarks: loc.landmarks || [],
            amount: price.amount?.toString() || '',
            currency: price.currency || 'AED',
            pricePerSqft: price.pricePerSqft?.toString() || '',
            originalPrice: price.originalPrice?.toString() || '',
            discount: price.discount?.toString() || '',
            paymentPlan: price.paymentPlan || '',
            downPayment: price.downPayment?.toString() || '',
            monthlyPayment: price.monthlyPayment?.toString() || '',
            bedrooms: details.bedrooms?.toString() || '',
            bathrooms: details.bathrooms?.toString() || '',
            parking: details.parking?.toString() || '',
            builtUp: area.builtUp?.toString() || '',
            plot: area.plot?.toString() || '',
            balcony: area.balcony?.toString() || '',
            yearBuilt: details.yearBuilt?.toString() || '',
            floorNumber: details.floorNumber?.toString() || '',
            totalFloors: details.totalFloors?.toString() || '',
            furnishing: details.furnishing || '',
            facing: details.facing || '',
            features: p.features || [],
            amenities: p.amenities || [],
            locationInfo: Array.isArray(p.locationInfo) ? p.locationInfo : [],
            investmentHighlights: Array.isArray(p.investmentHighlights) ? p.investmentHighlights : [],
            developer: p.developer || '',
            handoverDate: p.handoverDate ? new Date(p.handoverDate).toISOString().split('T')[0] : '',
            ownershipType: p.ownershipType || '',
            titleDeed: p.titleDeed || false,
            mortgageAvailable: p.mortgageAvailable || false,
            metaTitle: p.metaTitle || '',
            metaDescription: p.metaDescription || '',
            virtualTour: p.virtualTour || '',
            isPublished: p.isPublished || false,
            featured: p.featured || false,
            featuredUntil: p.featuredUntil ? new Date(p.featuredUntil).toISOString().split('T')[0] : '',
          });
          if (p.images?.length) {
            const paths = p.images.map((img: string) => (img.startsWith('http') ? img.replace(/^[^/]*\/\/[^/]+/, '') : img));
            setExistingImagePaths(paths);
            setImageUris(p.images.map((img: string) => (img.startsWith('http') ? img : `${API_BASE}${img}`)));
          }
          if (p.videos?.length) {
            const paths = p.videos.map((v: string) => (v.startsWith('http') ? v.replace(/^[^/]*\/\/[^/]+/, '') : v));
            setExistingVideoPaths(paths);
            setVideoUris(p.videos.map((v: string) => (v.startsWith('http') ? v : `${API_BASE}${v}`)));
          }
          if (p.floorPlan) {
            const path = p.floorPlan.startsWith('http') ? p.floorPlan.replace(/^[^/]*\/\/[^/]+/, '') : p.floorPlan;
            setExistingFloorPlanPath(path);
            setFloorPlanUri(p.floorPlan.startsWith('http') ? p.floorPlan : `${API_BASE}${p.floorPlan}`);
          }
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [propertyId]);

  const pickImages = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 10, includeBase64: false },
      (res) => {
        if (res.assets?.length) {
          const uris = res.assets.map((a) => a.uri!).filter(Boolean);
          setImageUris((prev) => [...prev, ...uris]);
        }
      }
    );
  };

  const pickVideos = () => {
    launchImageLibrary(
      { mediaType: 'video', selectionLimit: 5, includeBase64: false },
      (res) => {
        if (res.assets?.length) {
          const uris = res.assets.map((a) => a.uri!).filter(Boolean);
          setVideoUris((prev) => [...prev, ...uris]);
        }
      }
    );
  };

  const pickFloorPlan = () => {
    launchImageLibrary(
      { mediaType: 'photo', selectionLimit: 1, includeBase64: false },
      (res) => {
        if (res.assets?.[0]?.uri) {
          setFloorPlanUri(res.assets[0].uri);
          setExistingFloorPlanPath('');
        }
      }
    );
  };

  const removeImage = (index: number) => {
    if (index < existingImagePaths.length) {
      setExistingImagePaths((prev) => prev.filter((_, i) => i !== index));
    }
    setImageUris((prev) => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    if (index < existingVideoPaths.length) {
      setExistingVideoPaths((prev) => prev.filter((_, i) => i !== index));
    }
    setVideoUris((prev) => prev.filter((_, i) => i !== index));
  };

  const addLandmark = () => {
    const v = landmarkInput.trim();
    if (v) {
      setForm((f) => ({ ...f, landmarks: [...f.landmarks, v] }));
      setLandmarkInput('');
    }
  };

  const removeLandmark = (i: number) => {
    setForm((f) => ({ ...f, landmarks: f.landmarks.filter((_, idx) => idx !== i) }));
  };

  const addFeature = () => {
    const v = featureInput.trim();
    if (v) {
      setForm((f) => ({ ...f, features: [...f.features, v] }));
      setFeatureInput('');
    }
  };

  const removeFeature = (i: number) => {
    setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  };

  const addAmenity = () => {
    const v = amenityInput.trim();
    if (v) {
      setForm((f) => ({ ...f, amenities: [...f.amenities, v] }));
      setAmenityInput('');
    }
  };

  const removeAmenity = (i: number) => {
    setForm((f) => ({ ...f, amenities: f.amenities.filter((_, idx) => idx !== i) }));
  };

  const addLocationInfo = () => {
    setForm((f) => ({
      ...f,
      locationInfo: [...f.locationInfo, { title: '', value: '', description: '', icon: 'mapPin' }],
    }));
  };

  const updateLocationInfo = (i: number, field: keyof LocInfo, val: string) => {
    setForm((f) => {
      const arr = [...f.locationInfo];
      arr[i] = { ...arr[i], [field]: val };
      return { ...f, locationInfo: arr };
    });
  };

  const removeLocationInfo = (i: number) => {
    setForm((f) => ({ ...f, locationInfo: f.locationInfo.filter((_, idx) => idx !== i) }));
  };

  const addInvestmentHighlight = () => {
    setForm((f) => ({
      ...f,
      investmentHighlights: [...f.investmentHighlights, { title: '', value: '', description: '', color: 'from-primary to-primary-light' }],
    }));
  };

  const updateInvestmentHighlight = (i: number, field: keyof InvHighlight, val: string) => {
    setForm((f) => {
      const arr = [...f.investmentHighlights];
      arr[i] = { ...arr[i], [field]: val };
      return { ...f, investmentHighlights: arr };
    });
  };

  const removeInvestmentHighlight = (i: number) => {
    setForm((f) => ({ ...f, investmentHighlights: f.investmentHighlights.filter((_, idx) => idx !== i) }));
  };

  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('description', form.description);
    if (form.shortDescription) fd.append('shortDescription', form.shortDescription);
    fd.append('propertyType', form.propertyType);
    fd.append('category', form.category);
    fd.append('status', form.status);
    fd.append('location', JSON.stringify({
      address: form.address,
      area: form.area,
      city: form.city,
      emirate: form.emirate,
      country: form.country || 'United Arab Emirates',
      zipCode: form.zipCode || '',
      coordinates: {
        lat: form.lat ? Number(form.lat) : undefined,
        lng: form.lng ? Number(form.lng) : undefined,
      },
      landmarks: form.landmarks || [],
    }));
    fd.append('price', JSON.stringify({
      amount: Number(form.amount) || 0,
      currency: form.currency,
      pricePerSqft: form.pricePerSqft ? Number(form.pricePerSqft) : undefined,
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      discount: form.discount ? Number(form.discount) : undefined,
      paymentPlan: form.paymentPlan || undefined,
      downPayment: form.downPayment ? Number(form.downPayment) : undefined,
      monthlyPayment: form.monthlyPayment ? Number(form.monthlyPayment) : undefined,
    }));
    fd.append('details', JSON.stringify({
      bedrooms: Number(form.bedrooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      parking: Number(form.parking) || 0,
      area: {
        builtUp: Number(form.builtUp) || 0,
        plot: form.plot ? Number(form.plot) : undefined,
        balcony: form.balcony ? Number(form.balcony) : undefined,
      },
      yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
      floorNumber: form.floorNumber ? Number(form.floorNumber) : undefined,
      totalFloors: form.totalFloors ? Number(form.totalFloors) : undefined,
      furnishing: form.furnishing || undefined,
      facing: form.facing || undefined,
    }));
    fd.append('features', JSON.stringify(form.features || []));
    fd.append('amenities', JSON.stringify(form.amenities || []));
    fd.append('locationInfo', JSON.stringify(form.locationInfo || []));
    fd.append('investmentHighlights', JSON.stringify(form.investmentHighlights || []));
    if (form.developer) fd.append('developer', form.developer);
    if (form.handoverDate) fd.append('handoverDate', form.handoverDate);
    if (form.ownershipType) fd.append('ownershipType', form.ownershipType);
    fd.append('titleDeed', String(form.titleDeed));
    fd.append('mortgageAvailable', String(form.mortgageAvailable));
    if (form.metaTitle) fd.append('metaTitle', form.metaTitle);
    if (form.metaDescription) fd.append('metaDescription', form.metaDescription);
    if (form.virtualTour) fd.append('virtualTour', form.virtualTour);
    fd.append('featured', String(form.featured));
    if (form.featuredUntil) fd.append('featuredUntil', form.featuredUntil);
    fd.append('isActive', 'true');
    fd.append('isPublished', String(form.isPublished));

    if (isEdit && existingImagePaths.length > 0) {
      fd.append('existingImages', JSON.stringify(existingImagePaths));
    }
    if (isEdit && existingVideoPaths.length > 0) {
      fd.append('existingVideos', JSON.stringify(existingVideoPaths));
    }
    if (isEdit && existingFloorPlanPath) {
      fd.append('existingFloorPlan', existingFloorPlanPath);
    }

    imageUris.filter((u) => !u.startsWith('http')).forEach((uri, i) => {
      fd.append('images', {
        uri,
        type: 'image/jpeg',
        name: `image_${i}.jpg`,
      } as any);
    });
    videoUris.filter((u) => !u.startsWith('http')).forEach((uri, i) => {
      fd.append('videos', {
        uri,
        type: 'video/mp4',
        name: `video_${i}.mp4`,
      } as any);
    });
    if (floorPlanUri && !floorPlanUri.startsWith('http')) {
      fd.append('floorPlan', {
        uri: floorPlanUri,
        type: 'image/jpeg',
        name: 'floorplan.jpg',
      } as any);
    }

    return fd;
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      Alert.alert('Validation', 'Property name is required');
      return;
    }
    if (!form.description?.trim()) {
      Alert.alert('Validation', 'Description is required');
      return;
    }
    if (!form.address?.trim()) {
      Alert.alert('Validation', 'Address is required');
      return;
    }
    if (!form.area?.trim()) {
      Alert.alert('Validation', 'Area is required');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      Alert.alert('Validation', 'Valid price is required');
      return;
    }
    const totalImages = (isEdit ? existingImagePaths.length : 0) + imageUris.filter((u) => !u.startsWith('http')).length;
    if (totalImages === 0) {
      Alert.alert('Validation', 'At least one image is required');
      return;
    }

    setSubmitting(true);
    try {
      const fd = buildFormData();
      const res = isEdit
        ? await AdminApi.updateProperty(propertyId!, fd)
        : await AdminApi.createProperty(fd);

      if (res.success) {
        Alert.alert('Success', isEdit ? 'Property updated.' : 'Property created.', [
          { text: 'OK', onPress: () => navigation.navigate('PropertyList') },
        ]);
      } else {
        Alert.alert('Error', res.message || 'Failed to save');
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSelect = (
    label: string,
    value: string,
    options: string[],
    onChange: (v: string) => void
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[
              styles.selectChip,
              { backgroundColor: value === opt ? colors.primary : colors.bg, borderColor: colors.border },
            ]}
            onPress={() => onChange(opt)}
          >
            <Text style={[styles.selectChipText, { color: value === opt ? '#fff' : colors.text }]}>
              {opt === '' ? 'Select' : opt.charAt(0).toUpperCase() + opt.slice(1).replace(/-/g, ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Basic */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Info</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Name *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Property name"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Short Description</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={form.shortDescription}
              onChangeText={(v) => setForm((f) => ({ ...f, shortDescription: v }))}
              placeholder="Brief summary"
              placeholderTextColor={colors.textMuted}
              multiline
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder="Full description"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
            />
          </View>
          {renderSelect('Type', form.propertyType, PROPERTY_TYPES, (v) => setForm((f) => ({ ...f, propertyType: v })))}
          {renderSelect('Category', form.category, CATEGORIES, (v) => setForm((f) => ({ ...f, category: v })))}
          {renderSelect('Status', form.status, STATUSES, (v) => setForm((f) => ({ ...f, status: v })))}
        </View>

        {/* Location */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Address *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={form.address}
              onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
              placeholder="Full street address"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Area *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.area}
                onChangeText={(v) => setForm((f) => ({ ...f, area: v }))}
                placeholder="e.g. Business Bay"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>City</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.city}
                onChangeText={(v) => setForm((f) => ({ ...f, city: v }))}
                placeholder="Dubai"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Emirate</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.emirate}
                onChangeText={(v) => setForm((f) => ({ ...f, emirate: v }))}
                placeholder="Dubai"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Zip Code</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.zipCode}
                onChangeText={(v) => setForm((f) => ({ ...f, zipCode: v }))}
                placeholder="Optional"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Latitude</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.lat}
                onChangeText={(v) => setForm((f) => ({ ...f, lat: v }))}
                placeholder="25.2048"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Longitude</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.lng}
                onChangeText={(v) => setForm((f) => ({ ...f, lng: v }))}
                placeholder="55.2708"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Landmarks</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={landmarkInput}
                onChangeText={setLandmarkInput}
                placeholder="Add landmark"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity style={[styles.addChipBtn, { backgroundColor: colors.primary }]} onPress={addLandmark}>
                <Icon name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            {form.landmarks.length > 0 && (
              <View style={styles.chipWrap}>
                {form.landmarks.map((lm, i) => (
                  <View key={i} style={[styles.chip, { backgroundColor: colors.primary + '25', borderColor: colors.primary }]}>
                    <Text style={[styles.chipText, { color: colors.primary }]}>{lm}</Text>
                    <TouchableOpacity onPress={() => removeLandmark(i)}>
                      <Icon name="close" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Price */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Price</Text>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Amount *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.amount}
                onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            {renderSelect('Currency', form.currency, CURRENCIES, (v) => setForm((f) => ({ ...f, currency: v })))}
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Price per Sqft</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.pricePerSqft}
                onChangeText={(v) => setForm((f) => ({ ...f, pricePerSqft: v }))}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Original Price</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.originalPrice}
                onChangeText={(v) => setForm((f) => ({ ...f, originalPrice: v }))}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Discount (%)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.discount}
                onChangeText={(v) => setForm((f) => ({ ...f, discount: v }))}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Payment Plan</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.paymentPlan}
                onChangeText={(v) => setForm((f) => ({ ...f, paymentPlan: v }))}
                placeholder="e.g. 70/30"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Down Payment</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.downPayment}
                onChangeText={(v) => setForm((f) => ({ ...f, downPayment: v }))}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Monthly Payment</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.monthlyPayment}
                onChangeText={(v) => setForm((f) => ({ ...f, monthlyPayment: v }))}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
          <View style={styles.row}>
            {['bedrooms', 'bathrooms', 'parking'].map((key) => (
              <View key={key} style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                  value={form[key as keyof typeof form] as string}
                  onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
          <View style={styles.row}>
            {['builtUp', 'plot', 'balcony'].map((key) => (
              <View key={key} style={[styles.field, { flex: 1 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>{key === 'builtUp' ? 'Built (sqft)' : key === 'plot' ? 'Plot (sqft)' : 'Balcony (sqft)'}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                  value={form[key as keyof typeof form] as string}
                  onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            ))}
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Year Built</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.yearBuilt}
                onChangeText={(v) => setForm((f) => ({ ...f, yearBuilt: v }))}
                placeholder="2024"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Floor No.</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.floorNumber}
                onChangeText={(v) => setForm((f) => ({ ...f, floorNumber: v }))}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Total Floors</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.totalFloors}
                onChangeText={(v) => setForm((f) => ({ ...f, totalFloors: v }))}
                placeholder="1"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>
          {renderSelect('Furnishing', form.furnishing || '', FURNISHING, (v) => setForm((f) => ({ ...f, furnishing: v })))}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Facing</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={form.facing}
              onChangeText={(v) => setForm((f) => ({ ...f, facing: v }))}
              placeholder="e.g. Sea View, City View"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Features & Amenities */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Features & Amenities</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Features</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={featureInput}
                onChangeText={setFeatureInput}
                placeholder="Add feature"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity style={[styles.addChipBtn, { backgroundColor: colors.primary }]} onPress={addFeature}>
                <Icon name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            {form.features.length > 0 && (
              <View style={styles.chipWrap}>
                {form.features.map((x, i) => (
                  <View key={i} style={[styles.chip, { backgroundColor: colors.primary + '25', borderColor: colors.primary }]}>
                    <Text style={[styles.chipText, { color: colors.primary }]}>{x}</Text>
                    <TouchableOpacity onPress={() => removeFeature(i)}>
                      <Icon name="close" size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Amenities</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={amenityInput}
                onChangeText={setAmenityInput}
                placeholder="Add amenity"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity style={[styles.addChipBtn, { backgroundColor: colors.primary }]} onPress={addAmenity}>
                <Icon name="plus" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            {form.amenities.length > 0 && (
              <View style={styles.chipWrap}>
                {form.amenities.map((x, i) => (
                  <View key={i} style={[styles.chip, { backgroundColor: colors.info + '25', borderColor: colors.info }]}>
                    <Text style={[styles.chipText, { color: colors.info }]}>{x}</Text>
                    <TouchableOpacity onPress={() => removeAmenity(i)}>
                      <Icon name="close" size={16} color={colors.info} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Media */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Media</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Images *</Text>
            <TouchableOpacity style={[styles.addImageBtn, { backgroundColor: colors.primary + '25', borderColor: colors.primary }]} onPress={pickImages}>
              <Icon name="image-plus" size={32} color={colors.primary} />
              <Text style={[styles.addImageText, { color: colors.primary }]}>Add images</Text>
            </TouchableOpacity>
            {imageUris.length > 0 && (
              <ScrollView horizontal style={styles.imageList} showsHorizontalScrollIndicator={false}>
                {imageUris.map((uri, i) => (
                  <View key={i} style={styles.imageWrap}>
                    <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                    <TouchableOpacity style={[styles.removeImage, { backgroundColor: colors.error }]} onPress={() => removeImage(i)}>
                      <Icon name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Videos</Text>
            <TouchableOpacity style={[styles.addImageBtn, { backgroundColor: colors.bg, borderColor: colors.border }]} onPress={pickVideos}>
              <Icon name="video" size={32} color={colors.text} />
              <Text style={[styles.addImageText, { color: colors.text }]}>Add videos</Text>
            </TouchableOpacity>
            {(videoUris.length > 0 || existingVideoPaths.length > 0) && (
              <ScrollView horizontal style={styles.imageList} showsHorizontalScrollIndicator={false}>
                {videoUris.map((uri, i) => (
                  <View key={`v-${i}`} style={styles.imageWrap}>
                    <View style={[styles.thumb, { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }]}>
                      <Icon name="video" size={32} color={colors.primary} />
                    </View>
                    <TouchableOpacity style={[styles.removeImage, { backgroundColor: colors.error }]} onPress={() => removeVideo(i)}>
                      <Icon name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Floor Plan</Text>
            <TouchableOpacity style={[styles.addImageBtn, { backgroundColor: colors.bg, borderColor: colors.border }]} onPress={pickFloorPlan}>
              <Icon name="file-document-outline" size={32} color={colors.text} />
              <Text style={[styles.addImageText, { color: colors.text }]}>{floorPlanUri || existingFloorPlanPath ? 'Floor plan added' : 'Add floor plan (image)'}</Text>
            </TouchableOpacity>
            {(floorPlanUri || existingFloorPlanPath) && (
              <View style={[styles.thumb, { backgroundColor: colors.bg, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center', marginTop: 8 }]}>
                <Icon name="file-document" size={40} color={colors.primary} />
                <TouchableOpacity
                  style={[styles.removeImage, { backgroundColor: colors.error }]}
                  onPress={() => { setFloorPlanUri(null); setExistingFloorPlanPath(''); }}
                >
                  <Icon name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Virtual Tour URL</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={form.virtualTour}
              onChangeText={(v) => setForm((f) => ({ ...f, virtualTour: v }))}
              placeholder="https://..."
              placeholderTextColor={colors.textMuted}
              keyboardType="url"
            />
          </View>
        </View>

        {/* Detail Page: Prime Location & Investment Highlights */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Detail Page Data</Text>
          <Text style={[styles.label, { color: colors.textMuted, marginBottom: 12 }]}>Prime Location & Investment Highlights</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Prime Location</Text>
            {form.locationInfo.map((item, idx) => (
              <View key={idx} style={[styles.locationInfoCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <TextInput placeholder="Title" placeholderTextColor={colors.textMuted} value={item.title} onChangeText={(v) => updateLocationInfo(idx, 'title', v)} style={[styles.input, styles.inputSmall, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]} />
                <TextInput placeholder="Value" placeholderTextColor={colors.textMuted} value={item.value} onChangeText={(v) => updateLocationInfo(idx, 'value', v)} style={[styles.input, styles.inputSmall, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]} />
                <TextInput placeholder="Description" placeholderTextColor={colors.textMuted} value={item.description} onChangeText={(v) => updateLocationInfo(idx, 'description', v)} style={[styles.input, styles.inputSmall, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]} />
                <TouchableOpacity onPress={() => removeLocationInfo(idx)} style={[styles.removeBtn, { backgroundColor: colors.error }]}>
                  <Icon name="delete" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addLocationInfo} style={[styles.addSmallBtn, { borderColor: colors.primary }]}>
              <Icon name="plus" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '600', marginLeft: 6 }}>Add Prime Location</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Investment Highlights</Text>
            {form.investmentHighlights.map((item, idx) => (
              <View key={idx} style={[styles.locationInfoCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                <TextInput placeholder="Title" placeholderTextColor={colors.textMuted} value={item.title} onChangeText={(v) => updateInvestmentHighlight(idx, 'title', v)} style={[styles.input, styles.inputSmall, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]} />
                <TextInput placeholder="Value" placeholderTextColor={colors.textMuted} value={item.value} onChangeText={(v) => updateInvestmentHighlight(idx, 'value', v)} style={[styles.input, styles.inputSmall, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]} />
                <TextInput placeholder="Description" placeholderTextColor={colors.textMuted} value={item.description} onChangeText={(v) => updateInvestmentHighlight(idx, 'description', v)} style={[styles.input, styles.inputSmall, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]} />
                <TouchableOpacity onPress={() => removeInvestmentHighlight(idx)} style={[styles.removeBtn, { backgroundColor: colors.error }]}>
                  <Icon name="delete" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity onPress={addInvestmentHighlight} style={[styles.addSmallBtn, { borderColor: colors.primary }]}>
              <Icon name="plus" size={18} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: '600', marginLeft: 6 }}>Add Investment Highlight</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Information */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Additional Information</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Developer</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={form.developer}
              onChangeText={(v) => setForm((f) => ({ ...f, developer: v }))}
              placeholder="Developer name"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Handover Date</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.handoverDate}
                onChangeText={(v) => setForm((f) => ({ ...f, handoverDate: v }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              {renderSelect('Ownership', form.ownershipType || '', ['', ...OWNERSHIP], (v) => setForm((f) => ({ ...f, ownershipType: v })))}
            </View>
          </View>
          <TouchableOpacity style={styles.checkRow} onPress={() => setForm((f) => ({ ...f, titleDeed: !f.titleDeed }))}>
            <Icon name={form.titleDeed ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={form.titleDeed ? colors.primary : colors.textMuted} />
            <Text style={[styles.checkLabel, { color: colors.text }]}>Title Deed Available</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkRow} onPress={() => setForm((f) => ({ ...f, mortgageAvailable: !f.mortgageAvailable }))}>
            <Icon name={form.mortgageAvailable ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={form.mortgageAvailable ? colors.primary : colors.textMuted} />
            <Text style={[styles.checkLabel, { color: colors.text }]}>Mortgage Available</Text>
          </TouchableOpacity>
        </View>

        {/* SEO & Marketing */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>SEO & Marketing</Text>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Meta Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={form.metaTitle}
              onChangeText={(v) => setForm((f) => ({ ...f, metaTitle: v }))}
              placeholder="SEO title (max 60 chars)"
              placeholderTextColor={colors.textMuted}
              maxLength={60}
            />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Meta Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={form.metaDescription}
              onChangeText={(v) => setForm((f) => ({ ...f, metaDescription: v }))}
              placeholder="SEO description (max 160 chars)"
              placeholderTextColor={colors.textMuted}
              maxLength={160}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.checkRow} onPress={() => setForm((f) => ({ ...f, featured: !f.featured }))}>
            <Icon name={form.featured ? 'star' : 'star-outline'} size={24} color={form.featured ? colors.warning : colors.textMuted} />
            <Text style={[styles.checkLabel, { color: colors.text }]}>Featured</Text>
          </TouchableOpacity>
          {form.featured && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Featured Until</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form.featuredUntil}
                onChangeText={(v) => setForm((f) => ({ ...f, featuredUntil: v }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          )}
          <TouchableOpacity style={styles.checkRow} onPress={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}>
            <Icon name={form.isPublished ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={form.isPublished ? colors.primary : colors.textMuted} />
            <Text style={[styles.checkLabel, { color: colors.text }]}>Publish property</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="content-save" size={22} color="#fff" />
              <Text style={styles.submitText}>{isEdit ? 'Update Property' : 'Create Property'}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  selectRow: { marginBottom: 8 },
  selectChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  selectChipText: { fontSize: 14, fontWeight: '600' },
  addChipBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginRight: 8, marginBottom: 4 },
  chipText: { fontSize: 13, fontWeight: '600', marginRight: 6 },
  locationInfoCard: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  inputSmall: { marginBottom: 8 },
  removeBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  addSmallBtn: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', marginTop: 4 },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 12,
  },
  addImageText: { fontSize: 15, fontWeight: '600' },
  imageList: { marginTop: 12, marginBottom: 8 },
  imageWrap: { marginRight: 12, position: 'relative' },
  thumb: { width: 80, height: 80, borderRadius: 12 },
  removeImage: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  checkLabel: { fontSize: 15, fontWeight: '600' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginTop: 8,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
