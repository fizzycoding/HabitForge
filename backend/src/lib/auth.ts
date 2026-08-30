import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js';
import { generateUniqueUID } from '../utils/uid.js';

const dbProxy = new Proxy({} as any, {
  get(_target, prop) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection is not established yet.');
    }
    const value = Reflect.get(db, prop);
    return typeof value === 'function' ? value.bind(db) : value;
  },
});

export const auth = betterAuth({
  database: mongodbAdapter(dbProxy),
  secret: env.JWT_ACCESS_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || env.SERVER_URL || 'https://habitforge-ldjc.onrender.com',
  basePath: '/api/auth',
  trustedOrigins: [
    env.CLIENT_URL,
    'https://habit-forge-eta.vercel.app',
    'http://localhost:5173',
  ],
  advanced: {
    disableCSRFCheck: true,
  },
  emailVerification: {
    sendOnSignUp: false,
    async sendVerificationEmail(data: { user: { email: string; name: string }; token: string; url: string }) {
      const serverBase = process.env.BETTER_AUTH_URL || env.SERVER_URL || 'https://habitforge-ldjc.onrender.com';
      const verifyUrl = `${serverBase}/api/auth/verify-email?token=${data.token}&callbackURL=${encodeURIComponent(env.CLIENT_URL)}`;
      await sendVerificationEmail({
        to: data.user.email,
        name: data.user.name,
        url: verifyUrl,
        token: data.token,
      });
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    requireEmailVerification: false,
    async sendResetPassword(data: { user: { email: string; name: string }; token: string; url: string }) {
      const resetUrl = `${env.CLIENT_URL}/reset-password?token=${data.token}`;
      await sendPasswordResetEmail({
        to: data.user.email,
        name: data.user.name,
        url: resetUrl,
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
              emailVerified: true,
            },
          };
        },
      },
    },
  },
});
