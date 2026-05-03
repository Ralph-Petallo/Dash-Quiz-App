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
import { SafeAreaView } from 'react-native-safe-area-context';

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
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* ── Hero Text ── */}
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
                        <Text style={styles.cardTitle}>Welcome back!</Text>
                        <Text style={styles.cardSubtitle}>Sign in to your account</Text>

                        {/* Email */}
                        <Text style={styles.label}>Email address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="@example.com"
                            placeholderTextColor="#94a3b8"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                        />

                        {/* Password */}
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••"
                            placeholderTextColor="#94a3b8"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />

                        {/* Login Button */}
                        <Pressable
                            onPress={handleLogin}
                            style={({ pressed }) => [
                                styles.loginBtn,
                                pressed && styles.loginBtnPressed
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginText}>Login</Text>
                            )}
                        </Pressable>

                        {/* Forgot Password */}
                        <Pressable style={styles.forgotWrap}>
                            <Text style={styles.forgotText}>Forgot password?</Text>
                        </Pressable>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.line} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.line} />
                        </View>

                        {/* Create Account Button */}
                        <Pressable
                            onPress={() => router.push('/register')}
                            style={({ pressed }) => [
                                styles.registerBtn,
                                pressed && styles.registerBtnPressed
                            ]}
                        >
                            <Text style={styles.registerText}>Create account</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 22,
        paddingTop: 32,
        paddingBottom: 40
    },

    badgeBox: {
        display: "flex",
        justifyContent: "center",
        marginHorizontal: "auto",
    },

    /* ── Badge ── */
    badge: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eef2ff',
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 6,
        marginBottom: 22
    },

    badgeStar: {
        color: INDIGO,
        fontSize: 11,
        fontWeight: '700'
    },

    badgeText: {
        color: INDIGO,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.2
    },

    /* ── Hero ── */
    heroText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#0f172a',
        textAlign: 'center',
        lineHeight: 40,
        marginBottom: 14,
        letterSpacing: -0.5
    },

    heroAccent: {
        color: INDIGO,
        fontWeight: '800'
    },

    heroSub: {
        fontSize: 14,
        textAlign: 'center',
        color: '#64748b',
        lineHeight: 22,
        marginBottom: 28
    },

    /* ── Card ── */
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 22,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3
    },

    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4
    },

    cardSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 20
    },

    /* ── Labels & Inputs ── */
    label: {
        fontSize: 13,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 6
    },

    input: {
        height: 48,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#0f172a',
        marginBottom: 16
    },

    /* ── Login Button ── */
    loginBtn: {
        height: 50,
        backgroundColor: INDIGO,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
        marginBottom: 4
    },

    loginBtnPressed: {
        backgroundColor: INDIGO_DARK
    },

    loginText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2
    },

    /* ── Forgot ── */
    forgotWrap: {
        alignItems: 'center',
        paddingVertical: 12
    },

    forgotText: {
        color: INDIGO,
        fontSize: 13,
        fontWeight: '500'
    },

    /* ── Divider ── */
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0'
    },

    dividerText: {
        marginHorizontal: 12,
        color: '#94a3b8',
        fontSize: 13
    },

    /* ── Create Account Button ── */
    registerBtn: {
        height: 50,
        backgroundColor: GREEN,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },

    registerBtnPressed: {
        backgroundColor: GREEN_DARK
    },

    registerText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.2
    }
});