import {
  collection,
  doc,
  increment,
  serverTimestamp,
  Timestamp,
  writeBatch,
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

export async function createLoom(input: NewLoom): Promise<void> {
  const expiresAt = Timestamp.fromMillis(
    Date.now() + input.durationMinutes * 60 * 1000,
  );

  const batch = writeBatch(db);
  batch.set(doc(collection(db, "looms")), {
    ...input,
    createdAt: serverTimestamp(),
    expiresAt,
    extended: false,
    views: 0,
    discoveredBy: [],
  });
  batch.update(doc(db, "users", input.authorId), {
    loomsDeposed: increment(1),
  });
  await batch.commit();
}
