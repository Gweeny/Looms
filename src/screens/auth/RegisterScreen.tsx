import { useForm, Controller } from "react-hook-form";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Colors } from "@/constants/colors";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "@/types/navigation";
import { useState } from "react";
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";import { db } from "@/lib/firebase";
import { Ionicons } from "@expo/vector-icons";

type FormData = {
  email: string;
  password: string;
  pseudo: string;
};

type Nav = StackNavigationProp<RootStackParamList>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { control, handleSubmit } = useForm<FormData>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
 
async function onSubmit(data: FormData) {
  const pseudoQuery = query(
    collection(db, "users"),
    where("pseudo", "==", data.pseudo)
  );
  const pseudoSnapshot = await getDocs(pseudoQuery);
  
  if (!pseudoSnapshot.empty) {
    setErrorMessage("Ce pseudo est déjà pris");
    return;
  }
  try {
    // 1. Créer le compte Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    // 2. Créer le document utilisateur dans Firestore
    await setDoc(doc(db, "users", user.uid), {
      pseudo: data.pseudo,
      glints: 0,
      loomsDeposed: 0,
      loomsDiscovered: 0,
      totalViews: 0,
      createdAt: new Date(),
    });

    // 3. Aller vers l'Onboarding
    navigation.navigate("Onboarding");
  } catch (error) {
    setErrorMessage("Erreur lors de l'inscription");
    console.error(error);
  }
}

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>
      <Controller
        control={control}
        name="pseudo"
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="Pseudo"
            placeholderTextColor={Colors.textMuted}
            onChangeText={onChange}
            value={value}
            autoCapitalize="none"
          />
        )}
      />
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
        <Text style={styles.buttonText}>S'inscrire</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Déjà inscrit ? Connectez-vous</Text>
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