import useAuth from '@/hooks/useAuth';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();
    const { fetchUser } = useAuth(); // ✅ ADD THIS

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            const { data } = await api.post('/mobile/login', {
                email,
                password
            });

            if (data?.token) {
                await AsyncStorage.setItem('token', data.token);
                await fetchUser();
                router.push('/user-folder'); // or your actual drawer route
            } else {
                Alert.alert('Login Failed', 'No token received');
            }

        } catch (error: any) {
            console.log(error?.response?.data || error.message);

            Alert.alert(
                'Login Failed',
                error?.response?.data?.message || 'Invalid email or password'
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.boxContainer}>
                <Image source={require('../assets/images/bolt.png')} style={styles.logo} />
                <Text style={styles.title}>Dash<Text style={styles.quiz}>Quiz</Text></Text>

                <TextInput
                    placeholder="Email"
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <TextInput
                    placeholder="Password"
                    secureTextEntry
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                />

                <Pressable onPress={handleLogin} style={styles.loginBtn}>
                    <Text style={styles.loginText}>Login</Text>
                </Pressable>

                <View style={styles.dividerContainer}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.line} />
                </View>

                <Pressable onPress={() => router.push('/register')} style={styles.registerBtn}>
                    <Text style={styles.registerText}>Create Account</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f4f6f8", justifyContent: "center", alignItems: "center", padding: 20 },
    boxContainer: { width: "100%", maxWidth: 400, backgroundColor: "#fff", padding: 25, borderRadius: 16, elevation: 5 },
    title: { fontSize: 26, fontWeight: "700", textAlign: "center", marginBottom: 20 },
    quiz: { color: "#4f46e5" },
    logo: { width: 50, height: 50, alignSelf: 'center', marginBottom: 10 },
    input: { backgroundColor: "#f9fafb", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 14, marginBottom: 12 },
    loginBtn: { backgroundColor: "#4f46e5", padding: 14, borderRadius: 10, marginTop: 10 },
    loginText: { color: "#fff", textAlign: "center", fontWeight: "600" },
    dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
    line: { flex: 1, height: 1, backgroundColor: "#ddd" },
    dividerText: { marginHorizontal: 10, color: "#888" },
    registerBtn: { borderWidth: 1, borderColor: "#2b8533", padding: 12, borderRadius: 10, backgroundColor: 'green' },
    registerText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});