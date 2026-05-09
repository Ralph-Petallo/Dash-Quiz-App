import { COLORS } from "@/constants/colors";
import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NotFound() {
    return (
        <View style={styles.container}>
            <Text style={styles.code}>404</Text>
            <Text style={styles.title}>Page Not Found</Text>
            <Text style={styles.message}>
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </Text>

            <Link href="/" asChild>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Go to Home</Text>
                </TouchableOpacity>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    code: {
        fontSize: 72,
        fontWeight: "900",
        color: COLORS.primary,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: COLORS.text,
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginBottom: 30,
    },
    button: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
