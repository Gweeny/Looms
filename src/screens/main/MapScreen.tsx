import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import MapView, { Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { DISCOVERER_REWARD, detectionRadius } from "@/constants/looms";
import { MAP_STYLE } from "@/constants/mapStyle";
import { PermissionGate } from "@/components/permissionGate";
import { DraggableFab } from "@/components/draggableFab";
import { CompassButton } from "@/components/compassButton";
import { LoomMarker } from "@/components/loomMarker";
import { PulseCircle } from "@/components/pulseCircle";
import { DropButton } from "@/components/dropButton";
import { LoomSheet } from "@/components/loomSheet";
import { useAuth } from "@/contexte/authContext";
import { useLocation } from "@/hooks/useLocation";
import { useActiveLooms } from "@/hooks/useActiveLooms";
import { useDiscovery } from "@/hooks/useDiscovery";
import { useDiscoveryNotification } from "@/hooks/useDiscoveryNotifications";
import { useMapLooms } from "@/hooks/useMapLooms";
import type { MapLoom } from "@/hooks/useMapLooms";
import { useUserProfile } from "@/hooks/useUserProfile";
import { discoverLoom } from "@/services/discovery";
import { distanceMeters } from "@/utils/geo";
import type { Loom } from "@/types/models";
import type { RootStackParamList } from "@/types/navigation";
import { useBackgroundDiscovery } from "@/hooks/useBackgroundDiscovery";
const CAMERA_PITCH = 40;
const CAMERA_ZOOM = 18.5;
const FOLLOW_MIN_DISTANCE = 2;

type Nav = StackNavigationProp<RootStackParamList>;

export function MapScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { permission, request, refresh, position, error } = useLocation();
  const { looms, error: loomsError } = useActiveLooms();
  const { profile } = useUserProfile(user?.uid);

  const radius = detectionRadius(profile?.radiusLevel ?? 0);
  const nearby = useDiscovery(position, user?.uid, looms, radius);
  const mapLooms = useMapLooms(user?.uid, looms, nearby);
  useDiscoveryNotification(nearby, user?.uid, permission?.granted ?? false);
  useBackgroundDiscovery(permission?.granted ?? false);
  const mapRef = useRef<MapView>(null);
  const headingRef = useRef(0);
  const startHeading = useRef(0);
  const lastUpdate = useRef(0);
  const lastFollowed = useRef<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [heading, setHeading] = useState(0);

  const [selected, setSelected] = useState<Loom | null>(null);
  const [reward, setReward] = useState<number | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);

  function followUser(duration: number) {
    if (!position) return;
    mapRef.current?.animateCamera(
      {
        center: { latitude: position.latitude, longitude: position.longitude },
        heading: headingRef.current,
        pitch: CAMERA_PITCH,
        zoom: CAMERA_ZOOM,
      },
      { duration },
    );
  }

  async function onDiscover(loomId: string) {
    if (!user || discovering) return;
    try {
      setDiscovering(true);
      setDiscoverError(null);
      const loom = await discoverLoom(loomId, user.uid);
      if (loom) {
        setReward(DISCOVERER_REWARD);
        setSelected(loom);
      } else {
        setDiscoverError("Ce loom n'est plus disponible.");
      }
    } catch (e) {
      console.error("découverte:", e);
      setDiscoverError("Découverte impossible. Vérifie ta connexion.");
    } finally {
      setDiscovering(false);
    }
  }

  function onMarkerPress(item: MapLoom) {
    if (item.kind === "inRange") {
      onDiscover(item.loom.id);
      return;
    }
    setReward(null);
    setSelected(item.loom);
  }

  function closeSheet() {
    setSelected(null);
    setReward(null);
    followUser(300);
  }

  function recenter() {
    if (!position) return;
    headingRef.current = 0;
    setHeading(0);
    mapRef.current?.animateCamera(
      {
        center: { latitude: position.latitude, longitude: position.longitude },
        heading: 0,
        pitch: CAMERA_PITCH,
        zoom: CAMERA_ZOOM,
      },
      { duration: 400 },
    );
  }

  const rotation = useMemo(
    () =>
      Gesture.Rotation()
        .runOnJS(true)
        .onStart(() => {
          startHeading.current = headingRef.current;
        })
        .onUpdate((event) => {
          if (!position) return;
          const degrees = (event.rotation * 180) / Math.PI;
          const next = (((startHeading.current - degrees) % 360) + 360) % 360;
          headingRef.current = next;

          mapRef.current?.setCamera({
            center: {
              latitude: position.latitude,
              longitude: position.longitude,
            },
            heading: next,
            pitch: CAMERA_PITCH,
            zoom: CAMERA_ZOOM,
          });

          const now = Date.now();
          if (now - lastUpdate.current > 100) {
            lastUpdate.current = now;
            setHeading(next);
          }
        })
        .onEnd(() => {
          setHeading(headingRef.current);
        }),
    [position],
  );

  useEffect(() => {
    if (!position) return;
    const last = lastFollowed.current;
    if (last && distanceMeters(last, position) < FOLLOW_MIN_DISTANCE) return;
    lastFollowed.current = {
      latitude: position.latitude,
      longitude: position.longitude,
    };
    followUser(1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  return (
    <PermissionGate
      title="Position"
      message="Pour accéder à la carte, nous avons besoin de connaître ta position."
      permission={permission}
      request={request}
      refresh={refresh}
    >
      <View style={styles.container}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : position ? (
          <GestureDetector gesture={rotation}>
            <View style={StyleSheet.absoluteFill}>
              <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_GOOGLE}
                customMapStyle={MAP_STYLE}
                showsUserLocation
                showsBuildings
                showsCompass={false}
                showsMyLocationButton={false}
                rotateEnabled={false}
                toolbarEnabled={false}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                initialCamera={{
                  center: {
                    latitude: position.latitude,
                    longitude: position.longitude,
                  },
                  pitch: CAMERA_PITCH,
                  zoom: CAMERA_ZOOM,
                  heading: 0,
                }}
              >
                <Circle
                  center={{
                    latitude: position.latitude,
                    longitude: position.longitude,
                  }}
                  radius={radius}
                  strokeWidth={1.5}
                  strokeColor={`${Colors.glints}99`}
                  fillColor={`${Colors.glints}1A`}
                />
                {mapLooms
                  .filter((item) => item.pulsing)
                  .map((item) => (
                    <PulseCircle
                      key={`pulse-${item.loom.id}`}
                      latitude={item.loom.latitude}
                      longitude={item.loom.longitude}
                    />
                  ))}
                {mapLooms.map((item) => (
                  <LoomMarker
                    key={item.loom.id}
                    latitude={item.loom.latitude}
                    longitude={item.loom.longitude}
                    color={
                      item.kind === "discovered" ? Colors.accent : Colors.glints
                    }
                    onPress={() => onMarkerPress(item)}
                  />
                ))}
              </MapView>
            </View>
          </GestureDetector>
        ) : (
          <Text style={styles.text}>Recherche de ta position…</Text>
        )}

        {loomsError ? <Text style={styles.banner}>{loomsError}</Text> : null}
        {discoverError ? (
          <Text style={styles.discoverError}>{discoverError}</Text>
        ) : null}

        <DraggableFab
          icon="storefront-outline"
          slot={0}
          onPress={() => navigation.navigate("Shop")}
        />
        <DraggableFab
          icon="account-outline"
          slot={1}
          onPress={() => navigation.navigate("Profile")}
        />
        <DropButton onPress={() => navigation.navigate("Drop")} />
        <CompassButton heading={heading} onPress={recenter} />

        {/* TEMPORAIRE : pour tester avec deux comptes, à supprimer ensuite */}
        <TouchableOpacity
          style={styles.tempLogout}
          onPress={() => signOut(auth)}
        >
          <Text style={styles.pillText}>Déconnexion</Text>
        </TouchableOpacity>

        <LoomSheet loom={selected} reward={reward} onClose={closeSheet} />
      </View>
    </PermissionGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  text: {
    fontFamily: Fonts.regular,
    color: Colors.text,
    fontSize: 18,
    textAlign: "center",
  },
  error: {
    fontFamily: Fonts.regular,
    color: Colors.error,
    fontSize: 16,
    textAlign: "center",
  },
  banner: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    fontFamily: Fonts.regular,
    color: Colors.error,
    fontSize: 14,
  },
  discoverError: {
    position: "absolute",
    bottom: 140,
    alignSelf: "center",
    fontFamily: Fonts.regular,
    color: Colors.error,
  },
  pillText: {
    fontFamily: Fonts.semiBold,
    color: Colors.glints,
    fontSize: 16,
  },
  tempLogout: {
    position: "absolute",
    top: 180,
    left: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.glints,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
