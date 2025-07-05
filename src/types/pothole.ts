export interface Pothole {
  id: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  imageUrl: string;
  // Optional fields that might be added later
  description?: string | null;
  userId?: string | null;
  status?: string | null;
}
