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

export default function SignUpScreen() {
    const router = useRouter();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        let newErrors: any = {};

        if (!form.firstName) newErrors.firstName = 'First name is required';
        if (!form.lastName) newErrors.lastName = 'Last name is required';

        if (!form.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!form.password) {
            newErrors.password = 'Password is required';
        } else if (form.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!form.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm password';
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);

        try {
            const { data } = await api.post('/register', {
                first_name: form.firstName,
                last_name: form.lastName,
                email: form.email,
                password: form.password,
                password_confirmation: form.confirmPassword
            });

            if (data.token) {
                await AsyncStorage.setItem('token', data.token);
            }

            Alert.alert('Success', 'Account created!', [
                { text: 'OK', onPress: () => router.push('/login') }
            ]);
        } catch (e: any) {
            const message =
                e?.response?.data?.message || 'Registration failed. Please try again.';
            Alert.alert('Error', message);
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

                    {/* Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Create account</Text>
                        <Text style={styles.cardSubtitle}>Join Dash Quiz</Text>

                        {/* First + Last Name Row */}
                        <View style={styles.nameRow}>
                            <View style={styles.nameField}>
                                <TextInput
                                    style={[styles.input, errors.firstName && styles.inputError]}
                                    placeholder="First name"
                                    placeholderTextColor="grey"
                                    onChangeText={(t) => setForm({ ...form, firstName: t })}
                                    value={form.firstName}
                                />
                                {errors.firstName && (
                                    <Text style={styles.error}>{errors.firstName}</Text>
                                )}
                            </View>
                            <View style={styles.nameField}>
                                <TextInput
                                    style={[styles.input, errors.lastName && styles.inputError]}
                                    placeholder="Last name"
                                    placeholderTextColor="grey"
                                    onChangeText={(t) => setForm({ ...form, lastName: t })}
                                    value={form.lastName}
                                />
                                {errors.lastName && (
                                    <Text style={styles.error}>{errors.lastName}</Text>
                                )}
                            </View>
                        </View>

                        {/* Email */}
                        <TextInput
                            style={[styles.input, styles.inputFull, errors.email && styles.inputError]}
                            placeholder="Email address"
                            placeholderTextColor="grey"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            onChangeText={(t) => setForm({ ...form, email: t })}
                            value={form.email}
                        />
                        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

                        {/* Password */}
                        <TextInput
                            style={[styles.input, styles.inputFull, errors.password && styles.inputError]}
                            placeholder="Password"
                            placeholderTextColor="grey"
                            secureTextEntry
                            onChangeText={(t) => setForm({ ...form, password: t })}
                            value={form.password}
                        />
                        {errors.password && <Text style={styles.error}>{errors.password}</Text>}

                        {/* Confirm Password */}
                        <TextInput
                            style={[
                                styles.input,
                                styles.inputFull,
                                errors.confirmPassword && styles.inputError
                            ]}
                            placeholder="Confirm password"
                            placeholderTextColor="grey"
                            secureTextEntry
                            onChangeText={(t) => setForm({ ...form, confirmPassword: t })}
                            value={form.confirmPassword}
                        />
                        {errors.confirmPassword && (
                            <Text style={styles.error}>{errors.confirmPassword}</Text>
                        )}

                        {/* Submit Button */}
                        <Pressable
                            onPress={handleRegister}
                            style={({ pressed }) => [
                                styles.submitBtn,
                                pressed && styles.submitBtnPressed
                            ]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitText}>Create account</Text>
                            )}
                        </Pressable>

                        {/* Login Link */}
                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <Pressable onPress={() => router.push('/login')}>
                                <Text style={styles.loginLink}>Login</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const INDIGO = '#4f46e5';
const INDIGO_DARK = '#4338ca';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },

    /* ── Header / Logo ── */
    header: {
        width: '100%',
        marginBottom: 28
    },

    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },

    logoIconWrap: {
        width: 32,
        height: 32,
        backgroundColor: INDIGO,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },

    // Simple lightning bolt approximation using a diagonal rectangle
    bolt: {
        width: 10,
        height: 18,
        backgroundColor: '#fff',
        borderRadius: 2,
        transform: [{ rotate: '15deg' }, { skewX: '-10deg' }]
    },

    logoText: {
        fontSize: 20,
        letterSpacing: -0.5
    },
    logoBold: {
        fontWeight: '700',
        color: '#0f172a'
    },
    logoAccent: {
        fontWeight: '700',
        color: INDIGO
    },

    /* ── Card ── */
    card: {
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3
    },

    cardTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4
    },

    cardSubtitle: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 20
    },

    /* ── Name row ── */
    nameRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 0
    },

    nameField: {
        flex: 1
    },

    /* ── Inputs ── */
    input: {
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#0f172a',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginBottom: 10
    },

    inputFull: {
        width: '100%'
    },

    inputError: {
        borderColor: '#f87171',
    },

    error: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: -6,
        marginBottom: 8,
        paddingHorizontal: 2
    },

    /* ── Button ── */
    submitBtn: {
        width: '100%',
        height: 48,
        backgroundColor: INDIGO,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    submitBtnPressed: {
        backgroundColor: INDIGO_DARK
    },

    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.2
    },

    /* ── Login link ── */
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16
    },

    loginText: {
        fontSize: 14,
        color: '#64748b'
    },

    loginLink: {
        fontSize: 14,
        color: INDIGO,
        fontWeight: '600'
    },
});