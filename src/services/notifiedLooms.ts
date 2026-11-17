import AsyncStorage from "@react-native-async-storage/async-storage";

const caches = new Map<string, Promise<Set<string>>>();

function storageKey(userId: string) {
  return `notifiedLoomIds:${userId}`;
}

function load(userId: string): Promise<Set<string>> {
  let cached = caches.get(userId);
  if (!cached) {
    cached = AsyncStorage.getItem(storageKey(userId)).then(
      (raw) => new Set<string>(raw ? (JSON.parse(raw) as string[]) : []),
    );
    caches.set(userId, cached);
  }
  return cached;
}

export async function claimUnnotified(
  userId: string,
  ids: string[],
): Promise<string[]> {
  const known = await load(userId);
  const fresh = ids.filter((id) => !known.has(id));
  fresh.forEach((id) => known.add(id));
  if (fresh.length > 0) {
    await AsyncStorage.setItem(storageKey(userId), JSON.stringify([...known]));
  }
  return fresh;
}
