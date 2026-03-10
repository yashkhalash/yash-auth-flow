![yash-auth-flow logo](https://unpkg.com/yash-auth-flow@latest/assets/yash-auth-flow.png)

# yash-auth-flow (Auth Forge)

[![npm version](https://img.shields.io/npm/v/yash-auth-flow.svg?style=flat-square)](https://www.npmjs.com/package/yash-auth-flow)
[![npm downloads](https://img.shields.io/npm/dm/yash-auth-flow.svg?style=flat-square)](https://www.npmjs.com/package/yash-auth-flow)
[![license](https://img.shields.io/npm/l/yash-auth-flow.svg?style=flat-square)](https://www.npmjs.com/package/yash-auth-flow)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

A production-ready, high-performance multi-account authentication library (Auth Forge) for Node.js, Express, Prisma, and PostgreSQL. Designed for scalability and ease of use, `yash-auth-flow` provides a complete, secure authentication solution  out-of-the-box..

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Multi-Account Logic](#multi-account-logic)
- [Security](#security)
- [Keywords](#keywords)

## Features

- **Multi-Account Support**: Manage multiple account types (e.g., Personal, Work) under a single User identity.
- **Dynamic Verification**: Built-in support for 6-digit OTP and UUID-based email verification links.
- **Security First**: Pre-configured with Helmet, Express Rate Limit, and Bcrypt (12 rounds).
- **JWT Based**: Modern access and refresh token management.
- **Prisma Integration**: Ships with a ready-to-use Prisma schema.
- **Email Templates**: Sleek, ready-to-send HTML templates for verification.
- **Verification Preference**: Users can choose their preferred verification type (`OTP` or `LINK`) via their profile, falling back to system defaults.

## Installation

```bash
npm install yash-auth-flow
```

## Quick Start

### 1. Setup Prisma
Copy the provided schema from `prisma/schema.prisma` to your project and run:
```bash
npx prisma db push
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```env
DATABASE_URL="postgresql://..."
ACCESS_TOKEN_SECRET="your-secret"
REFRESH_TOKEN_SECRET="your-secret"
```

### 3. Usage Example

```typescript
import { AuthService, authMiddleware, UserService } from 'yash-auth-flow';
import express from 'express';

const app = express();
app.use(express.json());

// Registration
app.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  const result = await AuthService.register(email, password, fullName);
  res.json(result);
});

// Protected Route
app.get('/profile', authMiddleware, (req: any, res) => {
  res.json({ user: req.user, account: req.account });
});

// Edit Profile (Change Verification Type)
app.put('/profile/edit', authMiddleware, async (req: any, res) => {
  const { verificationType } = req.body;
  const result = await UserService.editProfile(req.user.id, { verificationType });
  res.json(result);
});

app.listen(3000);
```

## Multi-Account Logic
`yash-auth-flow` allows a `User` to have multiple `Accounts`. For example:
- A user can login with `type: "personal"`
- Later, they can create or link an account with `type: "work"`
- Both accounts belong to the same `User.id`, allowing shared profiles or settings.

## Security

`yash-auth-flow` follows security best practices:
- **Password Hashing**: Uses `bcrypt` with 12 salt rounds by default.
- **Rate Limiting**: Protects against brute-force attacks via `express-rate-limit`.
- **Header Security**: Includes `helmet` for secure HTTP headers.
- **JWT Best Practices**: Secure token signing (HS256) and refresh rotation.

## Keywords

`auth`, `authentication`, `prisma`, `jwt`, `multi-account`, `otp`, `node`, `express`, `security`, `postgresql`, `auth-flow`, `login`, `signup`, `session`, `authorize`, `postgres`, `auth-forge`, `backend`, `rest-api`, `user-management`, `access-token`, `refresh-token`, `session-management`, `signup-logic`, `login-logic`, `rbac`, `secure-auth`, `auth-library`
