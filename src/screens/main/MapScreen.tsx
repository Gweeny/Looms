import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import MapView, { Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
import { useBackgroundDiscovery } from "@/hooks/useBackgroundDiscovery";
import { useMapLooms } from "@/hooks/useMapLooms";
import type { MapLoom } from "@/hooks/useMapLooms";
import { useUserProfile } from "@/hooks/useUserProfile";
import { discoverLoom } from "@/services/discovery";
import { distanceMeters } from "@/utils/geo";
import {
  CAMERA_PITCH,
  clamp,
  zoomForRadius,
  zoomLimits,
} from "@/utils/mapZoom";
import type { Loom } from "@/types/models";
import type { RootStackParamList } from "@/types/navigation";

const FOLLOW_MIN_DISTANCE = 2;

type Nav = StackNavigationProp<RootStackParamList>;

export function MapScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { permission, request, refresh, position, error } = useLocation();
  const { looms, error: loomsError } = useActiveLooms();
  const { profile } = useUserProfile(user?.uid);

  const radius = detectionRadius(profile?.radiusLevel ?? 0);
  const canZoom = (profile?.zoomLevel ?? 0) >= 1;
  const limits = zoomLimits(radius);

  const nearby = useDiscovery(position, user?.uid, looms, radius);
  const mapLooms = useMapLooms(user?.uid, looms, nearby);
  useDiscoveryNotification(nearby, user?.uid, permission?.granted ?? false);
  useBackgroundDiscovery(permission?.granted ?? false);

  const mapRef = useRef<MapView>(null);
  const headingRef = useRef(0);
  const startHeading = useRef(0);
  const zoomRef = useRef(zoomForRadius(radius));
  const startZoom = useRef(zoomRef.current);
  const lastUpdate = useRef(0);
  const lastFollowed = useRef<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [heading, setHeading] = useState(0);

  const [selected, setSelected] = useState<Loom | null>(null);
  const [reward, setReward] = useState<number | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const positionRef = useRef(position);
  positionRef.current = position;
  const radiusRef = useRef(radius);
  radiusRef.current = radius;
  function followUser(duration: number) {
    if (!position) return;
    mapRef.current?.animateCamera(
      {
        center: { latitude: position.latitude, longitude: position.longitude },
        heading: headingRef.current,
        pitch: CAMERA_PITCH,
        zoom: zoomRef.current,
      },
      { duration },
    );
  }
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        const current = positionRef.current;
        if (!current) return;
        zoomRef.current = zoomForRadius(radiusRef.current);
        mapRef.current?.setCamera({
          center: { latitude: current.latitude, longitude: current.longitude },
          heading: headingRef.current,
          pitch: CAMERA_PITCH,
          zoom: zoomRef.current,
        });
      }, 150);
      return () => clearTimeout(timer);
    }, []),
  );

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
    zoomRef.current = zoomForRadius(radius);
    setHeading(0);
    followUser(400);
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
            zoom: zoomRef.current,
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

  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .runOnJS(true)
        .enabled(canZoom)
        .onStart(() => {
          startZoom.current = zoomRef.current;
        })
        .onUpdate((event) => {
          if (!position) return;
          const next = clamp(
            startZoom.current + Math.log2(event.scale),
            limits.min,
            limits.max,
          );
          zoomRef.current = next;

          mapRef.current?.setCamera({
            center: {
              latitude: position.latitude,
              longitude: position.longitude,
            },
            heading: headingRef.current,
            pitch: CAMERA_PITCH,
            zoom: next,
          });
        }),
    [position, canZoom, limits.min, limits.max],
  );

  const gestures = useMemo(
    () => Gesture.Simultaneous(rotation, pinch),
    [rotation, pinch],
  );

  useEffect(() => {
    zoomRef.current = zoomForRadius(radius);
    followUser(700);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

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
          <GestureDetector gesture={gestures}>
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
                  zoom: zoomRef.current,
                  heading: 0,
                }}
              >
                <Circle
                  key={`radius-${radius}`}
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
                    key={`${item.loom.id}-${item.kind}`}
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
});
