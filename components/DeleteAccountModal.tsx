import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { deleteAccount } from '../store/profileStore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
    visible: boolean;
    onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeleteAccountModal({ visible, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async () => {
        setError(null);
        setLoading(true);
        try {
            await deleteAccount();
            router.replace('/login');
        } catch (err: any) {
            setError(err?.response?.data?.message ?? 'Failed to delete account. Please try again.');
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
            <View style={s.overlay}>
                <View style={s.sheet}>
                    {/* Warning icon */}
                    <View style={s.iconWrap}>
                        <Text style={s.iconText}>⚠</Text>
                    </View>

                    {/* Text */}
                    <Text style={s.title}>Delete Account</Text>
                    <Text style={s.body}>
                        This action is permanent and cannot be undone. All your data will be
                        wiped immediately.
                    </Text>

                    {/* API error */}
                    {error && (
                        <View style={s.errorBox}>
                            <Text style={s.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Buttons */}
                    <View style={s.btnRow}>
                        <Pressable
                            onPress={onClose}
                            disabled={loading}
                            style={({ pressed }) => [s.btnKeep, pressed && s.btnKeepPressed]}
                        >
                            <Text style={s.btnKeepText}>Keep Account</Text>
                        </Pressable>

                        <Pressable
                            onPress={handleDelete}
                            disabled={loading}
                            style={({ pressed }) => [s.btnDelete, pressed && s.btnDeletePressed]}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={s.btnDeleteText}>Delete Everything</Text>
                            }
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 28,
    },
    sheet: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },

    // Icon
    iconWrap: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    iconText: {
        fontSize: 24,
        color: '#ef4444',
    },

    // Text
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0f172a',
        marginBottom: 8,
        textAlign: 'center',
    },
    body: {
        fontSize: 13,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },

    // Error
    errorBox: {
        width: '100%',
        backgroundColor: '#fef2f2',
        borderLeftWidth: 3,
        borderColor: '#ef4444',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 12,
        color: '#b91c1c',
        lineHeight: 17,
    },

    // Buttons
    btnRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    btnKeep: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    btnKeepPressed: { backgroundColor: '#f8fafc' },
    btnKeepText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    btnDelete: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ef4444',
    },
    btnDeletePressed: { backgroundColor: '#dc2626' },
    btnDeleteText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
});