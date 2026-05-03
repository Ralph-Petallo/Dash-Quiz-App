import { COLORS } from "@/constants/colors";
import { AuthProvider } from "@/store/authStore";
import { DataProvider } from "@/store/dataStore";
import { Slot, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Header() {
  return (
    <View style={styles.header}>
      {/* Logo */}
      <View style={styles.logoRow}>
        <View style={styles.logoIconWrap}>
          <View style={styles.boltTop} />
          <View style={styles.boltBottom} />
        </View>
        <Text style={styles.logoText}>
          Dash<Text style={styles.logoAccent}>Quiz</Text>
        </Text>
      </View>

      {/* Assessment Portal badge */}
      <View style={styles.portalBadge}>
        <Text style={styles.portalText}>Assessment Portal</Text>
      </View>
    </View>
  );
}

function LayoutContent() {
  const pathname = usePathname();
  const isUserSection = pathname?.includes("user-folder");

  return (
    <SafeAreaView style={styles.container}>
      {!isUserSection && <Header />}

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

const INDIGO = "#4f46e5";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  /* ── Header ── */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoIconWrap: {
    width: 30,
    height: 30,
    backgroundColor: INDIGO,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  /* Simple lightning bolt: two offset rectangles */
  boltTop: {
    position: "absolute",
    top: 3,
    left: 9,
    width: 8,
    height: 12,
    backgroundColor: "#fff",
    borderRadius: 2,
    transform: [{ rotate: "20deg" }, { skewX: "-12deg" }],
  },

  boltBottom: {
    position: "absolute",
    bottom: 3,
    left: 13,
    width: 8,
    height: 12,
    backgroundColor: "#fff",
    borderRadius: 2,
    transform: [{ rotate: "20deg" }, { skewX: "-12deg" }],
  },

  logoText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.3,
  },

  logoAccent: {
    color: INDIGO,
  },

  /* ── Assessment Portal badge ── */
  portalBadge: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
  },

  portalText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },

  /* ── Footer ── */
  footer: {
    backgroundColor: COLORS.primary,
    position: 'fixed',
    width: "100%",
    left: 0,
    bottom: 0,
  },

  footerText: {
    color: "#fff",
    textAlign: "center",
    padding: 10,
    fontSize: 10,
  },
});