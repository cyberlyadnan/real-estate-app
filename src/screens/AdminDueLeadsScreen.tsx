/**
 * Admin Due Leads - Dedicated screen for overdue & due-today leads with full filtering
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
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

const SORT_OPTIONS = [
  { value: 'due_asc', label: 'Due date (earliest)' },
  { value: 'due_desc', label: 'Due date (latest)' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'status_asc', label: 'Status' },
  { value: 'created_desc', label: 'Newest first' },
  { value: 'created_asc', label: 'Oldest first' },
];

const DUE_TYPE_OPTIONS = [
  { value: 'all', label: 'All due' },
  { value: 'overdue', label: 'Overdue only' },
  { value: 'today', label: 'Due today' },
];

const PAGE_SIZE = 20;

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' });
}

function isDueToday(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
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

type DueLeadItem = AdminApi.LeadItem & { _dueType: 'overdue' | 'upcoming' };

export default function AdminDueLeadsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [overdueLeads, setOverdueLeads] = useState<AdminApi.LeadItem[]>([]);
  const [upcomingLeads, setUpcomingLeads] = useState<AdminApi.LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dueTypeFilter, setDueTypeFilter] = useState<'all' | 'overdue' | 'today'>('all');
  const [sortBy, setSortBy] = useState('due_asc');
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await AdminApi.getLeadAlerts();
      if (res.success && res.data) {
        setOverdueLeads(res.data.overdueLeads || []);
        setUpcomingLeads(res.data.upcomingLeads || []);
      } else {
        setOverdueLeads([]);
        setUpcomingLeads([]);
      }
    } catch {
      setOverdueLeads([]);
      setUpcomingLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  const combined: DueLeadItem[] = useMemo(() => {
    const over = (overdueLeads || []).map((l) => ({ ...l, _dueType: 'overdue' as const }));
    const up = (upcomingLeads || []).map((l) => ({ ...l, _dueType: 'upcoming' as const }));
    return [...over, ...up];
  }, [overdueLeads, upcomingLeads]);

  const filteredAndSorted = useMemo(() => {
    let list = [...combined];

    const q = (search || '').toLowerCase().trim();
    if (q) {
      list = list.filter(
        (l) =>
          (l.name || '').toLowerCase().includes(q) ||
          (l.email || '').toLowerCase().includes(q) ||
          (l.propertyName || '').toLowerCase().includes(q) ||
          (l.phone || '').includes(q)
      );
    }
    if (filterStatus) {
      list = list.filter((l) => l.status === filterStatus);
    }
    if (dueTypeFilter === 'overdue') {
      list = list.filter((l) => l._dueType === 'overdue');
    } else if (dueTypeFilter === 'today') {
      list = list.filter((l) => (l.nextFollowUpAt ? isDueToday(l.nextFollowUpAt) : false));
    }

    const sortField = sortBy;
    list.sort((a, b) => {
      if (sortField === 'due_asc') {
        const da = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : 0;
        const db = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : 0;
        return da - db;
      }
      if (sortField === 'due_desc') {
        const da = a.nextFollowUpAt ? new Date(a.nextFollowUpAt).getTime() : 0;
        const db = b.nextFollowUpAt ? new Date(b.nextFollowUpAt).getTime() : 0;
        return db - da;
      }
      if (sortField === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (sortField === 'name_desc') return (b.name || '').localeCompare(a.name || '');
      if (sortField === 'status_asc') return (a.status || '').localeCompare(b.status || '');
      if (sortField === 'created_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortField === 'created_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });
    return list;
  }, [combined, search, filterStatus, dueTypeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginatedList = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredAndSorted.slice(start, start + PAGE_SIZE);
  }, [filteredAndSorted, page]);

  const handleSearch = () => setSearch(searchInput.trim());

  const activeFilterCount = (filterStatus ? 1 : 0) + (dueTypeFilter !== 'all' ? 1 : 0);

  const renderLeadItem = ({ item }: { item: DueLeadItem }) => {
    const sc = getStatusColor(item.status, colors);
    const isOverdue = item._dueType === 'overdue';
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: isOverdue ? colors.error + '60' : colors.border }]}
        onPress={() => navigation.navigate('LeadDetail', { leadId: item._id })}
        activeOpacity={0.7}
      >
        <View style={[styles.cardLeftBar, { backgroundColor: isOverdue ? colors.error : colors.warning }]} />
        <View style={styles.cardInner}>
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
          <View style={[styles.followUpRow, isOverdue && { backgroundColor: colors.error + '15' }]}>
            <Icon name={isOverdue ? 'alert-circle' : 'calendar-clock'} size={16} color={isOverdue ? colors.error : colors.warning} />
            <Text style={[styles.followUpText, { color: isOverdue ? colors.error : colors.textSecondary }]}>
              {isOverdue ? 'Overdue: ' : 'Due: '}{formatDate(item.nextFollowUpAt)}
            </Text>
          </View>
          <Text style={[styles.dateLabel, { color: colors.textMuted }]}>Added {formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Single toolbar row: title + All leads link (no back – use drawer header) */}
      <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.toolbarTitle, { color: colors.textSecondary }]}>Overdue & due today</Text>
        <TouchableOpacity
          style={[styles.allLeadsLink, { borderColor: colors.border }]}
          onPress={() => navigation.navigate('LeadList')}
        >
          <Icon name="format-list-bulleted" size={18} color={colors.primary} />
          <Text style={[styles.allLeadsLinkText, { color: colors.primary }]}>All leads</Text>
        </TouchableOpacity>
      </View>

      {/* Search + filter toggle */}
      <View style={[styles.filterBar, { backgroundColor: colors.bg, borderBottomColor: colors.border }]}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Icon name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search name, email, property..."
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
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter panel */}
      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Due type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {DUE_TYPE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    { backgroundColor: dueTypeFilter === opt.value ? colors.primary + '25' : colors.bg, borderColor: colors.border },
                  ]}
                  onPress={() => { setDueTypeFilter(opt.value as any); setPage(1); }}
                >
                  <Text style={[styles.chipText, { color: dueTypeFilter === opt.value ? colors.primary : colors.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
                  onPress={() => { setFilterStatus(opt.value); setPage(1); }}
                >
                  <Text style={[styles.chipText, { color: filterStatus === opt.value ? colors.primary : colors.text }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>Sort</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    { backgroundColor: sortBy === opt.value ? colors.primary + '25' : colors.bg, borderColor: colors.border },
                  ]}
                  onPress={() => { setSortBy(opt.value); setPage(1); }}
                >
                  <Text style={[styles.chipText, { color: sortBy === opt.value ? colors.primary : colors.text }]} numberOfLines={1}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Results summary */}
      <View style={[styles.summaryBar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
          {filteredAndSorted.length} lead{filteredAndSorted.length !== 1 ? 's' : ''}
          {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading due leads...</Text>
        </View>
      ) : paginatedList.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="calendar-check" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No due leads</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            {combined.length === 0
              ? 'No overdue or due-today follow-ups at the moment.'
              : 'No leads match your filters. Try changing filters or search.'}
          </Text>
          <TouchableOpacity
            style={[styles.emptyBtn, { backgroundColor: colors.primary + '25', borderColor: colors.primary }]}
            onPress={() => navigation.navigate('LeadList')}
          >
            <Text style={[styles.emptyBtnText, { color: colors.primary }]}>View all leads</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={paginatedList}
          keyExtractor={(item) => item._id}
          renderItem={renderLeadItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={[styles.pagination, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  style={[styles.pageBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <Icon name="chevron-left" size={22} color={page <= 1 ? colors.textMuted : colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.pageInfo, { color: colors.textSecondary }]}>
                  {page} / {totalPages}
                </Text>
                <TouchableOpacity
                  style={[styles.pageBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <Icon name="chevron-right" size={22} color={page >= totalPages ? colors.textMuted : colors.primary} />
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
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  toolbarTitle: { fontSize: 14, fontWeight: '600' },
  allLeadsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  allLeadsLinkText: { fontSize: 13, fontWeight: '600' },
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
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
  summaryBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  summaryText: { fontSize: 13, fontWeight: '500' },
  listContent: { padding: 12, paddingBottom: 24 },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardLeftBar: { width: 4 },
  cardInner: { flex: 1, padding: 14 },
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
  emptyBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1 },
  emptyBtnText: { fontSize: 14, fontWeight: '700' },
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
