import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Habit } from '../models/Habit.js';
import { HabitLog } from '../models/HabitLog.js';
import { Tag } from '../models/Tag.js';
import { ensureBadgesSeeded, checkHabitBadge, checkHabitCompleteBadge, checkStreakBadge, checkLevelBadge } from './badge.service.js';
import { calculateXP, calculateLevel, calculateStreak } from '../utils/gamification.js';
import { auth } from '../lib/auth.js';

export const DEMO_USER_EMAIL = 'demo@habitforge.com';
export const DEMO_USER_PASSWORD = 'demo123456';

export async function seedDemoUser() {
  console.log('🌱 Starting Demo User Database Seeding (3 Months History)...');

  try {
    // 1. Ensure predefined badges exist
    console.log('Step 1: Ensuring predefined badges...');
    await ensureBadgesSeeded();

    // 2. Find or create Demo User via Better-Auth
    console.log('Step 2: Ensuring Demo User in Better-Auth...');
    let demoUser = await User.findOne({ email: DEMO_USER_EMAIL });

    if (demoUser) {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('user').deleteMany({ email: DEMO_USER_EMAIL });
        await db.collection('account').deleteMany({ userId: demoUser._id.toString() });
        await db.collection('session').deleteMany({ userId: demoUser._id.toString() });
      }
    }

    // Register Demo User using Better-Auth API so password hash matches signInEmail 100%
    try {
      await auth.api.signUpEmail({
        body: {
          name: 'Demo User',
          email: DEMO_USER_EMAIL,
          password: DEMO_USER_PASSWORD,
        },
      });
    } catch (authErr) {
      console.log('Better-Auth signUp notice:', authErr);
    }

    demoUser = await User.findOne({ email: DEMO_USER_EMAIL });
    if (!demoUser) {
      throw new Error('Failed to create Demo User with Better-Auth');
    }

    // Update demo user attributes
    await User.findByIdAndUpdate(demoUser._id, {
      avatar: 'avatar-01',
      emailVerified: true,
      subscription: {
        plan: 'yearly',
        status: 'active',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    });

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

    // 6. Generate 90 Days of Dynamic Fluctuation Logs
    console.log('Step 6: Generating 90 Days of Dynamic Logs...');
    let totalXPAcc = 0;
    const now = new Date();
    const habitLogsToInsert: any[] = [];
    const habitStreakMap = new Map<string, number>();

    createdHabits.forEach((h) => habitStreakMap.set(h._id.toString(), 0));

    for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
      const logDate = new Date(now);
      logDate.setDate(logDate.getDate() - dayOffset);
      const dateKey = logDate.toISOString().split('T')[0];
      const dayOfWeek = logDate.getDay();

      for (let hIdx = 0; hIdx < createdHabits.length; hIdx++) {
        const habit = createdHabits[hIdx];
        const habitId = habit._id.toString();

        let isCompleted = false;

        if (hIdx === 0) {
          // Water: almost daily except occasional miss
          isCompleted = (dayOffset % 11 !== 3);
        } else if (hIdx === 1) {
          // Meditation: 4-5 day runs
          isCompleted = (dayOffset % 6 !== 2);
        } else if (hIdx === 2) {
          // Read 30 Mins: 3 day runs with gaps
          isCompleted = (dayOffset % 5 !== 1);
        } else if (hIdx === 3) {
          // Gym: Mon, Wed, Fri + occasional Saturday
          isCompleted = dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5 || (dayOfWeek === 6 && dayOffset % 2 === 0);
        } else if (hIdx === 4) {
          // Code: Weekdays high, weekend lower
          isCompleted = dayOfWeek >= 1 && dayOfWeek <= 5 ? (dayOffset % 7 !== 0) : (dayOffset % 3 === 0);
        } else {
          // Healthy Meal: varies with 2-3 day runs
          isCompleted = (dayOffset % 4 !== 2);
        }

        // Guarantee active streaks for today and yesterday for core habits
        if (dayOffset <= 1) {
          if (hIdx === 0 || hIdx === 1 || hIdx === 2 || hIdx === 4) {
            isCompleted = true;
          }
        }

        if (isCompleted) {
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

    console.log(`✅ Demo User Seeded Successfully via Better-Auth!`);
    console.log(`👤 Email: ${DEMO_USER_EMAIL}`);
    console.log(`🔑 Password: ${DEMO_USER_PASSWORD}`);
    console.log(`🆔 UID: ${demoUser.uid}`);
    console.log(`📊 Habits: ${createdHabits.length}`);
    console.log(`🔥 Total Logs (3 Months): ${habitLogsToInsert.length}`);
    console.log(`⭐ Total XP: ${totalXPAcc} | Level: ${finalLevel}`);

    return {
      email: DEMO_USER_EMAIL,
      password: DEMO_USER_PASSWORD,
      uid: demoUser.uid,
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
