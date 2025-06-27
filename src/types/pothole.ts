export interface Pothole {
  _id: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  description?: string;
  imageUrl: string;
  severity: 'Minor' | 'Major' | 'Severe' | 'Critical';
  createdAt: string;
}
