import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignUpScreen() {
    const router = useRouter();
    const [form, setForm] = useState(
        { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }
    );

    const handleRegister = async () => {
        const { firstName, lastName, email, password, confirmPassword } = form;

        if (!firstName || !lastName || !email || !password) {
            Alert.alert("Error", "Required fields missing");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        try {
            const { data } = await api.post('/register', {
                first_name: firstName,
                last_name: lastName,
                email,
                password,
                password_confirmation: confirmPassword
            });

            // OPTIONAL: only if backend returns token
            if (data.token) {
                await AsyncStorage.setItem('token', data.token);
            }

            Alert.alert("Success", "Account created!", [
                { text: "OK", onPress: () => router.push('/login') }
            ]);

        } catch (e: any) {
            console.log(e?.response?.data || e.message);
            Alert.alert("Error", "Could not register user");
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Image source={require('../assets/images/bolt.png')} style={styles.logo} />
                    <Text style={styles.title}>Sign up</Text>

                    <TextInput style={styles.input} placeholder="First Name" onChangeText={(t) => setForm({ ...form, firstName: t })} />
                    <TextInput style={styles.input} placeholder="Last Name" onChangeText={(t) => setForm({ ...form, lastName: t })} />
                    <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={(t) => setForm({ ...form, email: t })} />
                    <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(t) => setForm({ ...form, password: t })} />
                    <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry onChangeText={(t) => setForm({ ...form, confirmPassword: t })} />

                    <Pressable onPress={handleRegister} style={styles.submitBtn}>
                        <Text style={styles.submitText}>Submit</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { padding: 25, alignItems: 'center' },
    logo: { width: 60, height: 60, marginBottom: 10 },
    title: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
    input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 },
    submitBtn: { width: '100%', height: 50, backgroundColor: '#15803d', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});