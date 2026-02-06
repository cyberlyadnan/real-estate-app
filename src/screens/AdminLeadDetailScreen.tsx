/**
 * Admin Lead Detail - Full lead info, edit, follow-ups, delete
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
  Alert,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as AdminApi from '../api/admin';

interface LeadDetail extends AdminApi.LeadItem {
  notes?: string | null;
  budget?: number | null;
  budgetMax?: number | null;
  preferredArea?: string | null;
  address?: string | null;
  lastContactMode?: string | null;
  contactHistory?: string | null;
  followUps?: AdminApi.FollowUpItem[];
}

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'nurturing'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const FOLLOW_UP_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'site_visit', label: 'Site Visit' },
  { value: 'document', label: 'Document' },
  { value: 'other', label: 'Other' },
];
const CONTACT_MODE_OPTIONS = ['', 'call', 'email', 'whatsapp', 'meeting', 'site_visit', 'other'];

function formatDate(s: string) {
  const d = new Date(s);
  return d.toLocaleDateString(undefined, { dateStyle: 'medium' }) + ' at ' + d.toLocaleTimeString(undefined, { timeStyle: 'short' });
}

function getSourceLabel(s: string) {
  switch (s) {
    case 'contact_page': return 'Contact Page';
    case 'mobile_app': return 'Mobile App';
    case 'lead_form': return 'Lead Form';
    case 'property_detail': return 'Property Detail';
    default: return s || 'Other';
  }
}

export default function AdminLeadDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const leadId = route.params?.leadId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [editBudgetMax, setEditBudgetMax] = useState('');
  const [editPreferredArea, setEditPreferredArea] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLastContactMode, setEditLastContactMode] = useState('');
  const [editContactHistory, setEditContactHistory] = useState('');
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const today = new Date();
  const defaultDate = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
  const [newFollowUp, setNewFollowUp] = useState({
    dueAt: defaultDate,
    dueTime: '09:00',
    type: 'call',
    title: '',
    notes: '',
  });

  const fetchLead = useCallback(async () => {
    if (!leadId) return;
    try {
      setLoading(true);
      const res = await AdminApi.getLead(leadId);
      if (res.success && res.data) {
        const data = res.data as LeadDetail;
        setLead(data);
        setEditStatus(data.status);
        setEditPriority(data.priority || 'medium');
        setEditNotes(data.notes || '');
        setEditBudget(data.budget != null ? String(data.budget) : '');
        setEditBudgetMax(data.budgetMax != null ? String(data.budgetMax) : '');
        setEditPreferredArea(data.preferredArea || '');
        setEditAddress(data.address || '');
        setEditLastContactMode(data.lastContactMode || '');
        setEditContactHistory(data.contactHistory || '');
      } else {
        Alert.alert('Error', 'Lead not found');
        navigation.goBack();
      }
    } catch {
      Alert.alert('Error', 'Failed to load lead');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [leadId, navigation]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  const handleSaveLead = async () => {
    if (!leadId) return;
    setSaving(true);
    try {
      const res = await AdminApi.updateLead(leadId, {
        status: editStatus,
        priority: editPriority,
        notes: editNotes.trim() || undefined,
        budget: editBudget ? Number(editBudget) : null,
        budgetMax: editBudgetMax ? Number(editBudgetMax) : null,
        preferredArea: editPreferredArea.trim() || null,
        address: editAddress.trim() || null,
        lastContactMode: editLastContactMode || null,
        contactHistory: editContactHistory.trim() || null,
      });
      if (res.success && res.data) {
        setLead((l) => (l ? { ...l, ...res.data } : null));
        Alert.alert('Saved', 'Lead updated successfully');
      } else {
        Alert.alert('Error', res.message || 'Failed to update');
      }
    } catch {
      Alert.alert('Error', 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFollowUp = async () => {
    if (!leadId || !newFollowUp.title.trim()) {
      Alert.alert('Required', 'Title is required');
      return;
    }
    const [h, m] = newFollowUp.dueTime.split(':').map(Number);
    const dueAt = new Date(newFollowUp.dueAt + 'T' + (newFollowUp.dueTime || '09:00'));
    dueAt.setHours(h || 9, m || 0, 0, 0);
    setSaving(true);
    try {
      const res = await AdminApi.addLeadFollowUp(leadId, {
        dueAt: dueAt.toISOString(),
        type: newFollowUp.type,
        title: newFollowUp.title.trim(),
        notes: newFollowUp.notes.trim() || undefined,
      });
      if (res.success) {
        const t = new Date();
        setNewFollowUp({
          dueAt: t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'),
          dueTime: '09:00',
          type: 'call',
          title: '',
          notes: '',
        });
        setShowAddFollowUp(false);
        fetchLead();
      } else {
        Alert.alert('Error', res.message || 'Failed to add follow-up');
      }
    } catch {
      Alert.alert('Error', 'Failed to add follow-up');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteFollowUp = async (followUpId: string) => {
    if (!leadId) return;
    setSaving(true);
    try {
      const res = await AdminApi.completeLeadFollowUp(leadId, followUpId);
      if (res.success) fetchLead();
      else Alert.alert('Error', res.message || 'Failed to complete');
    } catch {
      Alert.alert('Error', 'Failed to complete follow-up');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Lead',
      'Are you sure you want to delete this lead? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await AdminApi.deleteLead(leadId);
              if (res.success) {
                Alert.alert('Deleted', 'Lead has been deleted', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('Error', res.message || 'Failed to delete');
              }
            } catch {
              Alert.alert('Error', 'Failed to delete lead');
            }
          },
        },
      ]
    );
  };

  const openEmail = () => {
    if (lead?.email) Linking.openURL(`mailto:${lead.email}`);
  };

  const openPhone = () => {
    if (lead?.phone) Linking.openURL(`tel:${lead.phone}`);
  };

  if (loading || !lead) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading...</Text>
      </View>
    );
  }

  const pendingFollowUps = (lead.followUps || []).filter((f) => !f.completedAt);
  const completedFollowUps = (lead.followUps || []).filter((f) => f.completedAt);
  const isOverdue = lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) < new Date();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <AppHeader onBack={() => navigation.goBack()} title="Lead Details" />
      {/* Header card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.name, { color: colors.text }]}>{lead.name}</Text>
        <TouchableOpacity onPress={openEmail} style={styles.contactRow}>
          <Icon name="email-outline" size={20} color={colors.primary} />
          <Text style={[styles.link, { color: colors.primary }]}>{lead.email}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openPhone} style={styles.contactRow}>
          <Icon name="phone-outline" size={20} color={colors.primary} />
          <Text style={[styles.link, { color: colors.primary }]}>{lead.phone}</Text>
        </TouchableOpacity>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Source: {getSourceLabel(lead.source)}</Text>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>{formatDate(lead.createdAt)}</Text>
        </View>
        {lead.propertyName && (
          <View style={styles.propertyRow}>
            <Icon name="home-city-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.value, { color: colors.textSecondary }]}>{lead.propertyName}</Text>
          </View>
        )}
      </View>

      {/* Message */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Message</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{lead.message || '—'}</Text>
      </View>

      {/* Budget, area, address */}
      {(lead.budget != null || lead.budgetMax != null || lead.preferredArea || lead.address) && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Details</Text>
          {lead.budget != null && <Text style={[styles.detailRow, { color: colors.textSecondary }]}>Budget (min): AED {Number(lead.budget).toLocaleString()}</Text>}
          {lead.budgetMax != null && <Text style={[styles.detailRow, { color: colors.textSecondary }]}>Budget (max): AED {Number(lead.budgetMax).toLocaleString()}</Text>}
          {lead.preferredArea && <Text style={[styles.detailRow, { color: colors.textSecondary }]}>Preferred Area: {lead.preferredArea}</Text>}
          {lead.address && <Text style={[styles.detailRow, { color: colors.textSecondary }]}>Address: {lead.address}</Text>}
        </View>
      )}

      {/* Status & Priority */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {STATUS_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, { backgroundColor: editStatus === s ? colors.primary + '25' : colors.bg, borderColor: colors.border }]}
              onPress={() => setEditStatus(s)}
            >
              <Text style={[styles.chipText, { color: editStatus === s ? colors.primary : colors.text }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={[styles.cardTitle, { color: colors.text, marginTop: 16 }]}>Priority</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {PRIORITY_OPTIONS.map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, { backgroundColor: editPriority === p ? colors.primary + '25' : colors.bg, borderColor: colors.border }]}
              onPress={() => setEditPriority(p)}
            >
              <Text style={[styles.chipText, { color: editPriority === p ? colors.primary : colors.text }]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Update lead fields */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Update lead</Text>
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Budget (min) AED</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="—"
            placeholderTextColor={colors.textMuted}
            value={editBudget}
            onChangeText={setEditBudget}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Budget (max) AED</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="—"
            placeholderTextColor={colors.textMuted}
            value={editBudgetMax}
            onChangeText={setEditBudgetMax}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Preferred Area</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g. Palm Jumeirah"
            placeholderTextColor={colors.textMuted}
            value={editPreferredArea}
            onChangeText={setEditPreferredArea}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Address</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="Full address"
            placeholderTextColor={colors.textMuted}
            value={editAddress}
            onChangeText={setEditAddress}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Last Contact Mode</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {CONTACT_MODE_OPTIONS.filter(Boolean).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.smallChip, { backgroundColor: editLastContactMode === m ? colors.primary + '25' : colors.bg, borderColor: colors.border }]}
                onPress={() => setEditLastContactMode(m)}
              >
                <Text style={[styles.chipText, { color: editLastContactMode === m ? colors.primary : colors.text }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Contact History</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="Summary of calls, emails, messages..."
            placeholderTextColor={colors.textMuted}
            value={editContactHistory}
            onChangeText={setEditContactHistory}
            multiline
            numberOfLines={3}
          />
        </View>
        <View style={styles.fieldRow}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notes</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            placeholder="Internal notes..."
            placeholderTextColor={colors.textMuted}
            value={editNotes}
            onChangeText={setEditNotes}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSaveLead}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Icon name="content-save" size={22} color="#fff" />
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Follow-ups */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.followUpHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Follow-ups</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddFollowUp(!showAddFollowUp)}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        {lead.nextFollowUpAt && (
          <View style={[styles.nextFollowUpRow, isOverdue && { backgroundColor: colors.error + '15' }]}>
            <Icon name={isOverdue ? 'alert-circle' : 'calendar-clock'} size={18} color={isOverdue ? colors.error : colors.textMuted} />
            <Text style={[styles.nextFollowUpText, { color: isOverdue ? colors.error : colors.textSecondary }]}>
              Next: {formatDate(lead.nextFollowUpAt)}{isOverdue ? ' (Overdue)' : ''}
            </Text>
          </View>
        )}

        {showAddFollowUp && (
          <View style={[styles.addFollowUpForm, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              placeholder="2025-02-10"
              placeholderTextColor={colors.textMuted}
              value={newFollowUp.dueAt}
              onChangeText={(v) => setNewFollowUp((p) => ({ ...p, dueAt: v }))}
            />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {FOLLOW_UP_TYPES.map((t) => (
                <TouchableOpacity
                  key={t.value}
                  style={[styles.smallChip, { backgroundColor: newFollowUp.type === t.value ? colors.primary + '25' : colors.bg, borderColor: colors.border }]}
                  onPress={() => setNewFollowUp((p) => ({ ...p, type: t.value }))}
                >
                  <Text style={[styles.chipText, { color: newFollowUp.type === t.value ? colors.primary : colors.text }]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Time</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              placeholder="09:00"
              placeholderTextColor={colors.textMuted}
              value={newFollowUp.dueTime}
              onChangeText={(v) => setNewFollowUp((p) => ({ ...p, dueTime: v }))}
            />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. Call to discuss pricing"
              placeholderTextColor={colors.textMuted}
              value={newFollowUp.title}
              onChangeText={(v) => setNewFollowUp((p) => ({ ...p, title: v }))}
            />
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notes</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              placeholder="Optional"
              placeholderTextColor={colors.textMuted}
              value={newFollowUp.notes}
              onChangeText={(v) => setNewFollowUp((p) => ({ ...p, notes: v }))}
            />
            <View style={styles.addFollowUpActions}>
              <TouchableOpacity
                style={[styles.submitFollowUpBtn, { backgroundColor: colors.primary }]}
                onPress={handleAddFollowUp}
                disabled={saving}
              >
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.submitFollowUpText}>Add follow-up</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowAddFollowUp(false)}>
                <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {pendingFollowUps.length === 0 && completedFollowUps.length === 0 && !showAddFollowUp && (
          <Text style={[styles.emptyFollowUp, { color: colors.textMuted }]}>No follow-ups yet. Add one to never miss a touchpoint.</Text>
        )}
        {pendingFollowUps.map((f) => (
          <View key={f._id} style={[styles.followUpItem, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '40' }]}>
            <View style={styles.followUpItemContent}>
              <Text style={[styles.followUpTitle, { color: colors.text }]}>{f.title}</Text>
              <Text style={[styles.followUpMeta, { color: colors.textMuted }]}>{formatDate(f.dueAt)} · {f.type}</Text>
              {f.notes ? <Text style={[styles.followUpNotes, { color: colors.textSecondary }]}>{f.notes}</Text> : null}
            </View>
            <TouchableOpacity
              style={[styles.completeBtn, { backgroundColor: colors.success + '30' }]}
              onPress={() => handleCompleteFollowUp(f._id)}
              disabled={saving}
            >
              <Icon name="check-circle" size={24} color={colors.success} />
            </TouchableOpacity>
          </View>
        ))}
        {completedFollowUps.map((f) => (
          <View key={f._id} style={[styles.followUpItem, styles.followUpCompleted, { backgroundColor: colors.bg, borderColor: colors.border }]}>
            <Icon name="check-circle" size={20} color={colors.success} />
            <View style={styles.followUpItemContent}>
              <Text style={[styles.followUpTitle, styles.followUpStrike, { color: colors.text }]}>{f.title}</Text>
              <Text style={[styles.followUpMeta, { color: colors.textMuted }]}>
                Completed {f.completedAt ? formatDate(f.completedAt) : ''}
                {f.completedBy?.name ? ` by ${f.completedBy.name}` : ''}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Delete */}
      <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.error }]} onPress={handleDelete}>
        <Icon name="delete-outline" size={22} color={colors.error} />
        <Text style={[styles.deleteBtnText, { color: colors.error }]}>Delete Lead</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  backText: { fontSize: 16, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  link: { fontSize: 16, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 4 },
  metaLabel: { fontSize: 13 },
  propertyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  value: { fontSize: 15 },
  message: { fontSize: 15, lineHeight: 24 },
  detailRow: { fontSize: 14, marginBottom: 6 },
  chipRow: { marginBottom: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginRight: 8 },
  smallChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, marginRight: 6 },
  chipText: { fontSize: 14, fontWeight: '600' },
  fieldRow: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 16,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  followUpHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  nextFollowUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  nextFollowUpText: { fontSize: 14 },
  addFollowUpForm: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  addFollowUpActions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12 },
  submitFollowUpBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  submitFollowUpText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelText: { fontSize: 14, fontWeight: '600' },
  emptyFollowUp: { fontSize: 14, fontStyle: 'italic' },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  followUpItemContent: { flex: 1, minWidth: 0 },
  followUpTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  followUpStrike: { textDecorationLine: 'line-through' },
  followUpMeta: { fontSize: 12 },
  followUpNotes: { fontSize: 13, marginTop: 4 },
  followUpCompleted: { opacity: 0.85 },
  completeBtn: { padding: 8, borderRadius: 10 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  deleteBtnText: { fontSize: 16, fontWeight: '700' },
});
