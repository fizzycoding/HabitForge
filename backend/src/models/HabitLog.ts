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
  { timestamps: true },
);

// Prevent duplicate log entries for the same habit by the same user on the same date
habitLogSchema.index({ userId: 1, habitId: 1, dateKey: 1 }, { unique: true });

export const HabitLog = model('HabitLog', habitLogSchema);
