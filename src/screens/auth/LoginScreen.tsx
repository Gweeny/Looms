import { useForm, Controller } from "react-hook-form";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Colors } from "@/constants/colors";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@/types/navigation";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

type FormData = {
  email: string;
  password: string;
};

type Nav = StackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { control, handleSubmit } = useForm<FormData>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(data: FormData) {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // La navigation vers Main est automatique grâce à l'AuthContext
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage("Identifiant/Mot de passe incorrect");
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <Controller
        control={control}
        name="email"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
          placeholder="Mot de passe"
          placeholderTextColor={Colors.textMuted}
          onChangeText={onChange}
          value={value}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={styles.eyeButton} 
          onPress={() => setShowPassword(v => !v)}
        >
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={20} 
            color={Colors.textMuted} 
          />
        </TouchableOpacity>
      </View>
        )}
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Pas encore de compte ? Inscrivez-vous</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 24, justifyContent: "center" },
  title: { fontSize: 28, fontWeight: "700", color: Colors.text, marginBottom: 32 },
  input: { backgroundColor: Colors.surface, color: Colors.text, padding: 16, borderRadius: 8, marginBottom: 12 },
  button: { backgroundColor: Colors.accent, padding: 16, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: Colors.text, fontWeight: "600" },
  link: { color: Colors.textMuted, textAlign: "center", marginTop: 16, textDecorationLine: "underline" },
  errorText: { color: Colors.error, marginTop: 8, textAlign: "center" },
  inputRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface, borderRadius: 8, marginBottom: 12 },
  eyeButton: { padding: 16 },
});