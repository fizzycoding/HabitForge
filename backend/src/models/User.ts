import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    avatar: {
      type: String,
      enum: ['avatar-01', 'avatar-02', 'avatar-03', 'avatar-04', 'avatar-05'],
      default: 'avatar-01',
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'monthly', 'yearly'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active',
      },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date },
    },
    badges: [
      {
        badgeId: { type: Schema.Types.ObjectId, ref: 'Badge', required: true },
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
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

userSchema.index({ email: 1 }, { unique: true });

export const User = model('User', userSchema);
