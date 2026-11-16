import { useForm, Controller } from "react-hook-form";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { PasswordChecklist } from "@/components/PasswordChecklist";
import { isPasswordValid } from "@/utils/password";
import type { RootStackParamList } from "@/types/navigation";

type FormData = {
  email: string;
  password: string;
  pseudo: string;
};

type Nav = StackNavigationProp<RootStackParamList>;

export function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ mode: "onChange" });
  const password = watch("password", "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(data: FormData) {
    try {
      setErrorMessage(null);

      const pseudoQuery = query(
        collection(db, "users"),
        where("pseudo", "==", data.pseudo),
      );
      const pseudoSnapshot = await getDocs(pseudoQuery);
      if (!pseudoSnapshot.empty) {
        setErrorMessage("Ce pseudo est déjà pris");
        return;
      }

      const { user } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      await setDoc(doc(db, "users", user.uid), {
        pseudo: data.pseudo,
        glints: 0,
        loomsDeposed: 0,
        loomsDiscovered: 0,
        totalViews: 0,
        createdAt: new Date(),
      });
    } catch (error) {
      const code = (error as { code?: string }).code;
      setErrorMessage(
        code === "auth/email-already-in-use"
          ? "Cet email est déjà utilisé"
          : "Erreur lors de l'inscription",
      );
      console.error(error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscription</Text>

      <Controller
        control={control}
        name="pseudo"
        rules={{
          required: "Pseudo requis",
          minLength: { value: 3, message: "3 caractères minimum" },
        }}
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
      {errors.pseudo ? (
        <Text style={styles.fieldError}>{errors.pseudo.message}</Text>
      ) : null}

      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email requis",
          pattern: { value: /^\S+@\S+\.\S+$/, message: "Email invalide" },
        }}
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
      {errors.email ? (
        <Text style={styles.fieldError}>{errors.email.message}</Text>
      ) : null}

      <Controller
        control={control}
        name="password"
        rules={{
          required: "Mot de passe requis",
          validate: (value) =>
            isPasswordValid(value) || "Mot de passe non conforme",
        }}
        render={({ field: { onChange, value } }) => (
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputInRow]}
              placeholder="Mot de passe"
              placeholderTextColor={Colors.textMuted}
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((v) => !v)}
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
      <PasswordChecklist password={password} />

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 28,
    color: Colors.text,
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    fontFamily: Fonts.regular,
    backgroundColor: Colors.surface,
    color: Colors.text,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 12,
  },
  inputInRow: { flex: 1, marginBottom: 0 },
  eyeButton: { padding: 16 },
  fieldError: {
    fontFamily: Fonts.regular,
    color: Colors.error,
    fontSize: 13,
    marginTop: -6,
    marginBottom: 10,
  },
  button: {
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 16,
  },
  link: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 16,
    textDecorationLine: "underline",
  },
  errorText: {
    fontFamily: Fonts.regular,
    color: Colors.error,
    marginTop: 8,
    textAlign: "center",
  },
});
