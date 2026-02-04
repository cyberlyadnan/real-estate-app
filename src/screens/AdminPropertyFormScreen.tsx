/**
 * Admin Property Form - Add / Edit (CRUD)
 * Streamlined mobile form matching frontend fields
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

export default function AdminPropertyFormScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const propertyId = route.params?.propertyId as string | undefined;
  const isEdit = !!propertyId;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [existingImagePaths, setExistingImagePaths] = useState<string[]>([]);
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
    amount: '',
    currency: 'AED',
    bedrooms: '',
    bathrooms: '',
    parking: '',
    builtUp: '',
    plot: '',
    balcony: '',
    developer: '',
    virtualTour: '',
    isPublished: false,
    featured: false,
  });

  useEffect(() => {
    if (propertyId) {
      AdminApi.getProperty(propertyId).then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          setForm({
            name: p.name || '',
            description: p.description || '',
            shortDescription: p.shortDescription || '',
            propertyType: p.propertyType || 'apartment',
            category: p.category || 'sale',
            status: p.status || 'available',
            address: p.location?.address || '',
            area: p.location?.area || '',
            city: p.location?.city || 'Dubai',
            emirate: p.location?.emirate || 'Dubai',
            amount: p.price?.amount?.toString() || '',
            currency: p.price?.currency || 'AED',
            bedrooms: p.details?.bedrooms?.toString() || '',
            bathrooms: p.details?.bathrooms?.toString() || '',
            parking: p.details?.parking?.toString() || '',
            builtUp: p.details?.area?.builtUp?.toString() || '',
            plot: p.details?.area?.plot?.toString() || '',
            balcony: p.details?.area?.balcony?.toString() || '',
            developer: p.developer || '',
            virtualTour: p.virtualTour || '',
            isPublished: p.isPublished || false,
            featured: p.featured || false,
          });
          if (p.images?.length) {
            const paths = p.images.map((img: string) => (img.startsWith('http') ? img.replace(/^[^/]*\/\/[^/]+/, '') : img));
            setExistingImagePaths(paths);
            setImageUris(p.images.map((img: string) => (img.startsWith('http') ? img : `${API_BASE}${img}`)));
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

  const removeImage = (index: number) => {
    if (index < existingImagePaths.length) {
      setExistingImagePaths((prev) => prev.filter((_, i) => i !== index));
    }
    setImageUris((prev) => prev.filter((_, i) => i !== index));
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
      country: 'United Arab Emirates',
      zipCode: '',
      coordinates: { lat: '', lng: '' },
      landmarks: [],
    }));
    fd.append('price', JSON.stringify({
      amount: Number(form.amount) || 0,
      currency: form.currency,
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
    }));
    fd.append('features', JSON.stringify([]));
    fd.append('amenities', JSON.stringify([]));
    if (form.developer) fd.append('developer', form.developer);
    if (form.virtualTour) fd.append('virtualTour', form.virtualTour);
    fd.append('isActive', 'true');
    fd.append('isPublished', String(form.isPublished));
    fd.append('featured', String(form.featured));

    if (isEdit && existingImagePaths.length > 0) {
      fd.append('existingImages', JSON.stringify(existingImagePaths));
    }

    imageUris.filter((u) => !u.startsWith('http')).forEach((uri, i) => {
      fd.append('images', {
        uri,
        type: 'image/jpeg',
        name: `image_${i}.jpg`,
      } as any);
    });

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
    if (!isEdit && imageUris.length === 0) {
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
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
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
          {['address', 'area', 'city', 'emirate'].map((key) => (
            <View key={key} style={styles.field}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{key.charAt(0).toUpperCase() + key.slice(1)} *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={form[key as keyof typeof form] as string}
                onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                placeholder={key}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          ))}
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
        </View>

        {/* Media */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Images {!isEdit && '*'}</Text>
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

        {/* Options */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Options</Text>
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
          <TouchableOpacity style={styles.checkRow} onPress={() => setForm((f) => ({ ...f, isPublished: !f.isPublished }))}>
            <Icon name={form.isPublished ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={form.isPublished ? colors.primary : colors.textMuted} />
            <Text style={[styles.checkLabel, { color: colors.text }]}>Publish property</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.checkRow} onPress={() => setForm((f) => ({ ...f, featured: !f.featured }))}>
            <Icon name={form.featured ? 'star' : 'star-outline'} size={24} color={form.featured ? colors.warning : colors.textMuted} />
            <Text style={[styles.checkLabel, { color: colors.text }]}>Featured</Text>
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
