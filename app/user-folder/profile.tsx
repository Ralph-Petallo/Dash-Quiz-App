import DeleteAccountModal from '@/components/DeleteAccountModal';
import EditProfileModal from '@/components/EditProfileModal';
import useAuth from '@/hooks/useAuth';
import useData from '@/hooks/useData';
import { API_BASE_URL } from '@/services/api';
import { uploadProfilePhoto } from '@/store/profileStore';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Frosted Noir Palette ─────────────────────────────────────────────────────

const WHITE = '#FFFFFF';
const BLACK = '#000000';
const LIGHT_GRAY = '#D3D3D3';
const GRAY = '#A9A9A9';
const DARK_GRAY = '#696969';

// Frosted surfaces
const GLASS = 'rgba(0,0,0,0.035)';
const GLASS_LIGHT = 'rgba(0,0,0,0.06)';
const GLASS_BORDER = 'rgba(0,0,0,0.10)';
const GLASS_BORDER_SOFT = 'rgba(0,0,0,0.07)';

const LOCAL_AVATAR_BASE = `${API_BASE_URL}/storage/images/profiles/`;

// ─── Info Row ─────────────────────────────────────────────────────────────────

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <View style={styles.infoIcon}>
        <Ionicons
          name={icon}
          size={15}
          color={DARK_GRAY}
        />
      </View>

      <Text style={styles.infoLabel}>
        {label}
      </Text>
    </View>

    <Text
      style={styles.infoValue}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const {
    user,
    setUser,
    fetchUser,
  } = useAuth();

  const {
    stats,
    fetchStats,
  } = useData();

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const [editVisible, setEditVisible] =
    useState(false);

  const [deleteVisible, setDeleteVisible] =
    useState(false);

  const [photoUploading, setPhotoUploading] =
    useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  // Refresh whenever profile page is focused
  // ─────────────────────────────────────────────────────────────────────────

  useFocusEffect(
    useCallback(() => {
      fetchStats();
      fetchUser();
    }, [fetchStats, fetchUser])
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Fade in
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      fadeAnim.setValue(0);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [user, fadeAnim]);

  // ─────────────────────────────────────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="person-outline"
            size={22}
            color={BLACK}
          />
        </View>

        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </SafeAreaView>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Profile data
  // ─────────────────────────────────────────────────────────────────────────

  const avatarUri = !user.profile_photo
    ? `${LOCAL_AVATAR_BASE}default.png`
    : `${LOCAL_AVATAR_BASE}${user.profile_photo}`;

  const dateJoined = user.created_at
    ? new Date(
      user.created_at
    ).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    })
    : '—';

  const quizzesTaken =
    stats?.completed_quizzes ??
    user.quizzes_taken ??
    '—';

  // ─────────────────────────────────────────────────────────────────────────
  // Pick avatar
  // ─────────────────────────────────────────────────────────────────────────

  const handlePickAvatar = async () => {
    const {
      status,
    } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library.'
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    const mimeType =
      asset.mimeType ??
      'image/jpeg';

    setPhotoUploading(true);

    try {
      const res =
        await uploadProfilePhoto(
          asset,
          mimeType
        );

      setUser((prev: any) => ({
        ...prev,
        profile_photo:
          res.new_photo,
      }));
    } catch {
      Alert.alert(
        'Upload failed',
        'Could not update your profile photo.'
      );
    } finally {
      setPhotoUploading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Profile saved
  // ─────────────────────────────────────────────────────────────────────────

  const handleProfileSaved = (
    updatedUser: Record<string, any>
  ) => {
    setUser((prev: any) => ({
      ...prev,
      ...updatedUser,
    }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
            },
          ]}
        >

          {/* ─────────────────────────────────────────────────────
                        PROFILE HEADER
                    ───────────────────────────────────────────────────── */}

          <View style={styles.profileHeader}>

            {/* Avatar */}
            <TouchableOpacity
              onPress={handlePickAvatar}
              disabled={photoUploading}
              activeOpacity={0.85}
              style={styles.avatarTouchable}
            >
              <View
                style={
                  styles.avatarWrap
                }
              >
                <View
                  style={
                    styles.avatarRing
                  }
                >
                  <Image
                    source={{
                      uri: avatarUri,
                    }}
                    style={
                      styles.avatar
                    }
                  />
                </View>

                {/* Camera Badge */}
                <View
                  style={[
                    styles.cameraBadge,
                    photoUploading &&
                    styles.cameraBadgeUploading,
                  ]}
                >
                  <Ionicons
                    name={
                      photoUploading
                        ? 'sync'
                        : 'camera'
                    }
                    size={
                      photoUploading
                        ? 14
                        : 13
                    }
                    color={
                      photoUploading
                        ? WHITE
                        : BLACK
                    }
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Name */}
            <Text style={styles.name}>
              {user.first_name}
            </Text>

            {/* Email */}
            <Text style={styles.email}>
              {user.email}
            </Text>

          </View>

          {/* ─────────────────────────────────────────────────────
                        DIVIDER
                    ───────────────────────────────────────────────────── */}

          <View style={styles.divider} />

          {/* ─────────────────────────────────────────────────────
                        PROFILE INFORMATION
                    ───────────────────────────────────────────────────── */}

          <View style={styles.infoBox}>

            <InfoRow
              icon="calendar"
              label="DATE JOINED"
              value={dateJoined}
            />

            <View
              style={styles.rowSep}
            />

            <InfoRow
              icon="clipboard"
              label="QUIZZES TAKEN"
              value={String(
                quizzesTaken
              )}
            />

          </View>

          {/* ─────────────────────────────────────────────────────
                        ACTION BUTTONS
                    ───────────────────────────────────────────────────── */}

          <View style={styles.btnRow}>

            {/* Edit */}
            <TouchableOpacity
              onPress={() =>
                setEditVisible(
                  true
                )
              }
              style={
                styles.btnEdit
              }
              activeOpacity={0.8}
            >
              <FontAwesome5
                name="pen"
                size={14}
                color={WHITE}
              />

              <Text
                style={
                  styles.btnEditText
                }
              >
                Edit Profile
              </Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              onPress={() =>
                setDeleteVisible(
                  true
                )
              }
              style={
                styles.btnDelete
              }
              activeOpacity={0.8}
            >
              <FontAwesome5
                name="trash"
                size={13}
                color={BLACK}
              />

              <Text
                style={
                  styles.btnDeleteText
                }
              >
                Delete Account
              </Text>
            </TouchableOpacity>

          </View>

        </Animated.View>
      </ScrollView>

      {/* ─────────────────────────────────────────────────────────────
                EDIT PROFILE MODAL
            ───────────────────────────────────────────────────────────── */}

      <EditProfileModal
        visible={editVisible}
        onClose={() =>
          setEditVisible(false)
        }
        onSaved={handleProfileSaved}
        initialData={{
          first_name:
            user.first_name ?? '',
          last_name:
            user.last_name ?? '',
          email:
            user.email ?? '',
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
                DELETE ACCOUNT MODAL
            ───────────────────────────────────────────────────────────── */}

      <DeleteAccountModal
        visible={deleteVisible}
        onClose={() =>
          setDeleteVisible(false)
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  // ─────────────────────────────────────────────────────────────────────────
  // PAGE
  // ─────────────────────────────────────────────────────────────────────────

  safe: {
    flex: 1,
    backgroundColor: WHITE,
  },

  container: {
    flex: 1,
    backgroundColor: WHITE,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },

  content: {
    width: '100%',
    alignItems: 'center',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────────

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE,
  },

  loadingIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: BLACK,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  loadingText: {
    fontSize: 12,
    color: DARK_GRAY,
    fontWeight: '600',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PROFILE HEADER
  // ─────────────────────────────────────────────────────────────────────────

  profileHeader: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 18,
  },

  avatarTouchable: {
    marginBottom: 14,
  },

  avatarWrap: {
    position: 'relative',
  },

  avatarRing: {
    padding: 3,
    borderRadius: 54,
    borderWidth: 2,
    borderColor: BLACK,
    backgroundColor: WHITE,
  },

  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
  },

  cameraBadge: {
    position: 'absolute',
    right: -3,
    bottom: -2,

    width: 34,
    height: 34,

    borderRadius: 17,

    backgroundColor: WHITE,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 3,
    borderColor: BLACK,

    shadowColor: BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },

  cameraBadgeUploading: {
    backgroundColor: BLACK,
    borderColor: WHITE,
  },

  name: {
    fontSize: 26,
    fontWeight: '800',
    color: BLACK,
    letterSpacing: -0.7,
    marginBottom: 4,
  },

  email: {
    fontSize: 13,
    color: DARK_GRAY,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVIDER
  // ─────────────────────────────────────────────────────────────────────────

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: LIGHT_GRAY,
    marginBottom: 32,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INFORMATION
  // ─────────────────────────────────────────────────────────────────────────

  infoBox: {
    width: '100%',
    backgroundColor: GLASS,

    borderRadius: 15,

    borderWidth: 1,
    borderColor: GLASS_BORDER,

    marginBottom: 28,

    overflow: 'hidden',
  },

  infoRow: {
    minHeight: 62,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  infoIcon: {
    width: 34,
    height: 34,

    borderRadius: 9,

    backgroundColor: GLASS_LIGHT,

    borderWidth: 1,
    borderColor: GLASS_BORDER_SOFT,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: DARK_GRAY,
    letterSpacing: 0.7,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: BLACK,
    marginLeft: 12,
    maxWidth: '45%',
  },

  rowSep: {
    height: 1,
    backgroundColor: GLASS_BORDER,
    marginHorizontal: 14,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BUTTONS
  // ─────────────────────────────────────────────────────────────────────────

  btnRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },

  btnEdit: {
    flex: 1,

    minHeight: 56,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    backgroundColor: BLACK,

    paddingVertical: 14,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: BLACK,
  },

  btnEditText: {
    color: WHITE,
    fontWeight: '800',
    fontSize: 14,
  },

  btnDelete: {
    flex: 1,

    minHeight: 56,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    backgroundColor: WHITE,

    paddingVertical: 14,

    borderRadius: 14,

    borderWidth: 1,
    borderColor: BLACK,
  },

  btnDeleteText: {
    color: BLACK,
    fontWeight: '800',
    fontSize: 14,
  },
});