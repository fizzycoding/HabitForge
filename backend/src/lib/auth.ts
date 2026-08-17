import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { generateUniqueUID } from '../utils/uid.js';

export const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection.db!),
  secret: env.JWT_ACCESS_SECRET,
  baseURL: env.CLIENT_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    async sendVerificationEmail(data: { user: { email: string; name: string }; token: string; url: string }) {
      const otpCode = data.token.slice(0, 6).toUpperCase();
      await sendVerificationEmail({
        to: data.user.email,
        name: data.user.name,
        token: data.token,
        otp: otpCode,
      });
    },
    async sendResetPassword(data: { user: { email: string; name: string }; token: string; url: string }) {
      await sendPasswordResetEmail({
        to: data.user.email,
        name: data.user.name,
        token: data.token,
      });
    },
  },
  user: {
    additionalFields: {
      uid: {
        type: 'string',
        required: false,
        defaultValue: '',
      },
      avatar: {
        type: 'string',
        required: false,
        defaultValue: 'avatar-01',
      },
      xp: {
        type: 'number',
        required: false,
        defaultValue: 0,
      },
      level: {
        type: 'number',
        required: false,
        defaultValue: 1,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user: Record<string, any>) => {
          const uid = await generateUniqueUID();
          return {
            data: {
              ...user,
              uid,
            },
          };
        },
      },
    },
  },
});
