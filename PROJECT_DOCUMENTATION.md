# Budget Buddy - Complete Project Report & Technical Documentation

**Project Name:** Budget Buddy (Personal Budget & Expense Management System)  
**Architecture:** MERN Stack (MongoDB, Express.js, React, Node.js)  
**Repository:** [https://github.com/hariharan-1607/budget-buddy.git](https://github.com/hariharan-1607/budget-buddy.git)  
**Author:** Hariharan  
**Documentation Version:** 2.0 (Updated with MongoDB Integration & Persistent Auth)

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack & Rationale](#3-technology-stack--rationale)
4. [Project File Structure](#4-project-file-structure)
5. [End-to-End Data Flow](#5-end-to-end-data-flow)
6. [Authentication & Session Persistence](#6-authentication--session-persistence)
7. [Database Guide: Local vs Cloud MongoDB](#7-database-guide-local-vs-cloud-mongodb)
8. [Comprehensive Interview & Viva Questions & Answers](#8-comprehensive-interview--viva-questions--answers)
9. [Future Roadmap & Recommended Improvements](#9-future-roadmap--recommended-improvements)
10. [Local Development & Setup Instructions](#10-local-development--setup-instructions)

---

## 1. Executive Summary

**Budget Buddy** is a modern, responsive fullstack web application designed to give users complete control over their personal finances. Users can register securely, log into their accounts, set customized budget caps for different spending categories (e.g., Groceries, Rent, Vacation, Entertainment), track expenses against these budgets in real time, and view remaining balances dynamically.

All data is persistently stored in **MongoDB** through a secure **Express REST API** backend featuring **Bcrypt** password hashing and **JSON Web Token (JWT)** session authorization.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER (React SPA)                        │
│                                                                        │
│   React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons           │
│   ├── Context: AuthContext (Manages User Session & LocalStorage Token) │
│   ├── Router: React Router DOM (Protected & Public Routes)             │
│   └── Pages: Home, Login, Signup, Dashboard                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ HTTP Requests (JSON)
                                    │ Proxied via Vite (/api/*)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SERVER TIER (Express API)                       │
│                                                                        │
│   Node.js + Express.js                                                 │
│   ├── CORS & express.json Middleware                                   │
│   ├── authMiddleware: JWT Verification & Extraction                    │
│   ├── /api/auth: Signup, Login, Profile (/me)                          │
│   └── /api/budgets: CRUD for Budgets & Expenses                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Mongoose ODM
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATABASE TIER (MongoDB)                         │
│                                                                        │
│   Collections:                                                         │
│   ├── users: { id, name, email, password (hashed), timestamps }        │
│   └── budgets: { id, userId, name, totalAmount, expenses: [...] }     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack & Rationale

### Frontend
| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **React 18** | UI Library | Component-driven model, high rendering performance via Virtual DOM, declarative UI updates. |
| **TypeScript** | Language | Enforces strict type safety for data contracts (User, Budget, Expense), reducing runtime bugs. |
| **Vite** | Build Tool & Dev Server | Lightning-fast Hot Module Replacement (HMR) and built-in reverse proxy eliminating CORS friction. |
| **Tailwind CSS** | Styling | Utility-first styling framework enabling rapid, highly-responsive, clean design without bloated CSS. |
| **Framer Motion** | Micro-Animations | Smooth card hover elevations, modal entrances, and page transitions for a premium UX feel. |
| **Lucide React** | Icons | Lightweight, tree-shakeable SVG icons for intuitive financial actions (`IndianRupee`, `Plus`, `Trash2`, `Edit2`, `Eye`, `EyeOff`). |
| **React Router v6** | Client Routing | Declarative routing with protected route guards preventing unauthorized dashboard access. |

### Backend & Database
| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **Node.js** | Runtime | Event-driven, non-blocking asynchronous I/O ideal for handling multiple concurrent REST calls. |
| **Express.js** | Web Framework | Minimalist, unopinionated routing framework for cleanly mounting RESTful micro-endpoints. |
| **MongoDB** | Database | NoSQL document database. Naturally handles nested arrays (expenses inside budgets) in a single document. |
| **Mongoose** | ODM | Elegant object modeling for MongoDB: schema validation, pre-save hooks, and virtual transforms. |
| **Bcryptjs** | Security | Cryptographic one-way salted password hashing protecting passwords against rainbow table attacks. |
| **JSON Web Tokens (JWT)**| Auth Protocol | Stateless, signed authorization tokens eliminating the overhead of server-side session memory. |
| **dotenv** | Config | Isolates sensitive variables (database URIs, ports, secrets) into `.env` files outside Git. |

---

## 4. Project File Structure

```
budget-sample/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection with error handling
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT extraction & verification guard
│   ├── models/
│   │   ├── Budget.js             # Budget & embedded Expense Mongoose schema
│   │   └── User.js               # User schema with pre-save bcrypt hashing hook
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints (signup, login, me)
│   │   └── budgetRoutes.js       # /api/budgets CRUD endpoints
│   ├── .env                      # Environment variables (ignored by Git)
│   ├── .env.example              # Sample environment template
│   ├── package.json              # Backend dependencies and startup scripts
│   └── server.js                 # Express server entry point & CORS configuration
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Navigation header with Auth conditional links
│   │   │   └── Footer.tsx        # Global footer
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Global authentication state, JWT storage & session restoration
│   │   ├── lib/
│   │   │   └── supabase.ts       # Neutralized stub to eliminate missing-variable crashes
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Landing page introducing features
│   │   │   ├── Login.tsx         # User login form with error alerts & toggle password
│   │   │   ├── Signup.tsx        # Registration form with password validation rules
│   │   │   └── Dashboard.tsx     # Budget management, expense logging, and balance calculation
│   │   ├── App.tsx               # Route configurations and ProtectedRoute guard
│   │   ├── main.tsx              # React DOM mounting entry
│   │   └── index.css             # Tailwind base and utility directives
│   ├── .env                      # Frontend environment variable (VITE_API_URL=/api)
│   ├── package.json              # Frontend dependencies
│   └── vite.config.ts            # Vite build configuration and /api reverse proxy
├── package.json                  # Root npm scripts (npm run backend, npm run frontend)
├── .gitignore                    # Prevents node_modules, logs, and .env leaks
├── README.md                     # Project overview
└── PROJECT_DOCUMENTATION.md      # Comprehensive technical documentation & viva guide
```

---

## 5. End-to-End Data Flow

### 1. User Registration Flow
1. User enters Full Name, Email, and Password on `/signup`.
2. Client validates password criteria (min 8 chars, 1 uppercase, 1 special character).
3. Client dispatches `POST /api/auth/signup`.
4. Express checks if email is already taken.
5. Password is automatically hashed with 10 salt rounds by Mongoose's `pre-save` hook.
6. New user document is saved in MongoDB.
7. Backend signs a 30-day JWT token and sends `{ token, user }`.
8. `AuthContext` caches `token` and `user` in `localStorage` and redirects to `/dashboard`.

### 2. User Login Flow
1. User inputs email and password on `/login`.
2. Client sends `POST /api/auth/login`.
3. Backend queries MongoDB for user by email.
4. `bcrypt.compare()` compares the plain text password with the stored hash.
5. If valid, signs a new JWT token and returns `{ token, user }`.
6. Client updates state and opens the Dashboard.

### 3. Budget & Expense Management Flow
1. **Fetch Budgets:** Dashboard triggers `GET /api/budgets` with `Authorization: Bearer <token>`.
2. `authMiddleware` validates JWT and attaches `req.user = { userId }`.
3. Server executes `Budget.find({ userId }).sort({ createdAt: -1 })`.
4. Returns all budgets with their embedded expenses.
5. **Add Budget:** Client sends `POST /api/budgets` with `{ name, totalAmount }`. A new document is saved in MongoDB with an empty expenses array.
6. **Add Expense:** Client sends `POST /api/budgets/:budgetId/expenses` with `{ category, amount, description }`. The expense is appended to the budget's `expenses` array in MongoDB via an atomic update.
7. **Calculate Balance:** The client computes total spent (`reduce`) and remaining budget (`totalAmount - totalExpenses`).

---

## 6. Authentication & Session Persistence

### Why Websites Stay Logged In
Traditional simple projects often log the user out after a few minutes or upon a single page refresh. In **Budget Buddy**, authentication has been engineered to mirror commercial production platforms:

1. **30-Day Token Lifespan:**  
   In `backend/routes/authRoutes.js`, the token is issued with `expiresIn: "30d"`. The token remains valid for an entire month without requiring repetitive logins.

2. **Instant State Hydration from `localStorage`:**  
   When the user opens the website, `AuthContext` immediately loads the cached user profile from `localStorage.getItem('user')`. This prevents the "blank white flash" or "Authenticating..." loading screen.

3. **Background Token Verification (`/api/auth/me`):**  
   In the background, `AuthContext` calls `/api/auth/me` to ensure the token is still valid.

4. **Resilient Error Handling:**  
   The user is **only logged out if the server returns HTTP 401 Unauthorized** (token genuinely expired or revoked). If there is a temporary network glitch or server restart, the session is **preserved** rather than wiped.

---

## 7. Database Guide: Local vs Cloud MongoDB

### Current Status
Your project is currently operating on a **Local MongoDB Service** installed on your system:
```text
mongodb://localhost:27017/budgetbuddy
```

---

### Step-by-Step Migration to Cloud Database (MongoDB Atlas)

Migrating to MongoDB Atlas allows your database to live in the cloud, enabling you to deploy your project to Vercel, Render, Railway, or AWS.

#### Step 1: Create a Free MongoDB Atlas Account
1. Visit [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2. Under "Deployments", click **Create Deployment**.
3. Choose the **M0 Free** shared tier.
4. Select a cloud provider (AWS or Google Cloud) and region closest to you (e.g. `Mumbai - ap-south-1`).
5. Click **Create Deployment**.

#### Step 2: Configure Database User Credentials
1. In the Security setup modal:
   - Enter a **Username** (e.g., `budgetAdmin`).
   - Enter a **Password** (e.g., `SecurePass2026!`). Keep note of this password.
2. Click **Create Database User**.

#### Step 3: Configure Network Access (IP Whitelist)
1. Go to **Network Access** in the left sidebar.
2. Click **Add IP Address**.
3. Select **Allow Access from Anywhere** (`0.0.0.0/0`) so both your computer and deployment platforms can connect.
4. Click **Confirm**.

#### Step 4: Obtain Your Connection String
1. Go to **Database** -> Click **Connect**.
2. Select **Drivers** -> Driver: `Node.js`.
3. Copy the connection string:
   ```text
   mongodb+srv://budgetAdmin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=BudgetCluster
   ```

#### Step 5: Update Your Project Configuration
1. Open `backend/.env`.
2. Comment out the local MongoDB URI and paste your cloud URI (specifying the database name `budgetbuddy` before the query string):
   ```ini
   # MONGO_URI=mongodb://localhost:27017/budgetbuddy
   MONGO_URI=mongodb+srv://budgetAdmin:SecurePass2026!@cluster0.abcde.mongodb.net/budgetbuddy?retryWrites=true&w=majority
   ```
3. Restart your backend server (`npm run start`).
4. Look for the confirmation in your terminal:
   ```text
   ✅ MongoDB Connected: cluster0-shard-00-00.../budgetbuddy
   ```
From this point forward, all data will be synchronized in the cloud!

---

## 8. Comprehensive Interview & Viva Questions & Answers

### Architecture & Technology Stack

#### Q1. What architecture does this application follow?
> **Answer:** It follows a **Three-Tier MERN Architecture**:
> 1. **Presentation Tier:** React SPA (Single Page Application) built with TypeScript and Vite.
> 2. **Application Tier:** Node.js with Express.js exposing stateless RESTful endpoints.
> 3. **Data Tier:** MongoDB document database managed via Mongoose ODM.

#### Q2. Why did you choose React with Vite over Create React App (CRA) or Next.js?
> **Answer:** 
> - **Over CRA:** Create React App is deprecated by the React team. Vite uses native ES modules (ESM) in development, making server start and hot reloading instantaneous (milliseconds vs minutes with Webpack).
> - **Over Next.js:** For an authenticated single-page dashboard where SEO is not a priority, a client-side rendered SPA with a separate Express API provides clearer separation of concerns and easier deployment flexibility.

#### Q3. Why use TypeScript instead of standard JavaScript?
> **Answer:** TypeScript provides compile-time type validation. In financial applications, tracking exact types for money (numbers vs strings) and object structures (Budget vs Expense) prevents common runtime bugs like `"1000" + "500" = "1000500"`.

---

### Database & MongoDB

#### Q4. Why choose MongoDB over a relational database like MySQL or PostgreSQL?
> **Answer:**
> 1. **Embedded Data Model:** Expenses naturally belong to a specific budget. By embedding expenses as an array within the Budget document, a single query retrieves the budget and all associated expenses without requiring expensive SQL `JOIN` operations.
> 2. **Dynamic Schema:** New features (e.g. receipts, custom tags, split payments) can be added without running schema migration scripts on existing tables.
> 3. **Developer Ergonomics:** Data is stored in BSON (Binary JSON), mapping 1-to-1 with JavaScript objects.

#### Q5. What is the difference between Embedding and Referencing in MongoDB?
> **Answer:**
> - **Embedding:** Storing child documents inside the parent document (e.g., `expenses: [ExpenseSchema]` inside `Budget`). Best when child data is always accessed with the parent and doesn't grow indefinitely.
> - **Referencing:** Storing the `_id` of another document (e.g., `userId: { type: ObjectId, ref: 'User' }` in `Budget`). Best when child data grows unbounded or needs to be queried independently.

#### Q6. What are Mongoose Middleware / Lifecycle Hooks and how are they used here?
> **Answer:** Mongoose hooks are functions that run automatically before or after certain database actions. In `models/User.js`, we use a `pre('save')` hook. Before saving a user document, it checks `if (!this.isModified('password')) return next();` and automatically salts and hashes the password using Bcrypt.

---

### Security & Authentication

#### Q7. How does JWT authentication work and why is it stateless?
> **Answer:** 
> - A JSON Web Token consists of three parts: `Header.Payload.Signature`.
> - When a user logs in, the server signs a token containing the user's `id` using a secret key.
> - On subsequent requests, the client passes this token in the `Authorization: Bearer <token>` header.
> - The server verifies the cryptographic signature with `jwt.verify()`.
> - It is **stateless** because the server does not need to store active session IDs in a database or in-memory store (Redis). The token itself holds all necessary verification information.

#### Q8. What is Bcrypt and why can't we use standard SHA-256 for passwords?
> **Answer:** SHA-256 is designed to be fast, making it vulnerable to brute-force and rainbow table attacks using modern GPUs. **Bcrypt** is a specialized, computationally slow key derivation function that includes a salt (random string added to the password) and configurable cost factor (work factor). This makes brute-force attacks infeasible.

#### Q9. How do you prevent users from accessing or deleting someone else's budgets?
> **Answer:** Every budget operation scopes queries by both the resource ID **and** the authenticated user's ID:
> ```javascript
> const budget = await Budget.findOneAndDelete({ _id: id, userId: req.user.userId });
> ```
> Even if a malicious user knows another user's budget `_id`, the database query will return `null` because `userId` will not match the token's `userId`.

---

### Frontend & State Management

#### Q10. What is React Context API and why was it chosen over Redux?
> **Answer:** React Context allows sharing global data (like user authentication status and login methods) across the entire component hierarchy without passing props through intermediate components ("prop drilling"). Since the global state of this app is primarily authentication, Context is lightweight and avoids the boilerplate of Redux.

#### Q11. What is the purpose of the Vite Proxy configured in `vite.config.ts`?
> **Answer:** During development, the frontend runs on port `5173` and the backend on port `5000`. Direct requests from `localhost:5173` to `localhost:5000` would be blocked by browser CORS policies unless headers are set. The Vite proxy intercepts any call starting with `/api` and forwards it to `http://localhost:5000` on the server level, eliminating CORS issues and allowing relative path requests (`/api/budgets`).

---

## 9. Future Roadmap & Recommended Improvements

Here are impactful features you can implement next to elevate Budget Buddy to a commercial SaaS product:

1. **Interactive Charts & Spending Analytics:**
   - Integrate `Recharts` or `Chart.js` to render visual pie charts for spending by category and bar charts comparing monthly spending against budget caps.
2. **Monthly & Custom Date Filters:**
   - Add a month/year selector to allow users to switch between monthly budgets and archive historical records.
3. **Budget Limit Alerts & Notifications:**
   - Display amber warnings when expenses exceed 80% of the budget and red warnings when the budget is breached.
4. **Export to CSV and PDF:**
   - Allow users to download printable monthly expense reports or CSV spreadsheets for tax filing.
5. **Recurring Bills & Auto-Renewing Budgets:**
   - Enable automated monthly rollover for recurring expenses like Netflix, gym memberships, and rent.
6. **Receipt Attachment / File Uploads:**
   - Use Cloudinary or AWS S3 to let users snap and attach photos of physical grocery or restaurant receipts.

---

## 10. Local Development & Setup Instructions

### Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local MongoDB Service running on port `27017` OR MongoDB Atlas URI

### Setup Steps

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/hariharan-1607/budget-buddy.git
   cd budget-buddy
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create `backend/.env`:
   ```ini
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/budgetbuddy
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Run Both Servers:**
   - **Terminal 1 (Backend):**
     ```bash
     npm run backend
     # Running on http://localhost:5000
     ```
   - **Terminal 2 (Frontend):**
     ```bash
     npm run frontend
     # Running on http://localhost:5173
     ```

5. **Open in Browser:**
   Visit **`http://localhost:5173`** to test registration, login, and budget management!
