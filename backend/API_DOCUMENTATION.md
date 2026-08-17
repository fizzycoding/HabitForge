# 🚀 HabitForge Backend API Documentation

Welcome to the **HabitForge API Documentation**. This guide provides complete details for all API endpoints, including required request bodies, query parameters, access control levels, and sample JSON responses.

---

## 🌐 Base URL & Configuration

- **Development Base URL**: `http://localhost:5000/api`
- **Postman Variable**: `{{baseURL}} = http://localhost:5000`

### 🔑 Authentication Header
All protected endpoints require either an **Authorization Header** or **Cookies**:

```http
Authorization: Bearer {{accessToken}}
```

---

## 📚 Table of Contents
1. [Authentication Endpoints (`/api/auth`)](#1-authentication-endpoints-apiauth)
2. [User Profile Endpoints (`/api/users`)](#2-user-profile-endpoints-apiusers)
3. [Habit Management Endpoints (`/api/habits`)](#3-habit-management-endpoints-apihabits)
4. [Tag Management Endpoints (`/api/tags`)](#4-tag-management-endpoints-apitags)
5. [Gamification & Badges Endpoints (`/api/badges`)](#5-gamification--badges-endpoints-apibadges)
6. [Analytics & Insights Endpoints (`/api/analytics`)](#6-analytics--insights-endpoints-apianalytics)
7. [Payment & Subscription Endpoints (`/api/payment`)](#7-payment--subscription-endpoints-apipayment)

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
Creates a new user account with avatar selection.

- **Method**: `POST`
- **Path**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "avatar": "avatar-01" // Options: 'avatar-01', 'avatar-02', 'avatar-03', 'avatar-04', 'avatar-05'
}
```
- **Response (`201 Created`)**:
```json
{
  "message": "Registration successful! Verification email sent.",
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "uid": "84920481",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatar-01",
    "isEmailVerified": false
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik...",
  "verificationToken": "e5b8d23456789abcdef...",
  "otp": "482910"
}
```

---

### 1.2 Verify Email
Verifies user email using either a 6-digit OTP code or direct token.

- **Method**: `POST`
- **Path**: `/api/auth/verify-email`
- **Access**: Public
- **Request Body**:
```json
{
  "code": "482910" // or "token": "e5b8d23456789abcdef..."
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Email verified successfully!",
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

---

### 1.3 Resend Email Verification
Resends email verification code and link.

- **Method**: `POST`
- **Path**: `/api/auth/resend-verification`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "john@example.com"
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Verification email resent successfully.",
  "verificationToken": "e5b8d23456789abcdef...",
  "otp": "482910"
}
```

---

### 1.4 Forgot Password
Sends password reset email via Resend with a secure reset token link.

- **Method**: `POST`
- **Path**: `/api/auth/forgot-password`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "john@example.com"
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Password reset link sent to your email.",
  "resetToken": "f7a9d23456789abcdef..."
}
```

---

### 1.5 Reset Password
Resets user password using valid token.

- **Method**: `POST`
- **Path**: `/api/auth/reset-password`
- **Access**: Public
- **Request Body**:
```json
{
  "token": "f7a9d23456789abcdef...",
  "newPassword": "brandnewpassword456"
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Password has been reset successfully. You can now log in."
}
```

---

### 1.2 Login User
Authenticates user and returns JWT tokens along with HTTP-only cookies.

- **Method**: `POST`
- **Path**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Logged in successfully",
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatar-01",
    "xp": 140,
    "level": 3,
    "subscription": {
      "plan": "free",
      "status": "active"
    },
    "badges": []
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
}
```

---

### 1.3 Refresh Access Token
Issues a new access token using a valid refresh token.

- **Method**: `POST`
- **Path**: `/api/auth/refresh`
- **Access**: Public (Cookie or Body)
- **Request Body** *(Optional if cookie present)*:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ik..."
}
```

---

### 1.4 Change Password
Allows an authenticated user to change their account password.

- **Method**: `PUT`
- **Path**: `/api/auth/change-password`
- **Access**: Protected
- **Request Body**:
```json
{
  "currentPassword": "password123",
  "newPassword": "newsecretpassword456"
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Password changed successfully"
}
```

---

### 1.5 Update Subscription (Dev Mock)
Manually updates user subscription plan for development testing.

- **Method**: `PATCH`
- **Path**: `/api/auth/subscription`
- **Access**: Protected
- **Request Body**:
```json
{
  "plan": "monthly" // Options: 'free', 'monthly', 'yearly'
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Subscription updated to monthly plan successfully",
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "uid": "84920481",
    "subscription": {
      "plan": "monthly",
      "status": "active",
      "startDate": "2026-08-17T06:00:00.000Z",
      "endDate": "2027-08-17T06:00:00.000Z"
    }
  }
}
```

---

## 2. User Profile Endpoints (`/api/users`)

### 2.1 Get Current User Profile (`/me`)
Fetches the profile of the currently logged-in user with leveling progress.

- **Method**: `GET`
- **Path**: `/api/users/me`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "uid": "84920481",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatar-01",
    "xp": 140,
    "level": 3,
    "progress": {
      "level": 3,
      "currentXP": 140,
      "progressPercentage": 32
    },
    "subscription": {
      "plan": "free",
      "status": "active"
    },
    "badges": []
  }
}
```

---

### 2.2 Update Profile (`/me`)
Updates user name and/or avatar.

- **Method**: `PUT`
- **Path**: `/api/users/me`
- **Access**: Protected
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "avatar": "avatar-03" // Options: 'avatar-01', 'avatar-02', 'avatar-03', 'avatar-04', 'avatar-05'
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "uid": "84920481",
    "name": "Jane Doe",
    "email": "john@example.com",
    "avatar": "avatar-03",
    "xp": 140,
    "level": 3
  }
}
```

---

### 2.3 Get Public Profile by 8-Digit UID (`/:uid`)
Fetches the public profile, level, streak stats, and badges of any user by their 8-digit numerical `uid`.

- **Method**: `GET`
- **Path**: `/api/users/:uid`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "profile": {
    "uid": "84920481",
    "name": "John Doe",
    "avatar": "avatar-01",
    "xp": 140,
    "level": 3,
    "progress": {
      "level": 3,
      "currentXP": 140,
      "progressPercentage": 32
    },
    "stats": {
      "totalCompletions": 28,
      "bestStreak": 7,
      "unlockedBadgesCount": 3
    },
    "badges": [],
    "memberSince": "2026-08-16T09:00:00.000Z"
  }
}
```

---

## 2. Habit Management Endpoints (`/api/habits`)

### 2.1 Create Habit
Creates a new habit for the authenticated user.
> ⚠️ **Free Tier Restriction**: Free users can create a maximum of **5 active habits**.

- **Method**: `POST`
- **Path**: `/api/habits`
- **Access**: Protected
- **Request Body**:
```json
{
  "name": "Daily Reading",
  "description": "Read 20 pages of a book every day",
  "icon": "book-open",
  "color": "#10B981",
  "frequency": "daily" // Options: 'daily', 'weekly'
}
```
- **Response (`201 Created`)**:
```json
{
  "message": "Habit created successfully",
  "habit": {
    "id": "6a818388e4800591190630bc",
    "userId": "6a8176aa8e3150a5403a4d51",
    "name": "Daily Reading",
    "description": "Read 20 pages of a book every day",
    "icon": "book-open",
    "color": "#10B981",
    "frequency": "daily",
    "isArchived": false,
    "createdAt": "2026-08-17T06:10:00.000Z",
    "updatedAt": "2026-08-17T06:10:00.000Z",
    "newlyUnlockedBadges": []
  }
}
```
- **Response (`403 Forbidden` if Free limit exceeded)**:
```json
{
  "message": "Free plan limit reached (maximum 5 active habits). Upgrade to Pro for unlimited habits."
}
```

---

### 2.2 Get All User Habits
Fetches user habits with streak stats and today's completion status.

- **Method**: `GET`
- **Path**: `/api/habits?status=active`
- **Query Params**: `status` (`active` | `archived` | `all`)
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "habits": [
    {
      "id": "6a818388e4800591190630bc",
      "userId": "6a8176aa8e3150a5403a4d51",
      "name": "Daily Reading",
      "description": "Read 20 pages",
      "icon": "book-open",
      "color": "#10B981",
      "frequency": "daily",
      "isArchived": false,
      "isCompletedToday": true,
      "currentStreak": 5,
      "maxStreak": 7,
      "totalCompletions": 12
    }
  ]
}
```

---

### 2.3 Get Habit by ID
Fetches details of a specific habit.

- **Method**: `GET`
- **Path**: `/api/habits/:id`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "habit": {
    "id": "6a818388e4800591190630bc",
    "name": "Daily Reading",
    "isCompletedToday": true,
    "currentStreak": 5,
    "maxStreak": 7,
    "totalCompletions": 12,
    "recentLogs": [
      {
        "dateKey": "2026-08-17",
        "completedAt": "2026-08-17T06:15:00.000Z"
      }
    ]
  }
}
```

---

### 2.4 Get Paginated Habit Completion Logs
Retrieves completion log history for a habit with 50 logs per page.

- **Method**: `GET`
- **Path**: `/api/habits/:id/logs?page=1&limit=50`
- **Query Params**: `page` (default: `1`), `limit` (default: `50`, max: `100`)
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "logs": [
    {
      "id": "66bc9876ef54321098765432",
      "userId": "6a8176aa8e3150a5403a4d51",
      "habitId": "6a818388e4800591190630bc",
      "dateKey": "2026-08-17",
      "completedAt": "2026-08-17T06:15:00.000Z"
    }
  ],
  "pagination": {
    "total": 120,
    "page": 1,
    "limit": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### 2.5 Mark Habit as Complete
Logs completion for today (or a target date), awards XP, updates streaks, and unlocks badges.

- **Method**: `POST`
- **Path**: `/api/habits/:id/complete`
- **Access**: Protected
- **Request Body** *(Optional)*:
```json
{
  "dateKey": "2026-08-17" // Format: YYYY-MM-DD
}
```
- **Response (`201 Created`)**:
```json
{
  "message": "Habit marked as complete!",
  "log": {
    "id": "66bc9876ef54321098765432",
    "habitId": "6a818388e4800591190630bc",
    "dateKey": "2026-08-17",
    "completedAt": "2026-08-17T06:15:00.000Z"
  },
  "xpGained": 20,
  "streak": {
    "currentStreak": 5,
    "maxStreak": 7
  },
  "newlyUnlockedBadges": [
    {
      "id": "66bc9876ef54321098765410",
      "name": "On Fire",
      "description": "Reached a 3-day habit streak",
      "icon": "flame"
    }
  ],
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "xp": 160,
    "level": 3,
    "progress": {
      "level": 3,
      "currentXP": 160,
      "progressPercentage": 48
    }
  }
}
```

---

### 2.6 Undo Habit Completion
Reverts a completed log for a habit.

- **Method**: `POST` or `DELETE`
- **Path**: `/api/habits/:id/uncomplete` or `DELETE /api/habits/:id/complete`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "message": "Habit completion undone successfully",
  "streak": {
    "currentStreak": 4,
    "maxStreak": 7
  },
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "xp": 140,
    "level": 3
  }
}
```

---

### 2.7 Archive & Unarchive Habit
Toggles archive status for a habit.

- **Method**: `PATCH`
- **Path**: `/api/habits/:id/archive` or `/api/habits/:id/unarchive`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "message": "Habit archived successfully",
  "habit": {
    "id": "6a818388e4800591190630bc",
    "isArchived": true
  }
}
```

---

## 3. Tag Management Endpoints (`/api/tags`)

### 3.1 Get All User Tags
Retrieves all tags for the user (automatically seeds default starter tags: Health, Productivity, Fitness, Mindfulness, Finance if empty).

- **Method**: `GET`
- **Path**: `/api/tags`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "tags": [
    {
      "id": "66bc9876ef54321098765999",
      "name": "Health",
      "icon": "heart",
      "color": "#EF4444",
      "isPredefined": true
    },
    {
      "id": "66bc9876ef54321098765998",
      "name": "Morning Routine",
      "icon": "sun",
      "color": "#F59E0B",
      "isPredefined": false
    }
  ]
}
```

---

### 3.2 Create Custom Tag
Creates a custom tag for the user.
> ⚠️ **Free Tier Restriction**: Free users can create a maximum of **5 custom tags**.

- **Method**: `POST`
- **Path**: `/api/tags`
- **Access**: Protected
- **Request Body**:
```json
{
  "name": "Morning Routine",
  "icon": "sun",
  "color": "#F59E0B"
}
```
- **Response (`201 Created`)**:
```json
{
  "message": "Tag created successfully",
  "tag": {
    "id": "66bc9876ef54321098765998",
    "name": "Morning Routine",
    "icon": "sun",
    "color": "#F59E0B",
    "isPredefined": false
  }
}
```

---

### 3.3 Update Tag
Updates details of an existing tag.

- **Method**: `PUT`
- **Path**: `/api/tags/:id`
- **Access**: Protected
- **Request Body**:
```json
{
  "name": "Updated Tag Name",
  "color": "#10B981"
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Tag updated successfully",
  "tag": {
    "id": "66bc9876ef54321098765998",
    "name": "Updated Tag Name",
    "color": "#10B981"
  }
}
```

---

### 3.4 Delete Tag
Deletes a tag and automatically pulls its reference from all habits.

- **Method**: `DELETE`
- **Path**: `/api/tags/:id`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "message": "Tag deleted successfully"
}
```

---

## 4. Gamification & Badges Endpoints (`/api/badges`)

### 3.1 Get User Badges
Retrieves all 19 predefined system badges along with the user's unlock status and timestamps.

- **Method**: `GET`
- **Path**: `/api/badges`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "badges": [
    {
      "id": "66bc9876ef54321098765401",
      "name": "First Step",
      "description": "Completed your very first habit",
      "icon": "footsteps",
      "requirementType": "total_completions",
      "requirementValue": 1,
      "isUnlocked": true,
      "unlockedAt": "2026-08-16T09:30:00.000Z"
    },
    {
      "id": "66bc9876ef54321098765402",
      "name": "Weekly Warrior",
      "description": "Reached a 7-day habit streak",
      "icon": "zap",
      "requirementType": "streak",
      "requirementValue": 7,
      "isUnlocked": false,
      "unlockedAt": null
    }
  ]
}
```

---

### 3.2 Seed Default Badges
Populates system with 19 predefined starter badges if not already present.

- **Method**: `POST`
- **Path**: `/api/badges/seed`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "message": "Predefined badges ensured in database successfully"
}
```

---

## 4. Analytics & Insights Endpoints (`/api/analytics`)

### 4.1 Dashboard Overview Metrics (Free & Pro)
Returns overall stats, today's completion rates, level progress, and active streak counts.

- **Method**: `GET`
- **Path**: `/api/analytics/dashboard` *(or `/overview`)*
- **Access**: Free & Pro
- **Response (`200 OK`)**:
```json
{
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "avatar-01",
    "xp": 140,
    "level": 3,
    "progress": {
      "level": 3,
      "currentXP": 140,
      "xpForCurrentLevel": 100,
      "xpForNextLevel": 225,
      "xpInCurrentLevel": 40,
      "xpNeededForNextLevel": 125,
      "progressPercentage": 32
    }
  },
  "metrics": {
    "totalActiveHabits": 5,
    "totalArchivedHabits": 1,
    "totalCompletions": 28,
    "todayCompletionsCount": 3,
    "todayCompletionRate": 60,
    "activeStreaksCount": 4,
    "bestStreak": 7,
    "unlockedBadgesCount": 3
  }
}
```

---

### 4.2 365-Day Activity Heatmap Grid (🔒 Pro Only)
Returns 365 days of completion activity formatted for GitHub-style heatmap grids.

- **Method**: `GET`
- **Path**: `/api/analytics/heatmap`
- **Access**: Pro Only
- **Response (`200 OK`)**:
```json
{
  "totalCompletions": 769,
  "startDate": "2025-08-17",
  "endDate": "2026-08-17",
  "heatmap": [
    {
      "date": "2026-08-16",
      "count": 5,
      "intensity": 3,
      "dayOfWeek": 0
    },
    {
      "date": "2026-08-17",
      "count": 8,
      "intensity": 4,
      "dayOfWeek": 1
    }
  ]
}
```

---

### 4.3 Monthly Daily Breakdown Report (🔒 Pro Only)
Returns day-by-day statistics and completed habits for **every single day** of a given month.

- **Method**: `GET`
- **Path**: `/api/analytics/monthly-report?month=2026-08`
- **Query Params**: `month` (e.g. `2026-08`, defaults to current month)
- **Access**: Pro Only
- **Response (`200 OK`)**:
```json
{
  "yearMonth": "2026-08",
  "monthName": "August 2026",
  "year": 2026,
  "month": 8,
  "daysInMonth": 31,
  "summary": {
    "totalCompletionsInMonth": 48,
    "activeHabitsCount": 5,
    "perfectDaysCount": 6,
    "averageDailyCompletions": 1.5
  },
  "days": [
    {
      "date": "2026-08-01",
      "dayNumber": 1,
      "dayOfWeek": "Saturday",
      "completedCount": 3,
      "totalActiveHabits": 5,
      "completionRate": 60,
      "isPerfectDay": false,
      "completedHabits": [
        {
          "id": "6a818388e4800591190630bc",
          "name": "Daily Reading",
          "color": "#10B981",
          "icon": "book-open",
          "completedAt": "2026-08-01T09:30:00.000Z"
        }
      ]
    }
  ]
}
```

---

### 4.4 Monthly Chart Analysis (Past 12 Months) (🔒 Pro Only)
Returns month-by-month trends for line or bar charts over the past 12 months.

- **Method**: `GET`
- **Path**: `/api/analytics/monthly`
- **Access**: Pro Only
- **Response (`200 OK`)**:
```json
{
  "monthlyData": [
    {
      "yearMonth": "2026-08",
      "label": "Aug 2026",
      "month": "Aug",
      "year": 2026,
      "totalCompletions": 92,
      "activeHabitsCount": 5,
      "completionRate": 59
    }
  ]
}
```

---

## 5. Payment & Subscription Endpoints (`/api/payment`)

### 5.1 Get Razorpay Public Key
Retrieves the Razorpay Key ID for initializing checkout in the frontend.

- **Method**: `GET`
- **Path**: `/api/payment/key`
- **Access**: Protected
- **Response (`200 OK`)**:
```json
{
  "keyId": "rzp_test_key_id"
}
```

---

### 5.2 Create Razorpay Order
Generates an official Razorpay Order ID for upgrading to a Pro Plan.

- **Method**: `POST`
- **Path**: `/api/payment/create-order`
- **Access**: Protected
- **Request Body**:
```json
{
  "plan": "monthly" // Options: 'monthly' (₹199), 'yearly' (₹1499)
}
```
- **Response (`201 Created`)**:
```json
{
  "orderId": "order_P1x9K3j8L",
  "amount": 19900,
  "currency": "INR",
  "keyId": "rzp_test_key_id",
  "plan": "monthly",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

### 5.3 Verify Razorpay Payment Signature
Validates Razorpay HMAC SHA256 signature and activates Pro plan upon success.

- **Method**: `POST`
- **Path**: `/api/payment/verify`
- **Access**: Protected
- **Request Body**:
```json
{
  "razorpay_order_id": "order_P1x9K3j8L",
  "razorpay_payment_id": "pay_9876543210",
  "razorpay_signature": "e5b8d23456789abcdef...",
  "plan": "monthly"
}
```
- **Response (`200 OK`)**:
```json
{
  "message": "Payment verified successfully! You are now subscribed to HabitForge MONTHLY Plan.",
  "user": {
    "id": "6a8176aa8e3150a5403a4d51",
    "name": "John Doe",
    "email": "john@example.com",
    "subscription": {
      "plan": "monthly",
      "status": "active",
      "startDate": "2026-08-17T06:00:00.000Z",
      "endDate": "2026-09-17T06:00:00.000Z"
    }
  }
}
```
