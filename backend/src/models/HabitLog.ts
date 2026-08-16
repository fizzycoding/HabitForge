import { Schema, model } from 'mongoose';

const habitLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
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

habitLogSchema.index({ userId: 1, habitId: 1, dateKey: 1 }, { unique: true });

export const HabitLog = model('HabitLog', habitLogSchema);
