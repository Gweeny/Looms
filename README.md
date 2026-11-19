# Looms

> Dépose un message caché dans le monde réel. Un autre joueur ne pourra le lire qu'en passant physiquement à côté.

Looms est une application mobile (Android) de messages géolocalisés cachés. Tu prends une photo sur place, tu y ajoutes un mot, tu choisis combien de temps le message va vivre, et tu le déposes à l'endroit où tu te trouves. Personne ne voit ce loom sur sa carte : il se révèle seulement quand un autre joueur entre dans son rayon de détection. Chaque découverte rapporte des **Glints**, la monnaie du jeu, à dépenser dans la boutique.

Projet réalisé seul dans le cadre de la majeure **Développement mobile**, Mastère 2 Logiciel, Mobile & IoT, YNOV Campus, 2025/2026.

---

## Sommaire

1. [Fonctionnalités](#fonctionnalités)
2. [Règles du jeu](#règles-du-jeu)
3. [Stack technique](#stack-technique)
4. [Architecture du projet](#architecture-du-projet)
5. [Modèle de données](#modèle-de-données)
6. [Installation pour le développement](#installation-pour-le-développement)
7. [Configuration des services externes](#configuration-des-services-externes)
8. [Variables d'environnement](#variables-denvironnement)
9. [Build et déploiement](#build-et-déploiement)
10. [Choix techniques](#choix-techniques)
11. [Limites connues et améliorations](#limites-connues-et-améliorations)

---

## Fonctionnalités

| Domaine | Ce que fait l'application |
|---|---|
| **Authentification** | Inscription et connexion par e-mail et mot de passe (Firebase Auth), vérification de la force du mot de passe, session conservée après fermeture de l'app. |
| **Onboarding** | Trois cartes d'introduction affichées au premier lancement. |
| **Carte** | Carte Google Maps au style sombre personnalisé, caméra inclinée qui suit le joueur, cercle de détection visible, rotation de la carte au geste, bouton boussole pour recentrer. |
| **Dépôt d'un loom** | Photo prise sur place (la galerie est volontairement interdite), message de 140 caractères maximum, durée de vie au choix, modération des mots interdits, règles de dépôt vérifiées avant d'ouvrir la caméra. |
| **Découverte** | Appui sur un loom à portée : transaction Firestore, récompense animée en Glints, fiche avec la photo, le message et le pseudo de l'auteur. |
| **Notifications** | Notification locale quand un loom se trouve à portée, y compris application fermée (tâche de fond de géolocalisation). |
| **Boutique** | Trois améliorations achetables avec les Glints : rayon de détection, zoom par pincement, nombre de looms actifs. |
| **Profil** | Pseudo, solde de Glints, statistiques, liste de mes looms actifs avec le temps restant, déconnexion. |
| **Hors ligne** | Bandeau d'alerte quand la connexion tombe, actions sensibles bloquées avec un message clair. |
| **Gestes et animations** | Rotation à deux doigts, pincement pour zoomer (une fois débloqué), boutons flottants déplaçables, pulsation des looms, récompense qui monte et s'efface. |

---

## Règles du jeu

**Durée de vie d'un loom et Glints gagnés par l'auteur à chaque vue**

| Durée | Glints par vue |
|---|---|
| 10 min | 10 |
| 30 min | 6 |
| 1 h | 4 |
| 6 h | 2 |
| 24 h | 1 |

Plus un loom vit court, plus il rapporte : c'est un pari sur le passage.

**Autres règles**

- Le découvreur gagne **1 Glint** par loom découvert.
- Rayon de détection de base : **25 m**.
- Distance minimale entre deux looms : **25 m**.
- Maximum de **5 looms actifs** par joueur (extensible dans la boutique).
- Un loom que l'on a déjà découvert reste visible en bleu et peut être rouvert sans limite.
- Les looms des autres joueurs ne sont jamais affichés tant qu'ils ne sont pas à portée.

**Boutique**

| Amélioration | Effet | Coût | Niveaux |
|---|---|---|---|
| Rayon de détection | +15 m par niveau | 100 + 25 × niveau | 6 |
| Zoom sur la carte | Débloque le pincement | 200 | 1 |
| Looms actifs | +1 loom simultané | 150 | 3 |

---

## Stack technique

| Besoin | Outil |
|---|---|
| Framework | React Native avec Expo (development build, pas Expo Go) |
| Langage | TypeScript en mode strict |
| Navigation | React Navigation (stack) |
| Authentification et base de données | Firebase Auth et Cloud Firestore |
| Stockage des photos | Cloudinary (envoi non signé, preset dédié) |
| Carte | `react-native-maps` avec le fournisseur Google Maps |
| Position | `expo-location` (premier plan et arrière-plan) |
| Tâche de fond | `expo-task-manager` |
| Notifications | `expo-notifications` (notifications locales) |
| Caméra | `expo-camera` |
| Animations | `react-native-reanimated` et `react-native-worklets` |
| Gestes | `react-native-gesture-handler` |
| Connectivité | `@react-native-community/netinfo` |
| Stockage local | `@react-native-async-storage/async-storage` |
| Formulaires | `react-hook-form` |
| Build et distribution | EAS Build |

---

## Architecture du projet

Le code est séparé par responsabilité. Un écran ne parle jamais directement à Firebase : il passe par un hook ou un service.

```
src/
├── components/     Composants d'interface réutilisables (marqueur, fiche de loom, carte d'amélioration…)
├── constants/      Valeurs fixes : couleurs, polices, règles du jeu, catalogue de la boutique, style de carte
├── contexte/       Contexte React d'authentification (utilisateur courant)
├── hooks/          Hooks personnalisés : un hook = une responsabilité
├── lib/            Initialisation de Firebase
├── navigation/     Pile de navigation et choix de l'écran de départ
├── screens/        Écrans, rangés par domaine : auth, onboarding, main
├── services/       Accès aux services externes (Firestore, Cloudinary, notifications, tâche de fond)
├── types/          Types TypeScript partagés (modèles, navigation)
└── utils/          Fonctions pures sans effet de bord (distance, zoom, modération, règles de dépôt…)
```

**Principes appliqués**

- **Logique métier séparée de l'affichage.** Les règles de dépôt (`utils/depositRules.ts`), le calcul de distance (`utils/geo.ts`) et la modération (`utils/moderation.ts`) sont des fonctions pures, sans React ni réseau.
- **Hooks personnalisés.** `useLocation`, `useActiveLooms`, `useDiscovery`, `useMapLooms`, `useUserProfile`, `useIsOnline`, `useDiscoveryNotification`, `useBackgroundDiscovery`, `useNow`, etc.
- **Une seule source de vérité pour les règles.** Les durées, rayons, coûts et limites vivent dans `constants/looms.ts` et `constants/shop.ts`. Changer un prix se fait à un seul endroit.
- **Thème centralisé.** Couleurs dans `constants/colors.ts`, polices dans `constants/typography.ts`. Aucune couleur écrite en dur dans les écrans.
- **Alias d'import.** `@/` pointe vers `src/` pour éviter les chemins relatifs interminables.
- **TypeScript strict.** Pas de `any` implicite, les modèles `AppUser` et `Loom` sont typés de bout en bout.

### Comment une découverte se déroule

1. `useLocation` suit la position du joueur.
2. `useActiveLooms` écoute en direct les looms non expirés dans Firestore.
3. `useDiscovery` garde ceux qui sont dans le rayon, ni de moi, ni déjà découverts.
4. `useMapLooms` décide comment chacun s'affiche (le mien, découvert, à portée, qui pulse ou non).
5. Un appui sur un loom à portée appelle `discoverLoom` (`services/discovery.ts`), une **transaction Firestore** qui met à jour d'un coup le loom, le compte de l'auteur et celui du découvreur.
6. Comme c'est une transaction, deux joueurs qui découvrent le même loom en même temps ne peuvent pas fausser les compteurs.

---

## Modèle de données

Deux collections Firestore.

**`users/{uid}`**

| Champ | Type | Rôle |
|---|---|---|
| `pseudo` | string | Nom affiché |
| `glints` | number | Solde |
| `loomsDeposed` | number | Statistique |
| `loomsDiscovered` | number | Statistique |
| `totalViews` | number | Vues reçues sur mes looms |
| `radiusLevel`, `slotsLevel`, `zoomLevel` | number | Niveaux d'amélioration |
| `createdAt` | timestamp | |

**`looms/{id}`**

| Champ | Type | Rôle |
|---|---|---|
| `authorId` | string | Auteur |
| `photoUrl` | string | Lien Cloudinary |
| `text` | string | Message (140 caractères max) |
| `latitude`, `longitude` | number | Position du dépôt |
| `durationMinutes` | number | Durée choisie |
| `createdAt`, `expiresAt` | timestamp | Un loom expiré n'est plus affiché |
| `views` | number | Nombre de découvertes |
| `discoveredBy` | string[] | Identifiants des découvreurs |
| `extended` | boolean | Réservé |

### Règles de sécurité Firestore

À coller dans la console Firebase, onglet Règles.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && (
        request.auth.uid == userId ||
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['glints', 'totalViews'])
      );
    }

    match /looms/{loomId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.authorId == request.auth.uid;
      allow update: if request.auth != null;
      allow delete: if request.auth != null
        && resource.data.authorId == request.auth.uid;
    }
  }
}
```

---

## Installation pour le développement

### Prérequis

- Node.js 20 ou plus récent
- Un compte [Expo](https://expo.dev) et la CLI EAS (`npx eas-cli`)
- Un téléphone Android (ou un émulateur avec Google Play Services)
- Les comptes Firebase, Cloudinary et Google Cloud décrits plus bas

### Étapes

```bash
# 1. Récupérer le projet
git clone <URL_DU_DEPOT>
cd looms

# 2. Installer les dépendances
npm install

# 3. Créer le fichier d'environnement
cp .env.example .env        # puis remplir les 7 valeurs (voir plus bas)

# 4. Vérifier la santé du projet
npx expo-doctor
npx tsc --noEmit

# 5. Construire une development build et l'installer sur le téléphone
npx eas-cli build --platform android --profile development

# 6. Lancer le serveur de développement
npx expo start --dev-client --tunnel
```

> L'application utilise des modules natifs (carte, tâche de fond, notifications). Elle ne fonctionne **pas** dans Expo Go : il faut une development build.

> L'option `--tunnel` est utile quand le téléphone et l'ordinateur ne sont pas sur le même réseau.

---

## Configuration des services externes

### Firebase

1. Créer un projet sur la console Firebase.
2. **Authentication** : activer le fournisseur *E-mail / mot de passe*.
3. **Firestore Database** : créer la base, puis publier les règles de la section précédente.
4. Ajouter une application Web dans les paramètres du projet et copier les cinq valeurs de configuration dans les variables d'environnement.

### Cloudinary

1. Créer un compte et noter le **cloud name**.
2. Dans les réglages d'envoi (*Upload*), créer un **upload preset** en mode **Unsigned**.
3. Renseigner le cloud name et le nom du preset dans les variables d'environnement.

### Google Maps

1. Dans Google Cloud, activer **Maps SDK for Android** et créer une clé d'API.
2. Placer la clé dans la configuration Android de l'application (`app.json`, section `android.config.googleMaps.apiKey`).
3. Une fois la carte validée sur un vrai build, **restreindre la clé** à l'application : nom de package `com.gweeny.Looms` et empreinte SHA-1 du keystore EAS (visible avec `npx eas-cli credentials`).

---

## Variables d'environnement

Les variables préfixées `EXPO_PUBLIC_` sont lues par l'application au moment du build.

| Variable | Rôle |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Clé d'API Firebase |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Domaine d'authentification |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Identifiant du projet |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Identifiant d'expéditeur |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Identifiant de l'application |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Nom du compte Cloudinary |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Preset d'envoi non signé |

**Important :** le fichier `.env` n'est **pas** envoyé aux serveurs EAS. Pour les profils `preview` et `production`, ces sept variables doivent être créées sur expo.dev, dans *Project settings > Environment variables*. Sans elles, l'APK se construit mais ne peut pas joindre Firebase ni Cloudinary.

> Ces valeurs identifient les services, elles ne donnent pas accès aux données : c'est le rôle des règles Firestore. Elles restent tout de même hors du dépôt Git.

---

## Build et déploiement

Trois profils sont définis dans `eas.json`.

| Profil | Usage | Commande |
|---|---|---|
| `development` | Développement, avec le client de dev | `npx eas-cli build --platform android --profile development` |
| `preview` | APK de test, installable directement | `npx eas-cli build --platform android --profile preview` |
| `production` | Version de livraison | `npx eas-cli build --platform android --profile production` |

### Procédure de livraison, pas à pas

1. **Vérifier le code**
   ```bash
   npx tsc --noEmit
   npx expo-doctor
   ```
2. **Vérifier les variables d'environnement** sur expo.dev pour l'environnement visé.
3. **Committer et pousser** le code : le build correspond ainsi à une version identifiable dans l'historique Git.
4. **Lancer le build**
   ```bash
   npx eas-cli build --platform android --profile production
   ```
   Le build tourne sur les serveurs EAS : l'ordinateur peut être éteint une fois l'URL du build affichée.
5. **Suivre le build** sur expo.dev (onglet *Builds*) ou avec `npx eas-cli build:list`.
6. **Installer l'APK** en ouvrant le lien du build sur le téléphone.
7. **Tester sur l'appareil** : carte visible, session conservée après fermeture complète, dépôt, découverte avec un second compte, boutique, notification application fermée, mode avion.

### Publication sur le Google Play Store

Les profils actuels produisent un **APK**, pratique pour tester. Le Play Store exige un **AAB**.

1. Dans le profil `production` d'`eas.json`, remplacer `"buildType": "apk"` par `"buildType": "app-bundle"`.
2. Créer un compte développeur Google Play (frais d'inscription unique).
3. Construire avec `--profile production`.
4. Envoyer le bundle avec `npx eas-cli submit --platform android`.
5. Compléter la fiche du store (description, captures, politique de confidentialité, déclaration d'usage de la position en arrière-plan).

L'application n'est pas publiée sur un store : ce n'était pas dans le périmètre de ce projet.

### iOS

Aucune configuration iOS n'a été testée. Le passage à iOS demande un compte Apple Developer, la gestion des certificats par EAS et la déclaration des permissions de localisation dans la configuration de l'app.

---

## Choix techniques

- **Expo avec development build, pas Expo Go ni React Native nu.** Les modules natifs nécessaires (cartes, tâche de fond) sont disponibles via les plugins Expo, et EAS Build évite d'installer Android Studio pour chaque build.
- **Firebase.** Authentification et base de données en temps réel déjà intégrées : un abonnement `onSnapshot` met la carte à jour sans rafraîchissement manuel.
- **Cloudinary plutôt que Firebase Storage.** Storage demande de renseigner un moyen de paiement. Cloudinary offre un envoi non signé sans carte bancaire.
- **Google Maps plutôt que MapLibre.** Meilleure intégration avec `react-native-maps`, style sombre personnalisable.
- **Pas de barre d'onglets.** La carte est l'écran principal en plein écran ; la boutique et le profil s'ouvrent depuis deux boutons flottants déplaçables, comme dans les jeux de géolocalisation.
- **Transactions Firestore** pour tout ce qui touche aux Glints, afin que les soldes restent justes même avec plusieurs joueurs en même temps.
- **Notifications locales déclenchées par une tâche de fond**, plutôt que des notifications push serveur : la décision « un loom est à portée » dépend de la position de l'appareil, qui n'est connue que sur l'appareil.

---

## Limites connues et améliorations

**Limites assumées**

- **Les Glints sont calculés côté client.** Un utilisateur techniquement averti pourrait modifier son solde. La vraie solution est une **Cloud Function** qui applique les règles côté serveur.
- **Les coordonnées de tous les looms sont lisibles** par un utilisateur connecté qui interrogerait directement Firestore. Une version de production ne stockerait pas les positions exactes en clair, ou les filtrerait côté serveur (géohash, Cloud Function).
- **Règle de mise à jour des looms ouverte** : tout utilisateur connecté peut modifier un loom. À restreindre aux champs `views` et `discoveredBy`.
- **Mode hors ligne partiel.** Le bandeau et le blocage des actions sont en place, mais Firestore n'a pas de cache disque dans React Native : sans réseau, la carte n'affiche pas de données nouvelles.
- **La tâche de fond relit toute la collection `looms`** à chaque déplacement de 10 m. À remplacer par une requête géographique.
- **La modération des mots est contournable**, et les photos ne sont pas modérées.
- **Pas de tests automatisés.** La validation a été manuelle, avec deux comptes et une position simulée.

**Pistes d'amélioration**

- Cloud Functions pour les Glints et la découverte.
- Requêtes géographiques (geohash) pour limiter les lectures.
- Un fournisseur de données partagé pour éviter plusieurs écoutes Firestore simultanées sur la même collection.
- Tests unitaires sur les fonctions pures (`geo`, `moderation`, `password`, `depositRules`).
- Extension de la durée d'un loom, signalement, profil public, connexion Google (prévus au cahier des charges initial, retirés pour tenir le délai).
- Version iOS et publication sur les stores.

---

## Auteur

**Sam** : projet individuel, majeure Développement mobile, YNOV Campus, 2025/2026.
