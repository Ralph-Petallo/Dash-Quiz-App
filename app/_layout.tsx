import { Slot, usePathname } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const pathname = usePathname();

  // Check if the current route is inside the user-folder
  const isUserSection = pathname.includes('user-folder');

  return (
    <SafeAreaView style={styles.container}>
      <Slot />
      {/* Only shows the footer if NOT in the user section */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  footer: {
    fontSize: 8,
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4f46e5",
  },
  footerText: {
    color: "#fff",
    textAlign: "center",
    padding: 10,
    fontSize: 10,
  },

});