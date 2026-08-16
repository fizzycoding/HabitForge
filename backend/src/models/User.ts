import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  refreshToken: {
    type: String,
    select: false
  },

  avatar: {
    type: String,
    default: 'default-01'
  },

  xp: {
    type: Number,
    default: 0
  },

  level: {
    type: Number,
    default: 1
  },

  subscription: {
    plan: {
      type: String,
      enum: ['free', 'monthly', 'yearly'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },

  badges: [
    {
      badgeId: { type: String, required: true },
      unlockedAt: { type: Date, default: Date.now },
    },
  ],
},

  { timestamps: true },
);

export const User = model('User', userSchema);
