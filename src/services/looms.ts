import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type NewLoom = {
  authorId: string;
  photoUrl: string;
  text: string;
  latitude: number;
  longitude: number;
  durationMinutes: number;
};

export async function createLoom(input: NewLoom) {
  const expiresAt = Timestamp.fromMillis(
    Date.now() + input.durationMinutes * 60 * 1000,
  );

  await addDoc(collection(db, "looms"), {
    ...input,
    createdAt: serverTimestamp(),
    expiresAt,
    extended: false,
    views: 0,
    discoveredBy: [],
  });
}
