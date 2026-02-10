/**
 * Admin Query Detail - View and update query
 */

import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import * as AdminApi from '../api/admin';

const STATUS_OPTIONS = ['new', 'in_progress', 'resolved', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

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

export default function AdminQueryDetailScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const queryId = route.params?.queryId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState<AdminApi.QueryItem | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState('');

  useEffect(() => {
    if (queryId) {
      AdminApi.getQuery(queryId).then((res) => {
        if (res.success && res.data) {
          setQuery(res.data);
          setEditStatus(res.data.status);
          setEditNotes(res.data.notes || '');
          setEditPriority(res.data.priority || 'medium');
        } else {
          Alert.alert('Error', 'Query not found');
          navigation.goBack();
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
        Alert.alert('Error', 'Failed to load query');
        navigation.goBack();
      });
    }
  }, [queryId, navigation]);

  const handleSave = async () => {
    if (!queryId) return;
    setSaving(true);
    try {
      const res = await AdminApi.updateQuery(queryId, {
        status: editStatus,
        notes: editNotes,
        priority: editPriority,
      });
      if (res.success && res.data) {
        setQuery(res.data);
        Alert.alert('Saved', 'Query updated successfully');
      } else {
        Alert.alert('Error', res.message || 'Failed to update');
      }
    } catch {
      Alert.alert('Error', 'Failed to update query');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Query',
      'Are you sure you want to delete this query? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await AdminApi.deleteQuery(queryId);
              if (res.success) {
                Alert.alert('Deleted', 'Query has been deleted', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('Error', res.message || 'Failed to delete');
              }
            } catch {
              Alert.alert('Error', 'Failed to delete query');
            }
          },
        },
      ]
    );
  };

  const openEmail = () => {
    if (query?.email) Linking.openURL(`mailto:${query.email}`);
  };

  const openPhone = () => {
    if (query?.phone) Linking.openURL(`tel:${query.phone}`);
  };

  if (loading || !query) {
    return (
      <>
        <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
          <Text style={[styles.toolbarSub, { color: colors.textSecondary }]}>Query details</Text>
        </View>
        <View style={[styles.center, { backgroundColor: colors.bg }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
        <Text style={[styles.toolbarSub, { color: colors.textSecondary }]}>Query details</Text>
      </View>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.name, { color: colors.text }]}>{query.name}</Text>
        <TouchableOpacity onPress={openEmail} style={styles.contactRow}>
          <Icon name="email-outline" size={20} color={colors.primary} />
          <Text style={[styles.link, { color: colors.primary }]}>{query.email}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openPhone} style={styles.contactRow}>
          <Icon name="phone-outline" size={20} color={colors.primary} />
          <Text style={[styles.link, { color: colors.primary }]}>{query.phone}</Text>
        </TouchableOpacity>
        <View style={styles.metaRow}>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Source: {getSourceLabel(query.source)}</Text>
          <Text style={[styles.metaLabel, { color: colors.textMuted }]}>{formatDate(query.createdAt)}</Text>
        </View>
      </View>

      {/* Message */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Message</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{query.message || '—'}</Text>
      </View>

      {/* Interested Property */}
      {query.interestedProperty && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Interested Property</Text>
          <Text style={[styles.value, { color: colors.textSecondary }]}>{query.interestedProperty}</Text>
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
              <Text style={[styles.chipText, { color: editStatus === s ? colors.primary : colors.text }]}>{s.replace('_', ' ')}</Text>
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

      {/* Notes */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Internal Notes</Text>
        <TextInput
          style={[styles.notesInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
          placeholder="Add notes for your team..."
          placeholderTextColor={colors.textMuted}
          value={editNotes}
          onChangeText={setEditNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }]}
        onPress={handleSave}
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

      <TouchableOpacity
        style={[styles.deleteBtn, { borderColor: colors.error }]}
        onPress={handleDelete}
      >
        <Icon name="delete-outline" size={22} color={colors.error} />
        <Text style={[styles.deleteBtnText, { color: colors.error }]}>Delete Query</Text>
      </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  toolbar: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  toolbarSub: { fontSize: 14, fontWeight: '500' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 15 },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  link: { fontSize: 16, fontWeight: '600' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 4 },
  metaLabel: { fontSize: 13 },
  message: { fontSize: 15, lineHeight: 24 },
  value: { fontSize: 15 },
  chipRow: { marginBottom: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 12,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
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
