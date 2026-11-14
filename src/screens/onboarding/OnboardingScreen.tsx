import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { ONBOARDING_SLIDES } from "@/constants/onboardingSlides";
import { useOnboardingSeen } from "@/hooks/useOnboardingSeen";
import type { RootStackParamList } from "@/types/navigation";

type Nav = StackNavigationProp<RootStackParamList>;

export function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const navigation = useNavigation<Nav>();
  const { markAsSeen } = useOnboardingSeen();
  const [index, setIndex] = useState(0);

  const isLast = index === ONBOARDING_SLIDES.length - 1;
  const cardHeight = height * 0.62;

  function onScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
  }

  async function onStart() {
    await markAsSeen();
    navigation.replace("Login");
  }

  return (
    <View style={styles.container}>
      <View style={[StyleSheet.absoluteFill, styles.mapPlaceholder]} />
      <View style={[StyleSheet.absoluteFill, styles.dim]} />

      <FlatList
        data={ONBOARDING_SLIDES}
        extraData={index}
        keyExtractor={(slide) => slide.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item, index: itemIndex }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.card, { height: cardHeight }]}>
              <View style={styles.cardInner}>
                <View style={styles.content}>
                  <View style={styles.iconCircle}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={48}
                      color={Colors.glints}
                    />
                  </View>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.text}>{item.text}</Text>
                </View>

                <View style={styles.footer}>
                  <View style={styles.dots}>
                    {ONBOARDING_SLIDES.map((slide, i) => (
                      <View
                        key={slide.id}
                        style={[styles.dot, i === index && styles.dotActive]}
                      />
                    ))}
                  </View>
                  {itemIndex === ONBOARDING_SLIDES.length - 1 ? (
                    <TouchableOpacity style={styles.button} onPress={onStart}>
                      <Text style={styles.buttonText}>Se connecter</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  mapPlaceholder: { backgroundColor: Colors.background },
  dim: { backgroundColor: Colors.background, opacity: 0.55 },
  slide: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.glints,
    padding: 6,
  },
  cardInner: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 28,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.glints,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    fontSize: 24,
    textAlign: "center",
  },
  text: {
    fontFamily: Fonts.regular,
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: "center",
  },
  footer: { height: 96, alignItems: "center", gap: 16 },
  dots: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },
  dotActive: { width: 22, backgroundColor: Colors.glints, opacity: 1 },
  button: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.glints,
    backgroundColor: Colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 16,
  },
});
