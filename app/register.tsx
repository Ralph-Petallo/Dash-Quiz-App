import { storage } from '@/services/storage';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet, Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

// Get screen width for fine-tuning if needed
const { width } = Dimensions.get('window');

export default function SignUpScreen() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleRegister = async () => {
        // Check if fields are empty
        if (!firstName || !lastName || !email || !password) {
            alert("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // Call the storage service with ACTUAL state values
        await storage.registerUser({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        });

        alert("Registration Successful!");
        router.push('/login');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <Image source={require('../assets/images/bolt.png')} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.title}>Sign up</Text>
                    </View>

                    <View style={styles.form}>
                        {/* 🔑 IMPORTANT: Added onChangeText to every input */}
                        <TextInput
                            style={styles.inputFull}
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName} // Updates state as you type
                            placeholderTextColor="#94a3b8"
                        />
                        <TextInput
                            style={styles.inputFull}
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholderTextColor="#94a3b8"
                        />
                        <TextInput
                            style={styles.inputFull}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            placeholderTextColor="#94a3b8"
                        />
                        <TextInput
                            style={styles.inputFull}
                            placeholder="Password"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                            placeholderTextColor="#94a3b8"
                        />
                        <TextInput
                            style={styles.inputFull}
                            placeholder="Confirm Password"
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholderTextColor="#94a3b8"
                        />

                        <Pressable onPress={handleRegister} style={({ pressed }) => [
                            styles.submitBtn,
                            { backgroundColor: pressed ? '#166534' : '#15803d' }
                        ]}>
                            <Text style={styles.submitText}>Submit</Text>
                        </Pressable>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/login" asChild>
                                <Pressable><Text style={styles.linkText}>Login</Text></Pressable>
                            </Link>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: width * 0.06,
        paddingTop: 20,
        paddingBottom: 30,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 25,
    },
    logo: {
        width: 60, // Smaller logo for 360px screen
        height: 60,
        marginBottom: 8,
    },
    title: {
        fontSize: 26, // Scaled down from 32
        fontWeight: '800',
        color: '#1e293b',
    },
    form: {
        width: '100%',
        gap: 12, // Consistent vertical spacing
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },
    inputFull: {
        width: '100%',
        height: 48, // Reduced height for smaller screens
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 15,
        backgroundColor: '#fff',
    },
    inputHalf: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        fontSize: 15,
        backgroundColor: '#fff',
    },
    submitBtn: {
        width: '100%',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        // Subtle shadow
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    submitText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    footerText: {
        color: '#64748b',
        fontSize: 13,
    },
    linkText: {
        color: '#4f46e5',
        fontWeight: '700',
        fontSize: 13,
        textDecorationLine: 'underline',
    },
});