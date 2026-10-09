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
import { RootStackParamList, MainTabParamList} from "@/types/navigation";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#001C68", borderTopColor: "#002180" },
        tabBarActiveTintColor: "#00635D",
        tabBarInactiveTintColor: "#7B8FBF",
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

  if(loading) {
    return null; 
  }
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Drop" component={DropScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
