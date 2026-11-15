import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { MapScreen } from "../screens/main/MapScreen";
import { ShopScreen } from "../screens/main/ShopScreen";
import { ProfileScreen } from "../screens/main/ProfileScreen";
import { DropScreen } from "../screens/main/DropScreen";
import { useAuth } from "@/contexte/authContext";
import { RootStackParamList, MainTabParamList } from "@/types/navigation";
import { LoomsLogo } from "@/components/logo";
import { Colors } from "@/constants/colors";
import { useOnboardingSeen } from "@/hooks/useOnboardingSeen";
import { useExitConfirmation } from "@/hooks/useExitConfirmation";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.surface,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
      }}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Shop" component={ShopScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function Navigation() {
  const { user, loading } = useAuth();
  const { seen } = useOnboardingSeen();
  useExitConfirmation();

  if (loading || seen === null) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={seen ? "Login" : "Onboarding"}
        screenOptions={{
          headerShown: true,
          headerTitle: () => <LoomsLogo size={28} />,
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerLeft: () => null,
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
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
  );
}
