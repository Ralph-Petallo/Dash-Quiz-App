import { COLORS } from "@/constants/colors";
import { AuthProvider } from "@/store/authStore";
import { DataProvider } from "@/store/dataStore";
import { Slot, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function LayoutContent() {
  const pathname = usePathname();
  const isUserSection = pathname?.includes("user-folder");

  return (
    <SafeAreaView style={styles.container}>
      <Slot />

      {!isUserSection && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Dash Quiz • SNSU Capstone Project
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DataProvider>
        <LayoutContent />
      </DataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    fontSize: 8,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.primary,
  },
  footerText: {
    color: "#fff",
    textAlign: "center",
    padding: 10,
    fontSize: 10,
  },
});