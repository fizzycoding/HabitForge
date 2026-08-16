import { Schema, model } from 'mongoose';

const badgeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
    },
    requirementType: {
      type: String,
      required: true,
      trim: true,
    },
    requirementValue: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

export const Badge = model('Badge', badgeSchema);
