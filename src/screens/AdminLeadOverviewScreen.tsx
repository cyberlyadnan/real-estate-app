/**
 * Admin Lead Overview - Stats, alerts, quick actions. Entry point for Leads section.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as AdminApi from '../api/admin';

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString(undefined, { dateStyle: 'short' }) + ' ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' });
}

export default function AdminLeadOverviewScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [stats, setStats] = useState<AdminApi.LeadStats | null>(null);
  const [alerts, setAlerts] = useState<{ overdueLeads: AdminApi.LeadItem[]; upcomingLeads: AdminApi.LeadItem[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        AdminApi.getLeadStats(),
        AdminApi.getLeadAlerts(),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (alertsRes.success && alertsRes.data) {
        setAlerts({
          overdueLeads: alertsRes.data.overdueLeads || [],
          upcomingLeads: alertsRes.data.upcomingLeads || [],
        });
      }
    } catch {
      // non-blocking
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const onRefresh = () => {
    setRefreshing(true);
    fetch();
  };

  const hasAlerts = alerts && (alerts.overdueLeads?.length > 0 || alerts.upcomingLeads?.length > 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Lead Management</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Overview & quick actions</Text>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {/* Stats */}
          {stats && (
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stats.total}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Leads</Text>
                </View>
                <View style={[styles.statBox, styles.statDivider, { borderColor: colors.border }]}>
                  <Text style={[styles.statValue, { color: colors.error }]}>{stats.overdueFollowUps}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Overdue</Text>
                </View>
                <View style={[styles.statBox, styles.statDivider, { borderColor: colors.border }]}>
                  <Text style={[styles.statValue, { color: colors.warning }]}>{stats.dueToday}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Due Today</Text>
                </View>
              </View>
            </View>
          )}

          {/* Alerts */}
          {hasAlerts && (
            <View style={[styles.alertsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.alertsHeader}>
                <Icon name="alert-circle" size={20} color={colors.warning} />
                <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Follow-up Alerts</Text>
              </View>
              {alerts!.overdueLeads.length > 0 && (
                <View style={styles.alertSection}>
                  <Text style={[styles.alertLabel, { color: colors.error }]}>Overdue</Text>
                  {alerts!.overdueLeads.slice(0, 5).map((l) => (
                    <TouchableOpacity
                      key={l._id}
                      style={styles.alertRow}
                      onPress={() => navigation.navigate('LeadDetail', { leadId: l._id })}
                    >
                      <Text style={[styles.alertName, { color: colors.primary }]} numberOfLines={1}>
                        {l.name} – {l.propertyName || 'General'}
                      </Text>
                      <Text style={[styles.alertDate, { color: colors.error }]}>
                        {l.nextFollowUpAt ? formatDate(l.nextFollowUpAt) : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {alerts!.upcomingLeads.length > 0 && (
                <View style={styles.alertSection}>
                  <Text style={[styles.alertLabel, { color: colors.warning }]}>Upcoming (24h)</Text>
                  {alerts!.upcomingLeads.slice(0, 5).map((l) => (
                    <TouchableOpacity
                      key={l._id}
                      style={styles.alertRow}
                      onPress={() => navigation.navigate('LeadDetail', { leadId: l._id })}
                    >
                      <Text style={[styles.alertName, { color: colors.primary }]} numberOfLines={1}>
                        {l.name} – {l.propertyName || 'General'}
                      </Text>
                      <Text style={[styles.alertDate, { color: colors.textMuted }]}>
                        {l.nextFollowUpAt ? formatDate(l.nextFollowUpAt) : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.dueLeadsBtn, { backgroundColor: colors.error + '18', borderColor: colors.error }]}
              onPress={() => navigation.navigate('DueLeads')}
            >
              <Icon name="calendar-alert" size={24} color={colors.error} />
              <View style={styles.btnTextWrap}>
                <Text style={[styles.dueLeadsBtnText, { color: colors.error }]}>Due leads</Text>
                <Text style={[styles.dueLeadsBtnSub, { color: colors.textSecondary }]}>
                  Overdue & due today · Filter & act
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('LeadList')}
            >
              <Icon name="format-list-bulleted" size={24} color="#fff" />
              <View style={styles.btnTextWrap}>
                <Text style={styles.primaryBtnText}>Browse All Leads</Text>
                <Text style={styles.primaryBtnSub}>Search, filter & manage leads</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('LeadForm')}
            >
              <Icon name="account-plus" size={24} color={colors.primary} />
              <View style={styles.btnTextWrap}>
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Add New Lead</Text>
                <Text style={[styles.secondaryBtnSub, { color: colors.textMuted }]}>Manually add a lead to CRM</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  loadingWrap: { paddingVertical: 48, alignItems: 'center' },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  statsRow: { flexDirection: 'row' },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
  alertsCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  alertsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  alertSection: { marginTop: 12 },
  alertLabel: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  alertName: { flex: 1, fontSize: 14, fontWeight: '600' },
  alertDate: { fontSize: 11 },
  actions: { gap: 12 },
  dueLeadsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 2,
    gap: 16,
  },
  dueLeadsBtnText: { fontSize: 16, fontWeight: '700' },
  dueLeadsBtnSub: { fontSize: 13, marginTop: 2 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    gap: 16,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    gap: 16,
  },
  btnTextWrap: { flex: 1 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  primaryBtnSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  secondaryBtnText: { fontSize: 16, fontWeight: '700' },
  secondaryBtnSub: { fontSize: 13, marginTop: 2 },
});
