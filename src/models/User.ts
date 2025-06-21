import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  emailVerified?: Date;
  accounts: any[];
}

const UserSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>('User', UserSchema);
