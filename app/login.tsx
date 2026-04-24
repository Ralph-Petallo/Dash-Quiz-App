import { Link, useRouter } from 'expo-router';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const router = useRouter();
const handleLogin = () => {
    // Implement your login logic here (e.g., API call, validation)
    console.log("Login button pressed");
    router.push('/user-folder')
}
export default function LoginPage() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.boxContainer}>
                <View style={{ marginBottom: 20 }}>
                    <Image source={require('../assets/images/bolt.png')} style={styles.logo} />
                </View>
                <Text style={styles.title}>Dash<Text style={styles.quiz}>Quiz</Text></Text>
                <TextInput
                    placeholder="Email"
                    placeholderTextColor="#999"
                    style={styles.input}
                />
                <TextInput
                    placeholder="Password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    style={styles.input}
                />
                <Pressable onPress={handleLogin} style={({ pressed }) => [
                    styles.loginBtn,
                    { backgroundColor: pressed ? '#6366F1' : '#4f46e5' } // Change color on hover
                ]}>
                    <Text style={styles.loginText}>Login</Text>
                </Pressable>

                <Text style={styles.linkText}>
                    Forgot your password? {''}
                    <Link href="/forgot" style={{ color: '#4f46e5', fontWeight: '600' }} asChild>
                        <Text>
                            click here
                        </Text>
                    </Link>
                </Text>


                {/* Divider */}
                <View style={styles.dividerContainer}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.line} />
                </View>
                <Pressable
                    onPress={() => {
                        router.push('/register');
                    }}
                    style={({ pressed }) => [
                        styles.registerBtn,
                        { backgroundColor: pressed ? '#176d1e' : '#2b8533' } // Change color on press
                    ]}>
                    <Text style={styles.registerText}>Register</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f6f8",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },

    boxContainer: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 16,

        // modern shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },

    title: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 15,
        color: "#111",
    },

    logo: {
        width: 42,
        height: 42,
        alignSelf: 'center',
    },

    quiz: {
        color: "#4f46e5"
    },

    input: {
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
        fontSize: 14,
    },

    loginBtn: {
        backgroundColor: "white", // modern indigo
        padding: 14,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 15,
    },

    loginText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
        fontSize: 15,
    },

    linkText: {
        textAlign: "center",
        fontSize: 13,
        color: "#666",
        marginBottom: 10,
    },

    registerBtn: {
        borderWidth: 1,
        backgroundColor: "#4f46e5",
        padding: 12,
        borderRadius: 10,
    },

    registerText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "600",
        borderWidth: 0,
        fontSize: 15,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#ddd",
    },

    dividerText: {
        marginHorizontal: 10,
        color: "#888",
        fontSize: 13,
    },
});
