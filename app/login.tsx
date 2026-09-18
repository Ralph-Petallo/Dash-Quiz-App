import useAuth from '@/hooks/useAuth';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const BLACK = '#0A0A0A';
const WHITE = '#FFFFFF';
const MUTED = '#737373';
const BORDER = '#D4D4D4';
const RED = '#DC2626';

const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        email?: string;
        password?: string;
    }>({});
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
        const newErrors: {
            email?: string;
            password?: string;
        } = {};

        if (!email.trim()) {
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
            const { data } = await api.post('/mobile/login', {
                email,
                password,
            });

            if (data?.token) {
                await AsyncStorage.setItem('token', data.token);
                await fetchUser();
                router.push('/user-folder');
            } else {
                setCredentialError('Unable to sign in. Please try again.');
            }
        } catch (error: any) {
            console.error(error);

            const newAttempts = attempts + 1;
            setAttempts(newAttempts);

            if (newAttempts >= MAX_ATTEMPTS) {
                startLockout();
                setCredentialError(
                    `Too many failed attempts. Please wait ${LOCKOUT_SECONDS} seconds.`
                );
            } else {
                setCredentialError(
                    'Invalid email or password. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const isLocked = lockSeconds > 0;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.screen}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.page}>

                    {/* Top Branding */}
                    <View style={styles.topBar}>
                        <Text style={styles.logo}>DASH QUIZ</Text>

                        <View style={styles.projectTag}>
                            <View style={styles.dot} />
                            <Text style={styles.projectText}>
                                SNSU CAPSTONE PROJECT
                            </Text>
                        </View>
                    </View>

                    {/* Main */}
                    <View style={styles.main}>

                        <View style={styles.intro}>
                            <Text style={styles.eyebrow}>WELCOME BACK</Text>

                            <Text style={styles.heading}>
                                Learning is{'\n'}
                                <Text style={styles.headingAccent}>
                                    better together.
                                </Text>
                            </Text>

                            <Text style={styles.description}>
                                Practice, learn, and improve your skills
                                with Dash Quiz.
                            </Text>
                        </View>

                        {/* Plain Form */}
                        <View style={styles.form}>

                            {/* Email */}
                            <View style={styles.field}>
                                <Text style={styles.label}>
                                    EMAIL ADDRESS
                                </Text>

                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.email && styles.inputError,
                                    ]}
                                    placeholder="you@example.com"
                                    placeholderTextColor="#A3A3A3"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    keyboardType="email-address"
                                    value={email}
                                    editable={!isLocked}
                                    onChangeText={(text) => {
                                        setEmail(text);
                                        setCredentialError(null);

                                        if (errors.email) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                email: undefined,
                                            }));
                                        }
                                    }}
                                />

                                {errors.email && (
                                    <Text style={styles.error}>
                                        {errors.email}
                                    </Text>
                                )}
                            </View>

                            {/* Password */}
                            <View style={styles.field}>
                                <View style={styles.passwordLabelRow}>
                                    <Text style={styles.label}>
                                        PASSWORD
                                    </Text>

                                    <Pressable
                                        onPress={() => router.push('/forgot')}
                                    >
                                        <Text style={styles.forgot}>
                                            FORGOT PASSWORD?
                                        </Text>
                                    </Pressable>
                                </View>

                                <TextInput
                                    style={[
                                        styles.input,
                                        errors.password && styles.inputError,
                                    ]}
                                    placeholder="••••••••"
                                    placeholderTextColor="#A3A3A3"
                                    secureTextEntry
                                    value={password}
                                    editable={!isLocked}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        setCredentialError(null);

                                        if (errors.password) {
                                            setErrors((prev) => ({
                                                ...prev,
                                                password: undefined,
                                            }));
                                        }
                                    }}
                                />

                                {errors.password && (
                                    <Text style={styles.error}>
                                        {errors.password}
                                    </Text>
                                )}
                            </View>

                            {/* Credential Error */}
                            {credentialError && (
                                <View style={styles.errorBanner}>
                                    <View style={styles.errorLine} />

                                    <Text style={styles.errorBannerText}>
                                        {credentialError}
                                    </Text>
                                </View>
                            )}

                            {/* Login */}
                            <Pressable
                                onPress={handleLogin}
                                disabled={loading || isLocked}
                                style={({ pressed }) => [
                                    styles.loginButton,
                                    pressed &&
                                    !loading &&
                                    !isLocked &&
                                    styles.loginPressed,
                                    isLocked && styles.loginLocked,
                                ]}
                            >
                                {loading ? (
                                    <ActivityIndicator color={WHITE} />
                                ) : (
                                    <View style={styles.loginContent}>
                                        <Text style={styles.loginText}>
                                            {isLocked
                                                ? `TRY AGAIN IN ${lockSeconds}S`
                                                : 'SIGN IN'}
                                        </Text>

                                        {!isLocked && (
                                            <Text style={styles.arrow}>
                                                →
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </Pressable>

                            {/* Register */}
                            <View style={styles.registerRow}>
                                <Text style={styles.registerPrompt}>
                                    Dont have an account?
                                </Text>

                                <Pressable
                                    onPress={() =>
                                        router.push('/register')
                                    }
                                >
                                    <Text style={styles.registerLink}>
                                        Create one
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            © {new Date().getFullYear()} DASH QUIZ
                        </Text>

                        <View style={styles.footerLine} />

                        <Text style={styles.footerText}>
                            LEARN · PRACTICE · IMPROVE
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: WHITE,
    },

    scroll: {
        flexGrow: 1,
    },

    page: {
        flex: 1,
        minHeight: '100%',
        paddingHorizontal: 28,
        paddingTop: Platform.OS === 'ios' ? 58 : 38,
        paddingBottom: 28,
    },

    /* ─────────────────────────
       HEADER
    ───────────────────────── */

    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },

    logo: {
        fontSize: 15,
        fontWeight: '900',
        letterSpacing: 2.5,
        color: BLACK,
    },

    projectTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: BLACK,
    },

    projectText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: MUTED,
    },

    /* ─────────────────────────
       MAIN
    ───────────────────────── */

    main: {
        width: '100%',
        maxWidth: 560,
        alignSelf: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 50,
    },

    intro: {
        marginBottom: 42,
    },

    eyebrow: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2.5,
        color: MUTED,
        marginBottom: 18,
    },

    heading: {
        fontSize: 42,
        lineHeight: 46,
        fontWeight: '900',
        letterSpacing: -1.8,
        color: BLACK,
    },

    headingAccent: {
        color: BLACK,
        fontWeight: '900',
    },

    description: {
        marginTop: 20,
        maxWidth: 390,
        fontSize: 14,
        lineHeight: 21,
        color: MUTED,
    },

    /* ─────────────────────────
       FORM
    ───────────────────────── */

    form: {
        width: '100%',
    },

    field: {
        marginBottom: 24,
    },

    label: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.5,
        color: BLACK,
        marginBottom: 9,
    },

    passwordLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    forgot: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
        color: MUTED,
    },

    input: {
        height: 50,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        borderRadius: 0,
        paddingHorizontal: 0,
        paddingVertical: 10,
        fontSize: 16,
        color: BLACK,
        backgroundColor: 'transparent',
    },

    inputError: {
        borderBottomColor: RED,
    },

    error: {
        fontSize: 11,
        color: RED,
        marginTop: 7,
    },

    /* ─────────────────────────
       ERROR
    ───────────────────────── */

    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: -4,
        marginBottom: 20,
    },

    errorLine: {
        width: 3,
        height: 28,
        backgroundColor: RED,
        marginRight: 10,
    },

    errorBannerText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 17,
        color: RED,
    },

    /* ─────────────────────────
       BUTTON
    ───────────────────────── */

    loginButton: {
        height: 54,
        backgroundColor: BLACK,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },

    loginPressed: {
        opacity: 0.78,
    },

    loginLocked: {
        backgroundColor: '#A3A3A3',
    },

    loginContent: {
        width: '100%',
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    loginText: {
        color: WHITE,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.8,
    },

    arrow: {
        color: WHITE,
        fontSize: 22,
        fontWeight: '300',
    },

    /* ─────────────────────────
       REGISTER
    ───────────────────────── */

    registerRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 26,
        gap: 5,
    },

    registerPrompt: {
        fontSize: 12,
        color: MUTED,
    },

    registerLink: {
        fontSize: 12,
        fontWeight: '800',
        color: BLACK,
        textDecorationLine: 'underline',
    },

    /* ─────────────────────────
       FOOTER
    ───────────────────────── */

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        width: '100%',
    },

    footerText: {
        fontSize: 8,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#A3A3A3',
    },

    footerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E5E5',
    },
});