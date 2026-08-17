import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { auth } from './lib/auth.js';
import userRoutes from './routes/user.routes.js';
import habitRoutes from './routes/habit.routes.js';
import badgeRoutes from './routes/badge.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import tagRoutes from './routes/tag.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

// Connect DB before mounting auth handler
await connectDB();

// Mount BetterAuth handler for /api/auth/*
app.all('/api/auth/*', toNodeHandler(auth.handler));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/tags', tagRoutes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
