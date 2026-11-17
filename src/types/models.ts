import type { Timestamp } from "firebase/firestore";

export type AppUser = {
  id: string;
  pseudo: string;
  glints: number;
  loomsDeposed: number;
  loomsDiscovered: number;
  totalViews: number;
  radiusLevel: number;
  createdAt: Timestamp;
};

export type Loom = {
  id: string;
  authorId: string;
  photoUrl: string;
  text: string;
  latitude: number;
  longitude: number;
  durationMinutes: number;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  extended: boolean;
  views: number;
  discoveredBy: string[];
};
