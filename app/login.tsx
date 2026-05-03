import useAuth from '@/hooks/useAuth';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

const INDIGO = '#4f46e5';
const INDIGO_DARK = '#4338ca';
const GREEN = '#22c55e';
const GREEN_DARK = '#16a34a';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { fetchUser } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

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
            console.log(error?.response?.data || error.message);
            Alert.alert(
                'Login Failed',
                error?.response?.data?.message || 'Invalid email or password'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        // ✅ No SafeAreaView — parent _layout.tsx already wraps everything
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
                        style={styles.input}
                        placeholder="@example.com"
                        placeholderTextColor="grey"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••"
                        placeholderTextColor="grey"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <Pressable
                        onPress={handleLogin}
                        style={({ pressed }) => [styles.loginBtn, pressed && styles.loginBtnPressed]}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginText}>Login</Text>
                        )}
                    </Pressable>

                    <Pressable style={styles.forgotWrap}>
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
        lineHeight: 38,
        textAlign:"center",
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    heroAccent: {
        color: INDIGO,
        fontWeight: '800',
    },
    heroSub: {
        fontSize: 13,
        textAlign:'center',
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
        textAlign:'center',
        fontSize: 19,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 3,
    },
    cardSubtitle: {
        textAlign:"center",
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
        height: 48,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#0f172a',
        marginBottom: 14,
    },

    /* ── Login Button ── */
    loginBtn: {
        height: 48,
        backgroundColor: INDIGO,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginBtnPressed: {
        backgroundColor: INDIGO_DARK,
    },
    loginText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
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
        fontWeight: '500',
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
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#94a3b8',
        fontSize: 13,
    },

    /* ── Create Account Button ── */
    registerBtn: {
        height: 48,
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
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});