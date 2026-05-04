import DeleteAccountModal from '@/components/DeleteAccountModal';
import EditProfileModal from '@/components/EditProfileModal';
import useAuth from '@/hooks/useAuth';
import useData from '@/hooks/useData';
import { uploadProfilePhoto } from '@/store/profileStore';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE = '#6366f1';
const AVATAR_BASE = 'https://dashquiz.ralphcabanero.com/storage/images/profiles/';

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={s.infoRow}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value}</Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, setUser, fetchUser } = useAuth();
  const { stats, fetchStats } = useData();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // ✅ REFRESH STATS EVERY TIME SCREEN IS FOCUSED
  useFocusEffect(
    useCallback(() => {
      fetchStats();
      fetchUser();
    }, [fetchStats, fetchUser])
  );

  useEffect(() => {
    if (user) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
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
    user.profile_photo
      ? `${AVATAR_BASE}${user.profile_photo}`
      : `${AVATAR_BASE}default.png`;

  const dateJoined = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    })
    : '—';

  const quizzesTaken = stats?.completed_quizzes ?? user.quizzes_taken ?? '—';

  const averageScore =
    stats?.average_score != null
      ? `${Math.round(stats.average_score)}%`
      : '—';

  // ── Avatar picker ─────────────────────────────────────────────────────────

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';

    setPhotoUploading(true);
    try {
      const { profile_photo } = await uploadProfilePhoto(asset.uri, mimeType);
      setUser((prev: any) => ({ ...prev, profile_photo }));
    } catch {
      Alert.alert('Upload failed', 'Could not update your profile photo.');
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleProfileSaved = (updatedUser: Record<string, any>) => {
    setUser((prev: any) => ({ ...prev, ...updatedUser }));
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>

        <Animated.View style={[s.card, { opacity: fadeAnim }]}>

          {/* Avatar */}
          <TouchableOpacity onPress={handlePickAvatar} disabled={photoUploading}>
            <View style={s.avatarRing}>
              <Image source={{ uri: avatarUri }} style={s.avatar} />
            </View>
          </TouchableOpacity>

          {/* Name */}
          <Text style={s.name}>{user.first_name}</Text>
          <Text style={s.email}>{user.email}</Text>

          {/* Info */}
          <View style={s.infoBox}>
            <InfoRow label="DATE JOINED" value={dateJoined} />
            <View style={s.rowSep} />
            <InfoRow label="QUIZZES TAKEN" value={String(quizzesTaken)} />
            <View style={s.rowSep} />
            <InfoRow label="AVERAGE SCORE" value={averageScore} />
          </View>

          {/* Buttons */}
          <View style={s.btnRow}>
            <TouchableOpacity onPress={() => setEditVisible(true)} style={s.btnEdit}>
              <Text style={s.btnEditText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setDeleteVisible(true)} style={s.btnDelete}>
              <Text style={s.btnDeleteText}>Delete</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>

      </ScrollView>

      <EditProfileModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        onSaved={handleProfileSaved}
        initialData={{
          first_name: user.first_name ?? '',
          last_name: user.last_name ?? '',
          email: user.email ?? '',
        }}
      />

      <DeleteAccountModal
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f1f5f9' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  loadingText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: PURPLE,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  // Avatar
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatarRing: { padding: 3, borderRadius: 60, borderWidth: 3, borderColor: PURPLE },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PURPLE,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraBadgeUploading: { backgroundColor: '#22c55e' },

  // Name & Email
  name: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 3 },
  email: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },

  // Info box
  infoBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#f0edff',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  infoLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 0.8 },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  rowSep: { height: 1, backgroundColor: '#f0edff' },

  // Buttons
  btnRow: { flexDirection: 'row', gap: 10, width: '100%' },
  btnEdit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: PURPLE,
    paddingVertical: 13,
    borderRadius: 12,
  },
  btnEditText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnDelete: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  btnDeleteText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
});