import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IndexPage() {

  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={{ marginBottom: 20 }}>
          <Image source={require('../assets/images/bolt.png')} style={{ width: 42, height: 42 }} />
        </View>
        {/* Title */}
        <Text style={styles.title}>
          Learning is{" "}
          <Text style={styles.primary}>better</Text> when we do it{" "}
          <Text style={styles.primary}>together</Text>
        </Text>
        <Text style={styles.smallText}>
          Practice, learn, and improve your skills with Dash Quiz.
        </Text>
        {/* Login button */}
        <View style={styles.buttonContainer}>
          <Pressable
            onPress={() => { router.push('/login'); }}
            style={({ pressed }) => [
              styles.loginBtn,
              { backgroundColor: !pressed ? PRIMARY : '#4f46e5' } // Change color on press
            ]}>
            <Text style={styles.loginText}>Login</Text>
          </Pressable>
          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.line} />
          </View>

          {/* Register button  */}
          <Pressable
            onPress={() => { router.push('/register'); }}
            style={({ pressed }) => [
              styles.registerBtn,
              { backgroundColor: pressed ? '#176d1e' : '#2b8533' } // Change color on press
            ]}>
            <Text style={styles.registerText}>Register</Text>
          </Pressable>
        </View>

      </View>

    </SafeAreaView >
  );
}

const PRIMARY = "#6366F1"; // change this if your DashQuiz color is different

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: "#111",
    marginBottom: 20,
    lineHeight: 34,
  },

  smallText: {
    fontSize: 10,
    textAlign: "center",
    color: "#555",
    marginBottom: 30,
  },

  primary: {
    color: PRIMARY,
  },

  buttonContainer: {
    width: "100%",
  },

  loginBtn: {
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 10,
  },

  loginText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },

  registerBtn: {
    borderWidth: 1,
    borderColor: PRIMARY,
    padding: 14,
    borderRadius: 10,
  },

  registerText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
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