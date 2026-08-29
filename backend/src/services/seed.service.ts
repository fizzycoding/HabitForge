import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { Tag } from '../models/Tag.js';
import { ensureBadgesSeeded, checkHabitBadge, checkHabitCompleteBadge, checkStreakBadge, checkLevelBadge } from './badge.service.js';
import { calculateXP, calculateLevel, calculateStreak } from '../utils/gamification.js';
import { generateUniqueUID } from '../utils/uid.js';

export const DEMO_USER_EMAIL = 'demo@habitforge.com';
export const DEMO_USER_PASSWORD = 'demo123456';

export async function seedDemoUser() {
  console.log('🌱 Starting Demo User Database Seeding (3 Months History)...');

  try {
    // 1. Ensure predefined badges exist
    console.log('Step 1: Ensuring predefined badges...');
    await ensureBadgesSeeded();

    // 2. Find or create Demo User
    console.log('Step 2: Finding or creating Demo User...');
    let demoUser = await User.findOne({ email: DEMO_USER_EMAIL });

    if (!demoUser) {
      const uid = await generateUniqueUID();
      demoUser = await User.create({
        name: 'Demo User',
        email: DEMO_USER_EMAIL,
        uid,
        avatar: 'avatar-01',
        xp: 0,
        level: 1,
        emailVerified: true,
        subscription: {
          plan: 'yearly',
          status: 'active',
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      });

      const hashedPassword = await bcrypt.hash(DEMO_USER_PASSWORD, 10);
      const db = mongoose.connection.db;
      if (db) {
        const accountCollection = db.collection('account');
        await accountCollection.updateOne(
          { userId: demoUser._id.toString(), providerId: 'credential' },
          {
            $set: {
              id: new mongoose.Types.ObjectId().toString(),
              userId: demoUser._id.toString(),
              accountId: DEMO_USER_EMAIL,
              providerId: 'credential',
              password: hashedPassword,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    } else {
      const hashedPassword = await bcrypt.hash(DEMO_USER_PASSWORD, 10);
      const db = mongoose.connection.db;
      if (db) {
        const accountCollection = db.collection('account');
        await accountCollection.updateOne(
          { userId: demoUser._id.toString(), providerId: 'credential' },
          {
            $set: {
              id: new mongoose.Types.ObjectId().toString(),
              userId: demoUser._id.toString(),
              accountId: DEMO_USER_EMAIL,
              providerId: 'credential',
              password: hashedPassword,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }
    }

    const userId = demoUser._id.toString();

    // 3. Clear existing habits & logs for Demo User
    console.log('Step 3: Cleaning old habits & logs...');
    await Habit.deleteMany({ userId });
    await HabitLog.deleteMany({ userId });

    // 4. Create Tags
    console.log('Step 4: Creating Tags...');
    const tagData = [
      { name: 'Fitness', color: '#EF4444' },
      { name: 'Productivity', color: '#3B82F6' },
      { name: 'Mindfulness', color: '#10B981' },
      { name: 'Health', color: '#06B6D4' },
      { name: 'Coding', color: '#8B5CF6' },
    ];

    const tags = [];
    for (const t of tagData) {
      let tagDoc = await Tag.findOne({ userId, name: t.name });
      if (!tagDoc) {
        tagDoc = await Tag.create({ userId, ...t });
      }
      tags.push(tagDoc);
    }

    const tagMap = new Map(tags.map((t) => [t.name, t._id]));

    // 5. Create 6 Core Habits
    console.log('Step 5: Creating Habits...');
    const habitDefinitions = [
      { name: 'Morning Gym & Workout', description: '30 mins strength or cardio training', icon: 'dumbbell', color: '#EF4444', frequency: 'daily', tag: 'Fitness' },
      { name: 'Read 30 Mins Daily', description: 'Non-fiction or technical book reading', icon: 'book', color: '#3B82F6', frequency: 'daily', tag: 'Productivity' },
      { name: '15 Min Meditation', description: 'Mindful breathing & focus exercises', icon: 'sparkles', color: '#10B981', frequency: 'daily', tag: 'Mindfulness' },
      { name: 'Drink 3 Liters Water', description: 'Stay hydrated throughout the day', icon: 'droplet', color: '#06B6D4', frequency: 'daily', tag: 'Health' },
      { name: 'Code Side Project', description: 'Commit code to open-source or app', icon: 'code', color: '#8B5CF6', frequency: 'daily', tag: 'Coding' },
      { name: 'Healthy Meal & Zero Sugar', description: 'Eat whole foods and avoid processed sugar', icon: 'heart', color: '#F59E0B', frequency: 'daily', tag: 'Health' },
    ];

    const createdHabits: any[] = [];
    for (const hDef of habitDefinitions) {
      const tagId = tagMap.get(hDef.tag);
      const habit = await Habit.create({
        userId,
        name: hDef.name,
        description: hDef.description,
        icon: hDef.icon,
        color: hDef.color,
        frequency: hDef.frequency as 'daily' | 'weekly',
        tags: tagId ? [tagId] : [],
      });
      createdHabits.push(habit);
    }

    // 6. Generate 90 Days of Logs
    console.log('Step 6: Generating 90 Days of Logs...');
    let totalXPAcc = 0;
    const now = new Date();
    const habitLogsToInsert: any[] = [];
    const habitStreakMap = new Map<string, number>();

    createdHabits.forEach((h) => habitStreakMap.set(h._id.toString(), 0));

    for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
      const logDate = new Date(now);
      logDate.setDate(logDate.getDate() - dayOffset);
      const dateKey = logDate.toISOString().split('T')[0];

      for (let hIdx = 0; hIdx < createdHabits.length; hIdx++) {
        const habit = createdHabits[hIdx];
        const habitId = habit._id.toString();

        const isRecent35Days = dayOffset <= 35;
        const isRestDay = !isRecent35Days && (dayOffset % 7 === (hIdx % 5));

        if (isRecent35Days || !isRestDay) {
          const currentStreak = (habitStreakMap.get(habitId) || 0) + 1;
          habitStreakMap.set(habitId, currentStreak);

          const xp = calculateXP(currentStreak);
          totalXPAcc += xp;

          habitLogsToInsert.push({
            userId: new mongoose.Types.ObjectId(userId),
            habitId: habit._id,
            dateKey,
            xpGranted: true,
            completedAt: logDate,
            createdAt: logDate,
            updatedAt: logDate,
          });
        } else {
          habitStreakMap.set(habitId, 0);
        }
      }
    }

    if (habitLogsToInsert.length > 0) {
      await HabitLog.insertMany(habitLogsToInsert);
    }

    // 7. Update User XP & Level
    console.log('Step 7: Updating User XP & Level...');
    const finalLevel = calculateLevel(totalXPAcc);
    await User.findByIdAndUpdate(userId, {
      xp: totalXPAcc,
      level: finalLevel,
    });

    // 8. Award Badges
    console.log('Step 8: Calculating Streaks & Awarding Badges...');
    let maxStreakAcrossHabits = 0;
    for (const habit of createdHabits) {
      const logs = await HabitLog.find({ userId, habitId: habit._id }).select('dateKey');
      const { maxStreak } = calculateStreak(logs.map((l) => l.dateKey));
      if (maxStreak > maxStreakAcrossHabits) {
        maxStreakAcrossHabits = maxStreak;
      }
    }

    await checkHabitBadge(userId);
    await checkHabitCompleteBadge(userId);
    await checkStreakBadge(userId, maxStreakAcrossHabits);
    await checkLevelBadge(userId, finalLevel);

    console.log(`✅ Demo User Seeded Successfully!`);
    console.log(`👤 Email: ${DEMO_USER_EMAIL}`);
    console.log(`🔑 Password: ${DEMO_USER_PASSWORD}`);
    console.log(`📊 Habits: ${createdHabits.length}`);
    console.log(`🔥 Total Logs (3 Months): ${habitLogsToInsert.length}`);
    console.log(`⭐ Total XP: ${totalXPAcc} | Level: ${finalLevel}`);

    return {
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
      totalHabits: createdHabits.length,
      totalLogs: habitLogsToInsert.length,
      totalXP: totalXPAcc,
      level: finalLevel,
      maxStreak: maxStreakAcrossHabits,
    };
  } catch (err) {
    console.error('❌ Error during seedDemoUser:', err);
    throw err;
  }
}
