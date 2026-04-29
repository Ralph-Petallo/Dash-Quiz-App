import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Great for the back arrow!

export default function ForgotPasswordScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Top Navigation / Back Button */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.contentContainer}>
        
        {/* Logo and Text */}
        <View style={styles.headerContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoIcon}>🔒</Text> 
          </View>

          <Text style={styles.title}>Forgot password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        {/* Form Input */}
        <View style={styles.formContainer}>
          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.resetButton} activeOpacity={0.8}>
            <Text style={styles.resetButtonText}>Send reset link</Text>
          </TouchableOpacity>

          {/* Back to Login Link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Remembered your password? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Back to login</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center', // Centers the content vertically in the available space
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoPlaceholder: {
    marginBottom: 20,
    // Add styles here if you use an actual <Image />
  },
  logoIcon: {
    fontSize: 50, // Just for the emoji placeholder
  },
  /* Uncomment and adjust this if using an actual image
  logoImage: {
    width: 60,
    height: 80,
  }, 
  */
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    fontStyle: 'italic', // Matching the Figma design
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 14,
    color: '#000',
  },
  resetButton: {
    backgroundColor: '#6366F1', // Purple color from Figma
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 11,
    color: '#666666',
  },
  loginLink: {
    fontSize: 11,
    color: '#8A2BE2', // Match the purple theme
    textDecorationLine: 'underline',
  },
  purpleFooter: {
    backgroundColor: '#6366F1',
    padding: 10,
    alignItems: 'center',
  },
  footerBannerText: {
    color: '#FFFFFF',
    fontSize: 10,
  }
});