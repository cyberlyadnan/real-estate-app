/**
 * Admin Queries List - View, filter, search, bulk update
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as AdminApi from '../api/admin';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'contact_page', label: 'Contact Page' },
  { value: 'mobile_app', label: 'Mobile App' },
  { value: 'lead_form', label: 'Lead Form' },
  { value: 'property_detail', label: 'Property Detail' },
  { value: 'other', label: 'Other' },
];

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' });
}

function getStatusColor(status: string, colors: Record<string, string>) {
  switch (status) {
    case 'new': return { bg: colors.info + '25', text: colors.info };
    case 'in_progress': return { bg: colors.warning + '25', text: colors.warning };
    case 'resolved': return { bg: colors.success + '25', text: colors.success };
    case 'closed': return { bg: colors.textMuted + '40', text: colors.textMuted };
    default: return { bg: colors.bg, text: colors.text };
  }
}

function getSourceLabel(s: string) {
  switch (s) {
    case 'contact_page': return 'Contact';
    case 'mobile_app': return 'Mobile App';
    case 'lead_form': return 'Lead Form';
    case 'property_detail': return 'Property';
    default: return s || 'Other';
  }
}

export default function AdminQueriesListScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [queries, setQueries] = useState<AdminApi.QueryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchQueries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApi.getQueries({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        status: filterStatus || undefined,
        source: filterSource || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (res.success && res.data) {
        setQueries(res.data);
        if (res.pagination) {
          setPagination((p) => ({ ...p, ...res.pagination! }));
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to load queries');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, pagination.limit, search, filterStatus, filterSource]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQueries();
  };

  const handleSearch = () => setSearch(searchInput.trim());

  const toggleSelect = (id: string) => {
    setSelectedIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === queries.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(queries.map((q) => q._id)));
  };

  const handleBulkStatus = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    try {
      setBulkSaving(true);
      const res = await AdminApi.bulkUpdateQueryStatus(Array.from(selectedIds), bulkStatus);
      if (res.success) {
        setSelectedIds(new Set());
        setBulkStatus('');
        fetchQueries();
      } else {
        Alert.alert('Error', res.message || 'Failed to update');
      }
    } catch {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setBulkSaving(false);
    }
  };

  const renderFilterChips = (options: { value: string; label: string }[], value: string, onChange: (v: string) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.chip,
            { backgroundColor: value === opt.value ? colors.primary + '25' : colors.bg, borderColor: colors.border },
          ]}
          onPress={() => onChange(opt.value)}
        >
          <Text style={[styles.chipText, { color: value === opt.value ? colors.primary : colors.text }]}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderQueryItem = ({ item }: { item: AdminApi.QueryItem }) => {
    const sc = getStatusColor(item.status, colors);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('QueryDetail', { queryId: item._id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); toggleSelect(item._id); }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Icon
              name={selectedIds.has(item._id) ? 'checkbox-marked' : 'checkbox-blank-outline'}
              size={24}
              color={selectedIds.has(item._id) ? colors.primary : colors.textMuted}
            />
          </TouchableOpacity>
          <View style={styles.cardHeaderMain}>
            <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.cardEmail, { color: colors.textMuted }]} numberOfLines={1}>{item.email}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{item.status.replace('_', ' ')}</Text>
          </View>
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.sourceLabel, { color: colors.textSecondary }]}>{getSourceLabel(item.source)}</Text>
          <Text style={[styles.dateLabel, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.message ? (
          <Text style={[styles.cardMessage, { color: colors.textSecondary }]} numberOfLines={2}>{item.message}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Query Manager</Text>
        <Text style={[styles.headerSub, { color: colors.textMuted }]}>Track and manage contact submissions</Text>
      </View>
      {/* Search & Filters */}
      <View style={[styles.filtersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.searchRow}>
          <View style={[styles.searchWrap, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Icon name="magnify" size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search name, email, phone..."
              placeholderTextColor={colors.textMuted}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.primary }]} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, { borderTopColor: colors.border }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name={showFilters ? 'chevron-up' : 'filter-variant'} size={20} color={colors.primary} />
          <Text style={[styles.filterToggleText, { color: colors.primary }]}>Filters</Text>
        </TouchableOpacity>
        {showFilters && (
          <View style={[styles.filterSection, { borderTopColor: colors.border }]}>
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Status</Text>
            {renderFilterChips(STATUS_OPTIONS, filterStatus, setFilterStatus)}
            <Text style={[styles.filterLabel, { color: colors.textSecondary, marginTop: 12 }]}>Source</Text>
            {renderFilterChips(SOURCE_OPTIONS, filterSource, setFilterSource)}
          </View>
        )}
        {selectedIds.size > 0 && (
          <View style={[styles.bulkBar, { borderTopColor: colors.border }]}>
            <Text style={[styles.bulkLabel, { color: colors.text }]}>{selectedIds.size} selected</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bulkChips}>
              {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[styles.bulkChip, { backgroundColor: bulkStatus === o.value ? colors.primary : colors.bg, borderColor: colors.border }]}
                  onPress={() => setBulkStatus(bulkStatus === o.value ? '' : o.value)}
                >
                  <Text style={[styles.bulkChipText, { color: bulkStatus === o.value ? '#fff' : colors.text }]}>{o.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary }]}
              onPress={handleBulkStatus}
              disabled={!bulkStatus || bulkSaving}
            >
              {bulkSaving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.applyBtnText}>Apply</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setSelectedIds(new Set()); setBulkStatus(''); }}>
              <Text style={[styles.clearText, { color: colors.textMuted }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading queries...</Text>
        </View>
      ) : queries.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="email-outline" size={64} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Queries Found</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>Contact form submissions will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={queries}
          keyExtractor={(item) => item._id}
          renderItem={renderQueryItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          ListFooterComponent={
            pagination.pages > 1 ? (
              <View style={[styles.pagination, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.pageBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page <= 1}
                >
                  <Icon name="chevron-left" size={24} color={pagination.page <= 1 ? colors.textMuted : colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
                  {pagination.page} / {pagination.pages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                  disabled={pagination.page >= pagination.pages}
                >
                  <Icon name="chevron-right" size={24} color={pagination.page >= pagination.pages ? colors.textMuted : colors.primary} />
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSub: { fontSize: 14, marginTop: 4 },
  filtersCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 15 },
  searchBtn: { paddingHorizontal: 16, height: 44, justifyContent: 'center', borderRadius: 12 },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  filterToggleText: { fontSize: 14, fontWeight: '600' },
  filterSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  filterLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  chipRow: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  bulkBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
    flexWrap: 'wrap',
  },
  bulkLabel: { fontSize: 14, fontWeight: '600' },
  bulkChips: { flexDirection: 'row' },
  bulkChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  bulkChipText: { fontSize: 12, fontWeight: '600' },
  applyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  clearText: { fontSize: 13, fontWeight: '600' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardHeaderMain: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  cardEmail: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  sourceLabel: { fontSize: 12 },
  dateLabel: { fontSize: 12 },
  cardMessage: { fontSize: 13, marginTop: 8, lineHeight: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 20,
    marginTop: 8,
    borderTopWidth: 1,
  },
  pageBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pageInfo: { fontSize: 14, fontWeight: '600' },
});
