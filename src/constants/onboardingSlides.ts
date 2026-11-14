import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

export type OnboardingSlide = {
  id: string;
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
  text: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    icon: "map-marker-outline",
    title: "Cache un message",
    text: "Dépose une photo et un mot à l'endroit où tu te trouves. Personne ne le verra… pour l'instant.",
  },
  {
    id: "2",
    icon: "compass-outline",
    title: "Découvre ceux des autres",
    text: "Marche dans la ville. À moins de 10 mètres d'un loom, le message se révèle.",
  },
  {
    id: "3",
    icon: "star-four-points-outline",
    title: "Gagne des Glints",
    text: "Chaque vue et chaque découverte te rapporte des Glints, à dépenser pour personnaliser ton profil.",
  },
];
