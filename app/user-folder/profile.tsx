import useAuth from '@/hooks/useAuth';
import useData from '@/hooks/useData';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE      = '#6366f1';
const AVATAR_BASE = 'http://YOUR_IP:8000/storage/images/profiles/';

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user }    = useAuth();
  const { stats }   = useData();
  const fadeAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user) {
      Animated.timing(fadeAnim, {
        toValue:         1,
        duration:        400,
        useNativeDriver: true,
      }).start();
    }
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={s.center}>
        <Text style={s.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  const avatarUri =
    user.profile_photo && user.profile_photo !== 'default.png'
      ? `${AVATAR_BASE}${user.profile_photo}`
      : 'https://i.pravatar.cc/100';

  const dateJoined = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'numeric',
        day:   'numeric',
        year:  'numeric',
      })
    : '—';

  const quizzesTaken = stats?.total_quizzes ?? user.quizzes_taken ?? '—';

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <Animated.View style={[s.card, { opacity: fadeAnim }]}>

          {/* ── Avatar ── */}
          <View style={s.avatarWrap}>
            <View style={s.avatarRing}>
              <Image source={{ uri: avatarUri }} style={s.avatar} />
            </View>
            <View style={s.cameraBadge}>
              <Ionicons name="camera" size={11} color="#fff" />
            </View>
          </View>

          {/* ── Name & Email ── */}
          <Text style={s.name}>{user.first_name}</Text>
          <Text style={s.email}>{user.email}</Text>

          {/* ── Info rows ── */}
          <View style={s.infoBox}>
            <InfoRow label="DATE JOINED"   value={dateJoined} />
            <View style={s.rowSep} />
            <InfoRow label="QUIZZES TAKEN" value={String(quizzesTaken)} />
          </View>

          {/* ── Buttons ── */}
          <View style={s.btnRow}>
            <TouchableOpacity style={s.btnEdit} activeOpacity={0.85}>
              <Ionicons name="pencil-outline" size={14} color="#fff" />
              <Text style={s.btnEditText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.btnDelete} activeOpacity={0.75}>
              <Ionicons name="trash-outline" size={14} color="#ef4444" />
              <Text style={s.btnDeleteText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#f1f5f9' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  loadingText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },

  // Card
  card: {
    backgroundColor:  '#fff',
    borderRadius:     24,
    padding:          28,
    alignItems:       'center',
    shadowColor:      PURPLE,
    shadowOpacity:    0.08,
    shadowRadius:     20,
    shadowOffset:     { width: 0, height: 6 },
    elevation:        5,
  },

  // Avatar
  avatarWrap:   { position: 'relative', marginBottom: 14 },
  avatarRing:   { padding: 3, borderRadius: 60, borderWidth: 3, borderColor: PURPLE },
  avatar:       { width: 90, height: 90, borderRadius: 45 },
  cameraBadge:  {
    position:        'absolute',
    bottom:          0,
    right:           0,
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: PURPLE,
    justifyContent:  'center',
    alignItems:      'center',
    borderWidth:     2,
    borderColor:     '#fff',
  },

  // Name & Email
  name:  { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 3 },
  email: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },

  // Info box
  infoBox: {
    width:           '100%',
    backgroundColor: '#f8fafc',
    borderRadius:    14,
    paddingVertical:   6,
    paddingHorizontal: 16,
    marginBottom:    22,
    borderWidth:     1,
    borderColor:     '#f0edff',
  },
  infoRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize:      10,
    fontWeight:    '700',
    color:         '#94a3b8',
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#0f172a',
  },
  rowSep: {
    height:          1,
    backgroundColor: '#f0edff',
  },

  // Buttons
  btnRow:   { flexDirection: 'row', gap: 10, width: '100%' },
  btnEdit:  {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             6,
    backgroundColor: PURPLE,
    paddingVertical: 13,
    borderRadius:    12,
  },
  btnEditText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  btnDelete: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:             6,
    backgroundColor: '#fff',
    paddingVertical: 13,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     '#fee2e2',
  },
  btnDeleteText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
});