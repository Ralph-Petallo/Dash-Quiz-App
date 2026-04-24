import { Link } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet, Text,
    TextInput,
    View
} from 'react-native';

// Get screen width for fine-tuning if needed
const { width } = Dimensions.get('window');

export default function SignUpScreen() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section */}
                    <View style={styles.header}>
                        <Image
                            source={require('../assets/images/bolt.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Sign up</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        {/* First & Last Name Row */}
                        <TextInput
                            style={styles.inputFull}
                            placeholder="First Name"
                            placeholderTextColor="#94a3b8"
                        />
                        <TextInput
                            style={styles.inputFull}
                            placeholder="Last Name"
                            placeholderTextColor="#94a3b8"
                        />

                        <TextInput
                            style={styles.inputFull}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholderTextColor="#94a3b8"
                        />
                        <TextInput
                            style={styles.inputFull}
                            placeholder="Password"
                            secureTextEntry
                            placeholderTextColor="#94a3b8"
                        />
                        <TextInput
                            style={styles.inputFull}
                            placeholder="Confirm Password"
                            secureTextEntry
                            placeholderTextColor="#94a3b8"
                        />

                        {/* Submit Button */}
                        <Pressable
                            style={({ pressed }) => [
                                styles.submitBtn,
                                { backgroundColor: pressed ? '#166534' : '#15803d' }
                            ]}
                        >
                            <Text style={styles.submitText}>Submit</Text>
                        </Pressable>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Link href="/login" asChild>
                                <Pressable>
                                    <Text style={styles.linkText}>Login</Text>
                                </Pressable>
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