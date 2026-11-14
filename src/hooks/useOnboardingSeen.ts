import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "onboardingSeen";

export function useOnboardingSeen() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((value) => {
      setSeen(value === "true");
    });
  }, []);

  const markAsSeen = useCallback(async () => {
    await AsyncStorage.setItem(KEY, "true");
    setSeen(true);
  }, []);

  return { seen, markAsSeen };
}
