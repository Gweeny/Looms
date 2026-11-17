import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/typography";
import { MAP_STYLE } from "@/constants/mapStyle";
import { PermissionGate } from "@/components/permissionGate";
import { DraggableFab } from "@/components/draggableFab";
import { useLocation } from "@/hooks/useLocation";
import type { RootStackParamList } from "@/types/navigation";
import { TouchableOpacity } from "react-native";
import { useAuth } from "@/contexte/authContext";
import { createLoom } from "@/services/looms";
import { CompassButton } from "@/components/compassButton";
import { useMyLooms } from "@/hooks/useMyLooms";
import { LoomMarker } from "@/components/loomMarker";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { DropButton } from "@/components/dropButton";
import { useEffect, useMemo, useRef, useState } from "react";

const CAMERA_PITCH = 40;
const CAMERA_ZOOM = 18.5;

type Nav = StackNavigationProp<RootStackParamList>;

export function MapScreen() {
  const { user } = useAuth();
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const navigation = useNavigation<Nav>();
  const { permission, request, refresh, position, error } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [heading, setHeading] = useState(0);
  const { looms, error: loomsError } = useMyLooms();
  const headingRef = useRef(0);
  const startHeading = useRef(0);
  async function onCameraSettled() {
    const camera = await mapRef.current?.getCamera();
    if (camera) setHeading(camera.heading);
  }
  const lastUpdate = useRef(0);
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
  async function onCameraMoving() {
    const now = Date.now();
    if (now - lastUpdate.current < 100) return;
    lastUpdate.current = now;

    const camera = await mapRef.current?.getCamera();
    if (camera) setHeading(camera.heading);
  }

  async function onTestLoom() {
    if (!user || !position) return;
    try {
      await createLoom({
        authorId: user.uid,
        photoUrl: "https://picsum.photos/400",
        text: "Loom de test",
        latitude: position.latitude,
        longitude: position.longitude,
        durationMinutes: 10,
      });
      setTestStatus("Loom créé");
    } catch (e) {
      console.error(e);
      setTestStatus("Erreur, voir le terminal");
    }
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
  useEffect(() => {
    if (!position) return;
    mapRef.current?.animateCamera(
      {
        center: { latitude: position.latitude, longitude: position.longitude },
        pitch: CAMERA_PITCH,
        zoom: CAMERA_ZOOM,
      },
      { duration: 1000 },
    );
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
          <>
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
              {looms.map((loom) => (
                <LoomMarker
                  key={loom.id}
                  latitude={loom.latitude}
                  longitude={loom.longitude}
                />
              ))}
            </MapView>
            <GestureDetector gesture={rotation}>
              <View style={StyleSheet.absoluteFill} />
            </GestureDetector>
          </>
        ) : (
          <Text style={styles.text}>Recherche de ta position…</Text>
        )}

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
        {testStatus ? <Text style={styles.text}>{testStatus}</Text> : null}
      </View>
      <CompassButton heading={heading} onPress={recenter} />
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
  button: {
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 8,
    alignItems: "flex-end",
    display: "flex",
    alignSelf: "flex-end",
    marginTop: 8,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    fontSize: 16,
  },
});
