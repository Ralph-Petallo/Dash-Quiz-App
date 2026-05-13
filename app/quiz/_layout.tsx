import { COLORS } from "@/constants/colors";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function QuizLayout() {
    const router = useRouter();

    return (
        <>
            {/* CUSTOM HEADER */}
            <View style={styles.navbar}>
                <View style={styles.left}>
                    <TouchableOpacity
                        onPress={() => router.replace("../user-folder/")}
                        style={styles.backBtn}
                    >
                        <Text style={{ fontSize: 18 }}>←</Text>
                    </TouchableOpacity>

                    <View>
                        <Text style={styles.title}>Quiz</Text>
                        <Text style={styles.subtitle}>Computer Systems Servicing</Text>
                    </View>
                </View>
            </View>


            {/* SCREENS */}
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            />
        </>
    );
}

const styles = StyleSheet.create({
    navbar: {
        backgroundColor: COLORS.bgCard,
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    left: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    backBtn: {
        backgroundColor: COLORS.bgLight,
        padding: 8,
        borderRadius: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.text,
    },
    subtitle: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    right: {
        flexDirection: "row",
    },
    stat: {
        alignItems: "flex-end",
    },
    label: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },
    value: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.text,
        marginTop: 2,
    },
    progressTrack: {
        height: 3,
        backgroundColor: COLORS.border,
    },
    progressFill: {
        height: 3,
        backgroundColor: COLORS.primary,
    },
});