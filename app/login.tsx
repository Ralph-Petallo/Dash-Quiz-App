import useAuth from '@/hooks/useAuth';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

const INDIGO = '#6366f1';
const INDIGO_DARK = '#4f46e5';
const GREEN = '#22c55e';
const GREEN_DARK = '#16a34a';
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [credentialError, setCredentialError] = useState<string | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [lockSeconds, setLockSeconds] = useState(0);
    const lockTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    const router = useRouter();
    const { fetchUser } = useAuth();

    const startLockout = () => {
        setLockSeconds(LOCKOUT_SECONDS);
        lockTimer.current = setInterval(() => {
            setLockSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(lockTimer.current!);
                    lockTimer.current = null;
                    setAttempts(0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const validate = () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email) {
            newErrors.email = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (!password) {
            newErrors.password = 'Password is required.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (lockSeconds > 0 || !validate()) return;

        setCredentialError(null);
        setLoading(true);

        try {
            const { data } = await api.post('/mobile/login', { email, password });

            if (data?.token) {
                await AsyncStorage.setItem('token', data.token);
                await fetchUser();
                router.push('/user-folder');
            } else {
                Alert.alert('Login Failed', 'No token received');
            }
        } catch (error: any) {

            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                startLockout();
                setCredentialError(`Too many failed attempts. Please wait ${LOCKOUT_SECONDS} seconds.`);
            } else {
                setCredentialError('Invalid email or password. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const isLocked = lockSeconds > 0;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.flex}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Badge ── */}
                <View style={styles.badgeWrap}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeStar}>✦ </Text>
                        <Text style={styles.badgeText}>SNSU Capstone Project</Text>
                    </View>
                </View>

                {/* ── Hero ── */}
                <Text style={styles.heroText}>
                    {'Learning is '}
                    <Text style={styles.heroAccent}>better{'\n'}</Text>
                    {'when we do it\n'}
                    <Text style={styles.heroAccent}>together</Text>
                </Text>

                <Text style={styles.heroSub}>
                    Practice, learn, and improve your skills with Dash Quiz.
                </Text>

                {/* ── Card ── */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>WELCOME!</Text>
                    <Text style={styles.cardSubtitle}>Sign in to your account</Text>

                    <Text style={styles.label}>Email address</Text>
                    <TextInput
                        style={[
                            styles.input,
                            (errors.email) ? styles.inputError : null,
                        ]}
                        placeholder="@example.com"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setCredentialError(null);
                            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                    />
                    {errors.email && <Text style={styles.error}>{errors.email}</Text>}

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={[
                            styles.input,
                            (errors.password) ? styles.inputError : null,
                        ]}
                        placeholder="••••••"
                        placeholderTextColor="grey"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setCredentialError(null);
                            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                    />
                    {errors.password && <Text style={styles.error}>{errors.password}</Text>}

                    {/* ── Credential / lockout error banner ── */}
                    {credentialError && (
                        <View style={styles.credentialErrorBox}>
                            <Text style={styles.credentialErrorText}>
                                {credentialError}
                            </Text>
                        </View>
                    )}

                    <Pressable
                        onPress={handleLogin}
                        disabled={loading || isLocked}
                        style={({ pressed }) => [
                            styles.loginBtn, loading && styles.submitting,
                            isLocked && styles.loginBtnLocked,
                            pressed && !isLocked && styles.loginBtnPressed,
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : isLocked ? (
                            <Text style={styles.loginText}>Login</Text>
                        ) : (
                            <Text style={styles.loginText}>Login</Text>
                        )}
                    </Pressable>

                    <Pressable style={styles.forgotWrap} onPress={() => router.push('/forgot')}>
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </Pressable>

                    <View style={styles.dividerRow}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>or</Text>
                        <View style={styles.line} />
                    </View>

                    <Pressable
                        onPress={() => router.push('/register')}
                        style={({ pressed }) => [styles.registerBtn, pressed && styles.registerBtnPressed]}
                    >
                        <Text style={styles.registerText}>Create account</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },

    scrollContent: {
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },

    /* ── Badge ── */
    badgeWrap: {
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
    },
    submitting: { backgroundColor: '#aaa' },
    badgeStar: {
        color: INDIGO,
        fontSize: 11,
        fontWeight: '700',
    },
    badgeText: {
        color: INDIGO,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.2,
    },

    /* ── Hero ── */
    heroText: {
        fontSize: 30,
        fontWeight: '800',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    heroAccent: {
        color: INDIGO,
        fontWeight: '800',
    },
    heroSub: {
        fontSize: 13,
        textAlign: 'center',
        color: '#64748b',
        lineHeight: 20,
        marginBottom: 20,
    },

    /* ── Card ── */
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    cardTitle: {
        textAlign: 'center',
        fontSize: 19,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 3,
    },
    cardSubtitle: {
        textAlign: 'center',
        fontSize: 13,
        color: '#64748b',
        marginBottom: 16,
    },

    /* ── Labels & Inputs ── */
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 5,
    },
    input: {
        paddingVertical:14,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 14,
        color: '#0f172a',
        marginBottom: 4,
    },
    inputError: {
        borderColor: '#f87171',
    },
    error: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: -6,
        marginBottom: 8,
        paddingHorizontal: 2,
    },

    /* ── Credential error banner ── */
    credentialErrorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderLeftWidth: 3,
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginVertical: 12,
        gap: 8,
    },
    credentialErrorText: {
        flex: 1,
        fontSize: 13,
        color: '#b91c1c',
        lineHeight: 18,
    },

    /* ── Login Button ── */
    loginBtn: {
        paddingVertical:12,
        backgroundColor: INDIGO_DARK,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    loginBtnPressed: {
        backgroundColor: INDIGO_DARK,
    },
    loginBtnLocked: {
        backgroundColor: '#94a3b8',
    },
    loginText: {
        color: '#fff',
        fontSize: 15,
        letterSpacing: 0.2,
    },

    /* ── Forgot ── */
    forgotWrap: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    forgotText: {
        color: INDIGO,
        fontSize: 13,
    },

    /* ── Divider ── */
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#d1d5db',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#d1d5db',
        fontSize: 13,
    },

    /* ── Create Account Button ── */
    registerBtn: {
        paddingVertical: 12,
        backgroundColor: GREEN_DARK,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    registerBtnPressed: {
        backgroundColor: GREEN,
    },
    registerText: {
        color: '#fff',
        fontSize:14,
        letterSpacing: 0.2,
    },
});