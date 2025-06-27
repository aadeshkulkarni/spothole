import mongoose, { Document, Schema } from 'mongoose';

export interface IPothole extends Document {
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  imageUrl: string;
  description?: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  severity: 'Minor' | 'Major' | 'Severe' | 'Critical';
  createdAt: Date;
  updatedAt: Date;
}

const PotholeSchema: Schema = new mongoose.Schema(
  {
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Reported', 'In Progress', 'Resolved'],
      default: 'Reported',
    },
    severity: {
      type: String,
      enum: ['Minor', 'Major', 'Severe', 'Critical'],
      required: true,
    },
  },
  { timestamps: true }
);

PotholeSchema.index({ location: '2dsphere' });

export default mongoose.models.Pothole ||
  mongoose.model<IPothole>('Pothole', PotholeSchema);
