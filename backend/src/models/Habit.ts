import { Schema, model } from 'mongoose';

const habitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: 'target',
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

habitSchema.index({ userId: 1, isArchived: 1 });
habitSchema.index({ userId: 1, createdAt: -1 });

export const Habit = model('Habit', habitSchema);
