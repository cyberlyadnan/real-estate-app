/**
 * Admin Leads List - Search, filter, full-screen list. Stats/alerts live in Lead Overview.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as AdminApi from '../api/admin';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'nurturing', label: 'Nurturing' },
];

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' });
}

function getStatusColor(status: string, colors: Record<string, string>) {
  const map: Record<string, { bg: string; text: string }> = {
    new: { bg: colors.info + '25', text: colors.info },
    contacted: { bg: colors.primary + '25', text: colors.primary },
    qualified: { bg: colors.info + '25', text: colors.info },
    proposal: { bg: colors.warning + '25', text: colors.warning },
    negotiation: { bg: colors.warning + '25', text: colors.warning },
    won: { bg: colors.success + '25', text: colors.success },
    lost: { bg: colors.error + '25', text: colors.error },
    nurturing: { bg: colors.textMuted + '40', text: colors.textMuted },
  };
  return map[status] || { bg: colors.bg, text: colors.text };
}

function getPriorityColor(priority: string, colors: Record<string, string>) {
  const map: Record<string, string> = {
    low: colors.textMuted,
    medium: colors.textSecondary,
    high: colors.warning,
    urgent: colors.error,
  };
  return map[priority] || colors.textSecondary;
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

export default function AdminLeadsListScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [leads, setLeads] = useState<AdminApi.LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await AdminApi.getLeads({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        status: filterStatus || undefined,
        overdue: overdueOnly || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      if (res.success && res.data) {
        setLeads(res.data);
        if (res.pagination) {
          setPagination((p) => ({ ...p, ...res.pagination! }));
        }
      }
    } catch {
      Alert.alert('Error', 'Failed to load leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, pagination.limit, search, filterStatus, overdueOnly]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeads();
  };

  const handleSearch = () => setSearch(searchInput.trim());

  const isOverdue = (d: string | null | undefined) => d && new Date(d) < new Date();

  const renderLeadItem = ({ item }: { item: AdminApi.LeadItem }) => {
    const sc = getStatusColor(item.status, colors);
    const overdue = isOverdue(item.nextFollowUpAt);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate('LeadDetail', { leadId: item._id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderMain}>
            <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.cardEmail, { color: colors.textMuted }]} numberOfLines={1}>{item.email}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardMeta}>
          <Text style={[styles.sourceLabel, { color: colors.textSecondary }]}>{getSourceLabel(item.source)}</Text>
          <Text style={[styles.priorityLabel, { color: getPriorityColor(item.priority || 'medium', colors) }]}>
            {item.priority || 'medium'}
          </Text>
        </View>
        {item.propertyName ? (
          <View style={styles.propertyRow}>
            <Icon name="home-city-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.propertyText, { color: colors.textSecondary }]} numberOfLines={1}>{item.propertyName}</Text>
          </View>
        ) : null}
        {item.nextFollowUpAt ? (
          <View style={[styles.followUpRow, overdue && { backgroundColor: colors.error + '15' }]}>
            <Icon name={overdue ? 'alert-circle' : 'calendar-clock'} size={16} color={overdue ? colors.error : colors.textMuted} />
            <Text style={[styles.followUpText, { color: overdue ? colors.error : colors.textSecondary }]}>
              {overdue ? 'Overdue: ' : 'Due: '}{formatDate(item.nextFollowUpAt)}
            </Text>
          </View>
        ) : null}
        <Text style={[styles.dateLabel, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
      </TouchableOpacity>
    );
  };

  const activeFilterCount = (filterStatus ? 1 : 0) + (overdueOnly ? 1 : 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Compact header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>All Leads</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('LeadForm')}
        >
          <Icon name="account-plus" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Compact search + filter */}
      <View style={[styles.filterBar, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Icon name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search..."
            placeholderTextColor={colors.textMuted}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.searchGo, { color: colors.primary }]}>Go</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.filterToggle,
            { backgroundColor: showFilters ? colors.primary + '20' : colors.card, borderColor: colors.border },
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="filter-variant" size={18} color={showFilters ? colors.primary : colors.textMuted} />
          <Text style={[styles.filterToggleText, { color: showFilters ? colors.primary : colors.textMuted }]}>
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {STATUS_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    { backgroundColor: filterStatus === opt.value ? colors.primary + '25' : colors.bg, borderColor: colors.border },
                  ]}
                  onPress={() => setFilterStatus(opt.value)}
                >
                  <Text style={[styles.chipText, { color: filterStatus === opt.value ? colors.primary : colors.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={[styles.overdueRow, { backgroundColor: overdueOnly ? colors.error + '15' : colors.bg, borderColor: colors.border }]}
            onPress={() => setOverdueOnly(!overdueOnly)}
          >
            <Icon name="alert-circle" size={18} color={overdueOnly ? colors.error : colors.textMuted} />
            <Text style={[styles.overdueLabel, { color: overdueOnly ? colors.error : colors.text }]}>Overdue only</Text>
            {overdueOnly && <Icon name="check-circle" size={18} color={colors.error} />}
          </TouchableOpacity>
        </View>
      )}

      {/* Full-space list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading...</Text>
        </View>
      ) : leads.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="target" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Leads</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>Try adjusting filters or add a new lead</Text>
        </View>
      ) : (
        <FlatList
          data={leads}
          keyExtractor={(item) => item._id}
          renderItem={renderLeadItem}
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
                  <Icon name="chevron-left" size={22} color={pagination.page <= 1 ? colors.textMuted : colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
                  {pagination.page} / {pagination.pages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                  disabled={pagination.page >= pagination.pages}
                >
                  <Icon name="chevron-right" size={22} color={pagination.page >= pagination.pages ? colors.textMuted : colors.primary} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: 14 },
  searchGo: { fontSize: 14, fontWeight: '700' },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterToggleText: { fontSize: 13, fontWeight: '600' },
  filterPanel: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  filterRow: { gap: 8 },
  filterLabel: { fontSize: 11, fontWeight: '600' },
  chipScroll: { marginHorizontal: -12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  overdueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  overdueLabel: { fontSize: 14, fontWeight: '600' },
  listContent: { padding: 12, paddingBottom: 24 },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardHeaderMain: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardEmail: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  sourceLabel: { fontSize: 12 },
  priorityLabel: { fontSize: 12, fontWeight: '600' },
  propertyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  propertyText: { fontSize: 12 },
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  followUpText: { fontSize: 11 },
  dateLabel: { fontSize: 10, marginTop: 6 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 12 },
  emptySub: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 1,
  },
  pageBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pageInfo: { fontSize: 13, fontWeight: '600' },
});
