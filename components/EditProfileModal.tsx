import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { updateProfile, UpdateProfilePayload } from '../store/profileStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const PURPLE = '#6366f1';
const PURPLE_DARK = '#4f46e5';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    visible: boolean;
    onClose: () => void;
    onSaved: (updatedUser: Record<string, any>) => void;
    initialData: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

type FieldErrors = Partial<Record<
    'first_name' | 'last_name' | 'email' | 'current_password' | 'new_password' | 'confirm_password',
    string
>>;

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditProfileModal({ visible, onClose, onSaved, initialData }: Props) {
    const [firstName, setFirstName]           = useState('');
    const [lastName, setLastName]             = useState('');
    const [email, setEmail]                   = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword]       = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors]                 = useState<FieldErrors>({});
    const [apiError, setApiError]             = useState<string | null>(null);
    const [loading, setLoading]               = useState(false);

    // Sync initial data when modal opens
    useEffect(() => {
        if (visible) {
            setFirstName(initialData.first_name ?? '');
            setLastName(initialData.last_name ?? '');
            setEmail(initialData.email ?? '');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrors({});
            setApiError(null);
        }
    }, [visible]);

    const clearField = (key: keyof FieldErrors) =>
        setErrors((prev) => ({ ...prev, [key]: undefined }));

    const validate = (): boolean => {
        const e: FieldErrors = {};

        if (!firstName.trim()) e.first_name = 'First name is required.';
        if (!lastName.trim())  e.last_name  = 'Last name is required.';

        if (!email.trim()) {
            e.email = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.email = 'Enter a valid email address.';
        }

        const changingPassword = newPassword || confirmPassword || currentPassword;
        if (changingPassword) {
            if (!currentPassword) e.current_password = 'Current password is required.';
            if (!newPassword)     e.new_password     = 'New password is required.';
            else if (newPassword.length < 8)
                e.new_password = 'Password must be at least 8 characters.';
            if (newPassword !== confirmPassword)
                e.confirm_password = 'Passwords do not match.';
        }

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setApiError(null);
        setLoading(true);

        try {
            const payload: UpdateProfilePayload = {
                first_name: firstName.trim(),
                last_name:  lastName.trim(),
                email:      email.trim(),
            };

            if (currentPassword) {
                payload.current_password        = currentPassword;
                payload.new_password            = newPassword;
                payload.new_password_confirmation = confirmPassword;
            }

            const result = await updateProfile(payload);
            onSaved(result.user);
            onClose();
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Something went wrong. Please try again.';
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={s.overlay}
            >
                <View style={s.sheet}>
                    {/* Header */}
                    <View style={s.header}>
                        <View>
                            <Text style={s.title}>Edit Profile</Text>
                            <Text style={s.subtitle}>
                                Manage your account settings and email preferences.
                            </Text>
                        </View>
                        <Pressable onPress={onClose} style={s.closeBtn} hitSlop={8}>
                            <Ionicons name="close" size={18} color="#64748b" />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {/* API error */}
                        {apiError && (
                            <View style={s.apiErrorBox}>
                                <Text style={s.apiErrorText}>{apiError}</Text>
                            </View>
                        )}

                        {/* First Name + Last Name */}
                        <View style={s.row}>
                            <View style={s.halfField}>
                                <Text style={s.label}>First Name</Text>
                                <TextInput
                                    style={[s.input, errors.first_name && s.inputError]}
                                    value={firstName}
                                    onChangeText={(t) => { setFirstName(t); clearField('first_name'); }}
                                    placeholder="First name"
                                    placeholderTextColor="#cbd5e1"
                                />
                                {errors.first_name && <Text style={s.error}>{errors.first_name}</Text>}
                            </View>

                            <View style={s.halfField}>
                                <Text style={s.label}>Last Name</Text>
                                <TextInput
                                    style={[s.input, errors.last_name && s.inputError]}
                                    value={lastName}
                                    onChangeText={(t) => { setLastName(t); clearField('last_name'); }}
                                    placeholder="Last name"
                                    placeholderTextColor="#cbd5e1"
                                />
                                {errors.last_name && <Text style={s.error}>{errors.last_name}</Text>}
                            </View>
                        </View>

                        {/* Email */}
                        <Text style={s.label}>Email Address</Text>
                        <TextInput
                            style={[s.input, errors.email && s.inputError]}
                            value={email}
                            onChangeText={(t) => { setEmail(t); clearField('email'); }}
                            placeholder="you@example.com"
                            placeholderTextColor="#cbd5e1"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email && <Text style={s.error}>{errors.email}</Text>}

                        {/* Divider */}
                        <View style={s.sectionDivider}>
                            <View style={s.divLine} />
                            <Text style={s.divLabel}>Change Password</Text>
                            <View style={s.divLine} />
                        </View>

                        {/* Current Password */}
                        <Text style={s.label}>Current Password</Text>
                        <TextInput
                            style={[s.input, errors.current_password && s.inputError]}
                            value={currentPassword}
                            onChangeText={(t) => { setCurrentPassword(t); clearField('current_password'); }}
                            placeholder="••••••••"
                            placeholderTextColor="#cbd5e1"
                            secureTextEntry
                        />
                        {errors.current_password && <Text style={s.error}>{errors.current_password}</Text>}

                        {/* New + Confirm */}
                        <View style={s.row}>
                            <View style={s.halfField}>
                                <Text style={s.label}>New Password</Text>
                                <TextInput
                                    style={[s.input, errors.new_password && s.inputError]}
                                    value={newPassword}
                                    onChangeText={(t) => { setNewPassword(t); clearField('new_password'); }}
                                    placeholder="••••••••"
                                    placeholderTextColor="#cbd5e1"
                                    secureTextEntry
                                />
                                {errors.new_password && <Text style={s.error}>{errors.new_password}</Text>}
                            </View>

                            <View style={s.halfField}>
                                <Text style={s.label}>Confirm Password</Text>
                                <TextInput
                                    style={[s.input, errors.confirm_password && s.inputError]}
                                    value={confirmPassword}
                                    onChangeText={(t) => { setConfirmPassword(t); clearField('confirm_password'); }}
                                    placeholder="••••••••"
                                    placeholderTextColor="#cbd5e1"
                                    secureTextEntry
                                />
                                {errors.confirm_password && <Text style={s.error}>{errors.confirm_password}</Text>}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer buttons */}
                    <View style={s.footer}>
                        <Pressable
                            onPress={onClose}
                            style={({ pressed }) => [s.btnCancel, pressed && s.btnCancelPressed]}
                        >
                            <Text style={s.btnCancelText}>Cancel</Text>
                        </Pressable>

                        <Pressable
                            onPress={handleSave}
                            disabled={loading}
                            style={({ pressed }) => [s.btnSave, pressed && s.btnSavePressed, loading && s.btnDisabled]}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={s.btnSaveText}>Save Changes</Text>
                            }
                        </Pressable>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    sheet: {
        width: '100%',
        maxHeight: '90%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 22,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 3,
    },
    subtitle: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 17,
        maxWidth: '85%',
    },
    closeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // API error
    apiErrorBox: {
        backgroundColor: '#fef2f2',
        borderLeftWidth: 3,
        borderColor: '#ef4444',
        borderRadius: 8,
        padding: 12,
        marginBottom: 14,
    },
    apiErrorText: {
        fontSize: 13,
        color: '#b91c1c',
        lineHeight: 18,
    },

    // Layout
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    halfField: {
        flex: 1,
    },

    // Section divider
    sectionDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginVertical: 16,
    },
    divLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    divLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94a3b8',
        letterSpacing: 0.4,
    },

    // Labels & inputs
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 5,
        marginTop: 2,
    },
    input: {
        height: 44,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#0f172a',
        marginBottom: 4,
    },
    inputError: {
        borderColor: '#f87171',
        backgroundColor: '#fff5f5',
    },
    error: {
        fontSize: 11,
        color: '#ef4444',
        marginBottom: 6,
        paddingHorizontal: 2,
    },

    // Footer
    footer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderColor: '#f1f5f9',
    },
    btnCancel: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    btnCancelPressed: { backgroundColor: '#e2e8f0' },
    btnCancelText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    btnSave: {
        flex: 2,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    btnSavePressed: { backgroundColor: '#1e293b' },
    btnDisabled: { backgroundColor: '#94a3b8' },
    btnSaveText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
});