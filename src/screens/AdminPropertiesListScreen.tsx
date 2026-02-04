/**
 * Admin Properties List - CRUD list with search, filters, add/edit/delete
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as AdminApi from '../api/admin';
import { API_BASE } from '../api/config';

export default function AdminPropertiesListScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await AdminApi.getProperties({
        limit: 100,
        ...(filterType && { propertyType: filterType }),
        ...(filterStatus && { status: filterStatus }),
        ...(search.trim() && { search: search.trim() }),
      });
      if (res.success && res.data) setProperties(res.data);
      else setProperties([]);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType, filterStatus, search]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Property',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await AdminApi.deleteProperty(item._id);
              if (res.success) {
                setProperties((p) => p.filter((x) => x._id !== item._id));
              } else {
                Alert.alert('Error', res.message || 'Failed to delete');
              }
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.success;
      case 'sold': return colors.error;
      case 'rented': return colors.warning;
      case 'pending': return colors.info;
      default: return colors.textMuted;
    }
  };

  const getImageUri = (p: any) => {
    const img = p.images?.[0];
    if (!img) return null;
    return img.startsWith('http') ? img : `${API_BASE}${img}`;
  };

  const FILTER_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'commercial', label: 'Commercial' },
  ];
  const FILTER_STATUS = [
    { value: '', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
    { value: 'rented', label: 'Rented' },
    { value: 'pending', label: 'Pending' },
  ];

  const renderItem = ({ item }: { item: any }) => {
    const imgUri = getImageUri(item);
    const loc = item.location;
    const area = loc?.area || loc?.city || '—';
    const price = item.price?.amount
      ? `${item.price.currency || 'AED'} ${Number(item.price.amount).toLocaleString()}`
      : '—';

    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardImageWrap}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={[styles.cardImagePlaceholder, { backgroundColor: colors.bg }]}>
              <Icon name="home-city" size={40} color={colors.textMuted} />
            </View>
          )}
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status || '') + 'E6' }]}>
            <Text style={styles.badgeText}>{item.status || 'draft'}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.name || 'Untitled'}</Text>
          <View style={styles.cardMeta}>
            <Icon name="map-marker" size={14} color={colors.textSecondary} />
            <Text style={[styles.cardMetaText, { color: colors.textSecondary }]}>{area}</Text>
          </View>
          <Text style={[styles.cardPrice, { color: colors.primary }]}>{price}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary + '20' }]}
              onPress={() => navigation.navigate('PropertyEdit', { propertyId: item._id })}
            >
              <Icon name="pencil" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.error + '20' }]}
              onPress={() => handleDelete(item)}
            >
              <Icon name="delete" size={20} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Search & Filter */}
      <View style={[styles.toolbar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.searchWrap, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Icon name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: (filterType || filterStatus) ? colors.primary + '30' : colors.bg, borderColor: colors.border }]}
          onPress={() => setShowFilters(true)}
        >
          <Icon name="filter-variant" size={22} color={(filterType || filterStatus) ? colors.primary : colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Add button */}
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('PropertyAdd')}
      >
        <Icon name="plus" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Add Property</Text>
      </TouchableOpacity>

      {properties.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Icon name="home-city-outline" size={48} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Properties</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Add your first property</Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('PropertyAdd')}
          >
            <Text style={styles.emptyBtnText}>Add Property</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilters} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilters(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filters</Text>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Type</Text>
            <View style={styles.filterRow}>
              {FILTER_TYPES.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.filterChip,
                    { backgroundColor: filterType === f.value ? colors.primary : colors.bg, borderColor: colors.border },
                  ]}
                  onPress={() => { setFilterType(f.value); setShowFilters(false); }}
                >
                  <Text style={[styles.filterChipText, { color: filterType === f.value ? '#fff' : colors.text }]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Status</Text>
            <View style={styles.filterRow}>
              {FILTER_STATUS.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.filterChip,
                    { backgroundColor: filterStatus === f.value ? colors.primary : colors.bg, borderColor: colors.border },
                  ]}
                  onPress={() => { setFilterStatus(f.value); setShowFilters(false); }}
                >
                  <Text style={[styles.filterChipText, { color: filterStatus === f.value ? '#fff' : colors.text }]}>{f.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }, android: { elevation: 4 } }),
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 }, android: { elevation: 2 } }),
  },
  cardImageWrap: { height: 140, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cardBody: { padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  cardMetaText: { fontSize: 13 },
  cardPrice: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  cardActions: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 8 },
  emptyBtn: { marginTop: 20, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  filterLabel: { fontSize: 13, marginBottom: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  filterChipText: { fontSize: 14, fontWeight: '600' },
});
