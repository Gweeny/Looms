import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { MapScreen } from "../screens/main/MapScreen";
import { ShopScreen } from "../screens/main/ShopScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { DropScreen } from "../screens/main/DropScreen";
import { useAuth } from "@/contexte/authContext";
import { RootStackParamList } from "@/types/navigation";
import { LoomsLogo } from "@/components/logo";
import { Colors } from "@/constants/colors";
import { useOnboardingSeen } from "@/hooks/useOnboardingSeen";
import { useExitConfirmation } from "@/hooks/useExitConfirmation";
import { OfflineBanner } from "@/components/offlineBanner";
import { View } from "react-native";

const Stack = createStackNavigator<RootStackParamList>();

export function Navigation() {
  const { user, loading } = useAuth();
  const { seen } = useOnboardingSeen();
  useExitConfirmation();

  if (loading || seen === null) return null;

  const initialRoute = user ? "Map" : seen ? "Login" : "Onboarding";

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: true,
            headerTitle: () => <LoomsLogo size={28} />,
            headerTitleAlign: "center",
            headerStyle: { backgroundColor: Colors.background },
            headerShadowVisible: false,
            headerTintColor: Colors.glints,
          }}
        >
          {user ? (
            <>
              <Stack.Screen
                name="Map"
                component={MapScreen}
                options={{
                  headerTransparent: true,
                  headerStyle: { backgroundColor: "transparent" },
                }}
              />
              <Stack.Screen name="Shop" component={ShopScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Drop" component={DropScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <OfflineBanner />
    </View>
  );
}
