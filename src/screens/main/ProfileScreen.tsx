import { View, Text } from "react-native";
import { getAuth } from "firebase/auth";
export function ProfileScreen() {
  const auth = getAuth();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#001C68",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "#F0F4FF" }}>{auth.currentUser?.email}</Text>
    </View>
  );
}
