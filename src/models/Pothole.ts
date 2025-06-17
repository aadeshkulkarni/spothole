import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  user: mongoose.Schema.Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IPothole extends Document {
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  imageUrl: string;
  description?: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  reportedBy: mongoose.Schema.Types.ObjectId; // Reference to User model
  upvotes: mongoose.Schema.Types.ObjectId[]; // Array of user IDs
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

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
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Not strictly required for now, can be added later
      // required: true,
    },
    upvotes: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    comments: {
      type: [CommentSchema],
      default: [],
    },
  },
  { timestamps: true }
);

PotholeSchema.index({ location: '2dsphere' });

export default mongoose.models.Pothole ||
  mongoose.model<IPothole>('Pothole', PotholeSchema);
