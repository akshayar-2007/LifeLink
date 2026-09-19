# 🩸 LifeLink — Blood Donor Finder

> A real-time emergency blood donor platform built with the MERN stack. LifeLink connects recipients with nearby donors instantly using location-based matching and automated email notifications.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [API Routes](#api-routes)
- [Pages & Navigation](#pages--navigation)
- [Contributing](#contributing)

---

## Overview

LifeLink is a full-stack web application designed to bridge the critical gap between blood donors and recipients during emergencies. The platform uses **MongoDB geospatial queries** to surface the nearest available donors in real time, and fires **parallel email notifications** to minimise response time.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 JWT Authentication | Secure login/register with token-based sessions |
| 👥 Role-Based Access | Separate donor and recipient roles with protected routes |
| 📍 Location-Based Search | Find nearby donors using MongoDB `$near` geospatial queries |
| 🚨 Emergency Requests | Submit urgent blood requests that alert matching donors |
| 📧 Email Notifications | Automated parallel emails via Nodemailer |
| 🔔 In-App Notifications | Real-time notification feed for donors and recipients |
| 🛡️ Rate Limiting | API protection against abuse with `express-rate-limit` |
| 📱 Responsive UI | Mobile-friendly interface built with Tailwind CSS |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI library
- **React Router v7** — Client-side routing
- **Tailwind CSS 3** — Utility-first styling
- **Axios** — HTTP client

### Backend
- **Node.js / Express** — REST API server
- **MongoDB / Mongoose** — Database with geospatial indexing
- **JSON Web Tokens (JWT)** — Authentication
- **bcryptjs** — Password hashing
- **Nodemailer** — Email notifications
- **express-rate-limit** — API rate limiting

---

## 📁 Project Structure

```
LifeLink/
├── client/                   # React frontend
│   ├── public/
│   └── src/
│       ├── components/       # Reusable UI components (Navbar, Toast, ProtectedRoute, etc.)
│       ├── context/          # Auth context (global state)
│       ├── pages/            # Page-level components
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── SearchDonors.jsx
│       │   ├── EmergencyRequest.jsx
│       │   ├── Profile.jsx
│       │   ├── Notifications.jsx
│       │   └── NotFound.jsx
│       └── utils/
│
└── server/                   # Express backend
    ├── config/               # MongoDB connection
    ├── middleware/           # Auth middleware
    ├── models/               # Mongoose schemas
    │   ├── User.js
    │   ├── Request.js
    │   └── Notification.js
    ├── routes/               # API route handlers
    │   ├── auth.js
    │   ├── donors.js
    │   ├── requests.js
    │   └── notifications.js
    ├── utils/                # Helper utilities (e.g., email sender)
    └── index.js              # App entry point
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) >= 18.0.0
- [npm](https://www.npmjs.com/)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB)

---

### Environment Variables

#### `server/.env`

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=5000
FRONTEND_URL=http://localhost:3000
```

> **Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833), not your regular account password.

#### `client/src/.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/LifeLink.git
cd LifeLink
```

**2. Install server dependencies**

```bash
cd server
npm install
```

**3. Install client dependencies**

```bash
cd ../client
npm install
```

---

### Running the App

**Start the backend server**

```bash
cd server
npm run dev       # Development (nodemon)
# or
npm start         # Production
```

**Start the frontend** (in a separate terminal)

```bash
cd client
npm start
```

The app will be available at:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`

---

## 🔌 API Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| `GET` | `/` | Health check | ❌ |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Log in and receive JWT | ❌ |
| `GET` | `/api/donors` | Search nearby donors | ✅ |
| `POST` | `/api/requests` | Create an emergency request | ✅ |
| `GET` | `/api/requests` | Get all requests | ✅ |
| `GET` | `/api/notifications` | Get user notifications | ✅ |
| `PATCH` | `/api/notifications/:id` | Mark notification as read | ✅ |

---

## 🗺️ Pages & Navigation

| Route | Page | Access |
|-------|------|--------|
| `/` | Home — Landing page | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | User dashboard | 🔒 Protected |
| `/search` | Search nearby donors | 🔒 Protected |
| `/request` | Submit emergency request | 🔒 Protected |
| `/profile` | Manage your profile | 🔒 Protected |
| `/notifications` | View notifications | 🔒 Protected |
| `*` | 404 Not Found | Public |

---

## 🤝 Contributing

1. Fork the repository
2. Create a new feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

<p align="center">Made with ❤️ to save lives</p>

