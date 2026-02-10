/**
 * Admin Dashboard - Stats, quick actions, recent leads & properties
 * Professional, modern layout matching frontend admin
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as AdminApi from '../api/admin';

function StatCard({
  icon,
  label,
  value,
  colors,
  iconBg,
  iconColor,
}: {
  icon: string;
  label: string;
  value: string;
  colors: Record<string, string>;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.statRow}>
        <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>
          <Icon name={icon as any} size={24} color={iconColor} />
        </View>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function formatDueDate(s: string | null | undefined) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' });
}

/** Blinking accent bar for due-leads callout */
function BlinkingAccent({ colors }: { colors: Record<string, string> }) {
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);
  return (
    <Animated.View style={[styles.dueLeadsAccent, { backgroundColor: colors.error }, { opacity: pulse }]} />
  );
}

export default function AdminDashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<AdminApi.LeadStats | null>(null);
  const [dueLeadsAlerts, setDueLeadsAlerts] = useState<{
    overdueLeads: AdminApi.LeadItem[];
    upcomingLeads: AdminApi.LeadItem[];
  } | null>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [propertiesTotal, setPropertiesTotal] = useState(0);

  const load = useCallback(async () => {
    try {
      const [statsRes, alertsRes, leadsRes, propsRes] = await Promise.all([
        AdminApi.getLeadStats(),
        AdminApi.getLeadAlerts(),
        AdminApi.getLeads({ limit: 5 }),
        AdminApi.getProperties({ limit: 5 }),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (alertsRes.success && alertsRes.data) {
        setDueLeadsAlerts({
          overdueLeads: alertsRes.data.overdueLeads || [],
          upcomingLeads: alertsRes.data.upcomingLeads || [],
        });
      } else {
        setDueLeadsAlerts(null);
      }
      if (leadsRes.success && leadsRes.data) setRecentLeads(leadsRes.data);
      if (propsRes.success) {
        setRecentProperties(propsRes.data || []);
        const pag = propsRes.pagination as { total?: number } | undefined;
        setPropertiesTotal(pag?.total ?? propsRes.data?.length ?? 0);
      }
    } catch {
      setStats(null);
      setDueLeadsAlerts(null);
      setRecentLeads([]);
      setRecentProperties([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const leadTotal = stats?.total ?? 0;
  const overdue = stats?.overdueFollowUps ?? 0;
  const dueToday = stats?.dueToday ?? 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Welcome */}
      <View style={[styles.welcome, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{ width: '80%' }}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>
            Welcome back, <Text style={{ color: colors.primary }}>{user?.name?.split(' ')[0] || 'Admin'}</Text>
          </Text>
          <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>
            Here's what's happening with your business today.
          </Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Icon name="account" size={28} color="#fff" />
        </View>
      </View>

      {/* Due leads – instant action needed (highlighted + blinking) */}
      {dueLeadsAlerts && (dueLeadsAlerts.overdueLeads.length > 0 || dueLeadsAlerts.upcomingLeads.length > 0) && (
        <View style={[styles.dueLeadsCard, { backgroundColor: colors.error + '12', borderColor: colors.error }]}>
          <BlinkingAccent colors={colors} />
          <View style={styles.dueLeadsContent}>
            <View style={styles.dueLeadsHeader}>
              <Icon name="alert-circle" size={22} color={colors.error} />
              <Text style={[styles.dueLeadsTitle, { color: colors.error }]}>Action needed</Text>
              <View style={[styles.dueLeadsBadge, { backgroundColor: colors.error }]}>
                <Text style={styles.dueLeadsBadgeText}>
                  {dueLeadsAlerts.overdueLeads.length + dueLeadsAlerts.upcomingLeads.length} due
                </Text>
              </View>
            </View>
            <Text style={[styles.dueLeadsSub, { color: colors.textSecondary }]}>
              Follow up on these leads
            </Text>
            {dueLeadsAlerts.overdueLeads.slice(0, 4).map((l) => (
              <TouchableOpacity
                key={l._id}
                style={[styles.dueLeadRow, { borderColor: colors.border }]}
                onPress={() => navigation.navigate('Leads', { screen: 'LeadDetail', params: { leadId: l._id } })}
                activeOpacity={0.8}
              >
                <Icon name="alert-circle" size={18} color={colors.error} />
                <View style={styles.dueLeadInfo}>
                  <Text style={[styles.dueLeadName, { color: colors.text }]} numberOfLines={1}>{l.name}</Text>
                  <Text style={[styles.dueLeadMeta, { color: colors.error }]}>
                    Overdue · {formatDueDate(l.nextFollowUpAt)}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
            {dueLeadsAlerts.upcomingLeads.slice(0, 4).map((l) => (
              <TouchableOpacity
                key={l._id}
                style={[styles.dueLeadRow, { borderColor: colors.border }]}
                onPress={() => navigation.navigate('Leads', { screen: 'LeadDetail', params: { leadId: l._id } })}
                activeOpacity={0.8}
              >
                <Icon name="calendar-clock" size={18} color={colors.warning} />
                <View style={styles.dueLeadInfo}>
                  <Text style={[styles.dueLeadName, { color: colors.text }]} numberOfLines={1}>{l.name}</Text>
                  <Text style={[styles.dueLeadMeta, { color: colors.textSecondary }]}>
                    Due · {formatDueDate(l.nextFollowUpAt)}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.dueLeadsCta, { backgroundColor: colors.error + '25' }]}
              onPress={() => navigation.navigate('Leads', { screen: 'DueLeads' })}
            >
              <Text style={[styles.dueLeadsCtaText, { color: colors.error }]}>Open due leads</Text>
              <Icon name="arrow-right" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="home-city"
          label="Properties"
          value={String(propertiesTotal)}
          colors={colors}
          iconBg={colors.primary + '20'}
          iconColor={colors.primary}
        />
        <StatCard
          icon="target"
          label="Leads"
          value={String(leadTotal)}
          colors={colors}
          iconBg={colors.info + '20'}
          iconColor={colors.info}
        />
        <StatCard
          icon="clock-alert"
          label="Overdue"
          value={String(overdue)}
          colors={colors}
          iconBg={colors.error + '20'}
          iconColor={colors.error}
        />
        <StatCard
          icon="calendar-today"
          label="Due Today"
          value={String(dueToday)}
          colors={colors}
          iconBg={colors.warning + '20'}
          iconColor={colors.warning}
        />
      </View>

      {/* Quick Actions */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'home-plus', title: 'Properties', screen: 'Properties', desc: 'Manage listings' },
            { icon: 'target', title: 'Leads', screen: 'Leads', desc: 'Follow-ups & reminders' },
            { icon: 'email', title: 'Queries', screen: 'Queries', desc: 'Contact form queries' },
          ].map((a) => (
            <TouchableOpacity
              key={a.screen}
              style={[styles.actionCard, { backgroundColor: colors.bg, borderColor: colors.border }]}
              onPress={() => navigation.navigate(a.screen)}
            >
              <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
                <Icon name={a.icon as any} size={24} color={colors.primary} />
              </View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{a.title}</Text>
              <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>{a.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Leads */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Leads</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Leads')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentLeads.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Icon name="target" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No leads yet</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Leads will appear here</Text>
          </View>
        ) : (
          recentLeads.map((l) => (
            <View key={l._id} style={[styles.listItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.listIcon, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="account" size={20} color={colors.primary} />
              </View>
              <View style={styles.listContent}>
                <Text style={[styles.listTitle, { color: colors.text }]}>{l.name}</Text>
                <Text style={[styles.listSub, { color: colors.textSecondary }]}>
                  {l.propertyName || 'General'} · {l.status}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Recent Properties */}
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Properties</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Properties')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentProperties.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Icon name="home-city" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No properties yet</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Add your first listing</Text>
          </View>
        ) : (
          recentProperties.map((p) => (
            <View key={p._id} style={[styles.listItem, { borderBottomColor: colors.border }]}>
              <View style={[styles.listIcon, { backgroundColor: colors.primary + '20' }]}>
                <Icon name="home" size={20} color={colors.primary} />
              </View>
              <View style={styles.listContent}>
                <Text style={[styles.listTitle, { color: colors.text }]}>{p.name || 'Untitled'}</Text>
                <Text style={[styles.listSub, { color: colors.textSecondary }]}>
                  {p.status || 'draft'} · {p.propertyType || '—'}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  welcomeTitle: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  welcomeSub: { fontSize: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 13 },
  section: {
    padding: 10,
    paddingVertical:16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  actionCard: {
    flex: 1,
    minWidth: '30%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  actionDesc: { fontSize: 12 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  listIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  listSub: { fontSize: 13 },
  empty: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: { fontSize: 15, fontWeight: '600', marginTop: 12 },
  emptySub: { fontSize: 13, marginTop: 4 },
  dueLeadsCard: {
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    flexDirection: 'row',
    ...Platform.select({
      ios: { shadowColor: '#EF4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  dueLeadsAccent: {
    width: 5,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  dueLeadsContent: { flex: 1, padding: 16, paddingLeft: 20 },
  dueLeadsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dueLeadsTitle: { fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  dueLeadsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 'auto',
  },
  dueLeadsBadgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  dueLeadsSub: { fontSize: 13, marginBottom: 12 },
  dueLeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  dueLeadInfo: { flex: 1, minWidth: 0 },
  dueLeadName: { fontSize: 15, fontWeight: '600' },
  dueLeadMeta: { fontSize: 12, marginTop: 2 },
  dueLeadsCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  dueLeadsCtaText: { fontSize: 14, fontWeight: '700' },
});
