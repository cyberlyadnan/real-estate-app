/**
 * Properties Screen - Full listing, backend-integrated
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { fetchProperties } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import type { PropertyListItem } from '../api/properties';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40 - 16) / 2;

export default function PropertiesScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [properties, setProperties] = useState<PropertyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const { data } = await fetchProperties({ limit: 50 });
      setProperties(data);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const filtered = search.trim()
    ? properties.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.location.toLowerCase().includes(search.toLowerCase())
      )
    : properties;

  const renderItem = ({ item }: { item: PropertyListItem }) => (
    <View style={styles.cardWrap}>
      <PropertyCard
        property={item}
        compact
        onPress={() => navigation.navigate('PropertyDetail', { slug: item.slug })}
      />
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
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Icon name="magnify" size={22} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search properties..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.header}>
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          {filtered.length} {filtered.length === 1 ? 'property' : 'properties'}
        </Text>
      </View>

      {filtered.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.bg }]}>
          <Icon name="home-search-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No properties found</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            {search ? 'Try a different search' : 'Check back later for new listings'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  header: { paddingHorizontal: 20, marginBottom: 12 },
  count: { fontSize: 14, fontWeight: '500' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { gap: 16, marginBottom: 16 },
  cardWrap: { flex: 1, maxWidth: (width - 48) / 2 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { fontSize: 15, marginTop: 8 },
});
