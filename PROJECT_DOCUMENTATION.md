# Budget Buddy - Complete Project Report & Technical Documentation

**Project Name:** Budget Buddy (Personal Budget & Expense Management System)  
**Architecture:** MERN Stack (MongoDB, Express.js, React, Node.js) with Vercel Serverless Support  
**Repository:** [https://github.com/hariharan-1607/budget-buddy.git](https://github.com/hariharan-1607/budget-buddy.git)  
**Live Vercel URL:** `https://budgetbuddy-1617.vercel.app`  
**Author:** Hariharan  
**Documentation Version:** 2.1 (Updated with Vercel Serverless & Cloud MongoDB Migration)

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture (Local & Cloud Serverless)](#2-system-architecture-local--cloud-serverless)
3. [Technology Stack & Rationale](#3-technology-stack--rationale)
4. [Project File Structure](#4-project-file-structure)
5. [End-to-End Data Flow](#5-end-to-end-data-flow)
6. [Authentication & Session Persistence](#6-authentication--session-persistence)
7. [Why the "Unexpected token 'T'..." Error Occurred & How It Is Solved](#7-why-the-unexpected-token-t-error-occurred--how-it-is-solved)
8. [Step-by-Step Guide: Moving to MongoDB Atlas (Cloud Database)](#8-step-by-step-guide-moving-to-mongodb-atlas-cloud-database)
9. [Configuring Environment Variables in Vercel Dashboard](#9-configuring-environment-variables-in-vercel-dashboard)
10. [Comprehensive Interview & Viva Questions & Answers](#10-comprehensive-interview--viva-questions--answers)
11. [Future Roadmap & Recommended Improvements](#11-future-roadmap--recommended-improvements)
12. [Local Development & Setup Instructions](#12-local-development--setup-instructions)
13. [Stitch UI/UX Design System & Screen Specifications](#13-stitch-uiux-design-system--screen-specifications)

---

## 1. Executive Summary

**Budget Buddy** is a modern, responsive fullstack web application designed to give users complete control over their personal finances. Users can register securely, log into their accounts, set customized budget caps for different spending categories (e.g., Groceries, Rent, Vacation, Entertainment), track expenses against these budgets in real time, and view remaining balances dynamically.

All data is persistently stored in **MongoDB** (locally on `mongodb://localhost:27017/budgetbuddy` or in the cloud via **MongoDB Atlas**) through a secure **Express REST API** backend featuring **Bcrypt** password hashing and **JSON Web Token (JWT)** session authorization.

---

## 2. System Architecture (Local & Cloud Serverless)

### Local Development Architecture
```
React Frontend (Vite on :5173) ──[/api proxy]──> Express Server (:5000) ──> Local MongoDB (:27017)
```

### Production Vercel Serverless Architecture
```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE CDN & HOSTING                       │
│                                                                        │
│   Incoming Request: https://budgetbuddy-1617.vercel.app/api/*          │
│   ├── Static files & React SPA: frontend/dist/                         │
│   └── Serverless Rewrites: vercel.json                                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ Rewritten to /api/index.js
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   VERCEL SERVERLESS FUNCTION (api/index.js)            │
│                                                                        │
│   • Reuses cached Mongoose connection across warm serverless functions │
│   • Dispatches request to Express App (backend/server.js)              │
│   • Middleware: authMiddleware (JWT Verification), CORS, JSON parser   │
│   • Endpoints: /api/auth/signup, /api/auth/login, /api/budgets         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    │ TLS / SSL Connection (SRV)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   CLOUD DATABASE (MongoDB Atlas Cluster)               │
│                                                                        │
│   Host: cluster0.xxxxx.mongodb.net (Port 27017 / SRV)                  │
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
| **Vite** | Build Tool & Dev Server | Fast Hot Module Replacement (HMR) and built-in reverse proxy eliminating CORS friction. |
| **Tailwind CSS** | Styling | Utility-first styling framework enabling rapid, highly-responsive, clean design without bloated CSS. |
| **Framer Motion** | Micro-Animations | Smooth card hover elevations, modal entrances, and page transitions for a premium UX feel. |
| **Lucide React** | Icons | Crisp, customizable SVG icons (`IndianRupee`, `Plus`, `Trash2`, `Edit2`, `Eye`, `EyeOff`). |
| **React Router v6** | Client Routing | Declarative routing with protected route guards preventing unauthorized dashboard access. |

### Backend & Database
| Technology | Role | Why It Was Chosen |
| :--- | :--- | :--- |
| **Node.js** | Runtime | Event-driven, non-blocking asynchronous I/O ideal for handling multiple concurrent REST calls. |
| **Express.js** | Web Framework | Minimalist routing framework for cleanly mounting RESTful endpoints and exporting as Vercel serverless handler. |
| **MongoDB / Atlas** | Database | NoSQL document database. Naturally handles nested arrays (expenses inside budgets) in a single atomic document. |
| **Mongoose** | ODM | Object modeling for MongoDB: schema validation, pre-save hooks, and JSON virtual transforms. |
| **Bcryptjs** | Security | Cryptographic one-way salted password hashing protecting passwords against rainbow table attacks. |
| **JSON Web Tokens (JWT)**| Auth Protocol | Stateless, signed authorization tokens eliminating the overhead of server-side session memory. |
| **dotenv** | Config | Isolates sensitive variables (database URIs, ports, secrets) into `.env` files outside Git. |

---

## 4. Project File Structure

```
budget-sample/
├── api/
│   └── index.js                  # Vercel Serverless Function entry point
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection with serverless connection reuse
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT extraction & verification guard
│   ├── models/
│   │   ├── Budget.js             # Budget & embedded Expense Mongoose schema
│   │   └── User.js               # User schema with pre-save bcrypt hashing hook
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth endpoints (signup, login, me)
│   │   └── budgetRoutes.js       # /api/budgets CRUD endpoints
│   ├── .env                      # Local environment variables (ignored by Git)
│   ├── .env.example              # Sample environment template
│   └── server.js                 # Express server entry point with flexible routing
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Navigation header with Auth conditional links
│   │   │   └── Footer.tsx        # Global footer
│   │   ├── context/
│   │   │   └── AuthContext.tsx   # Auth state, persistent token storage & HTML error interceptor
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
├── vercel.json                   # Vercel build command, outputDir, and serverless rewrites
├── package.json                  # Root package.json with backend dependencies for Vercel
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

In **Budget Buddy**, session persistence works identically to commercial websites (like GitHub or Google):

1. **30-Day Token Lifespan:**  
   In `backend/routes/authRoutes.js`, the token is issued with `expiresIn: "30d"`. The token remains valid for an entire month without requiring repetitive logins.

2. **Instant State Hydration from `localStorage`:**  
   When the user opens the website, `AuthContext` immediately loads the cached user profile from `localStorage.getItem('user')`. This prevents the "blank white flash" or "Authenticating..." loading screen.

3. **Background Token Verification (`/api/auth/me`):**  
   In the background, `AuthContext` calls `/api/auth/me` to ensure the token is still valid.

4. **Resilient Error Handling:**  
   The user is **only logged out if the server returns HTTP 401 Unauthorized** (token genuinely expired or revoked). If there is a temporary network glitch or server restart, the session is **preserved** rather than wiped.

---

## 7. Why the "Unexpected token 'T'..." Error Occurred & How It Is Solved

### The Error Observed
On `https://budgetbuddy-1617.vercel.app/login` and `/signup`:
```text
Unexpected token 'T', "The page c"... is not valid JSON
```

### Root Causes
1. **No Serverless Function Configured on Vercel:**  
   The GitHub repo had code for the frontend, but did not have an `api/index.js` serverless function or `vercel.json` rewrites. When the deployed frontend sent a request to `/api/auth/signup`, Vercel did not know what to execute and returned its default **HTML 404 error page** beginning with the words:  
   `The page could not be found...`  
   The frontend code then called `response.json()`, which crashed trying to parse the character **`T`** of `"The page..."` as JSON.

2. **Local vs Cloud Database:**  
   Even if the server was reachable, Vercel runs in cloud data centers across the internet. Vercel **cannot connect to `localhost:27017`** on your personal laptop. For Vercel to work, the database must be hosted on **MongoDB Atlas** in the cloud.

### The Solution Implemented
1. **Created `api/index.js`:** A dedicated entry point for Vercel that connects to MongoDB and serves the Express backend.
2. **Created `vercel.json`:** Directs `/api/(.*)` requests straight to `/api/index.js` and all other routes to `/index.html`.
3. **Updated Root `package.json`:** Included `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, and `cors` so Vercel installs them during build.
4. **Added `parseApiResponse()` in `AuthContext.tsx`:** Checks the `Content-Type` header before parsing JSON. If a server returns an HTML error (e.g. 404 or 500), it presents a helpful diagnostic message instead of a cryptic JSON syntax error.

---

## 8. Step-by-Step Guide: Moving to MongoDB Atlas (Cloud Database)

Follow this simple tutorial to create a 100% free Cloud MongoDB database on MongoDB Atlas.

### Step 1: Sign Up on MongoDB Atlas
1. Open your browser and go to: **[https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)**
2. Sign up with your Google account or email.

### Step 2: Create a Free Shared Cluster
1. After logging in, click **Create** or **Build a Database**.
2. Select the **M0 Free (Shared)** option (free forever, no credit card required).
3. Name your cluster (e.g., `Cluster0`).
4. Select a Cloud Provider & Region closest to you (e.g. **AWS / Mumbai (`ap-south-1`)** or **Singapore**).
5. Click **Create Deployment**.

### Step 3: Create a Database User
1. In the "Security Quickstart" prompt:
   - **Username:** enter `budgetUser` (or your preferred name).
   - **Password:** click "Autogenerate" or enter a secure password (e.g., `BudgetPass2026!`).
   - **Important:** Copy and save this password in Notepad!
2. Click **Create Database User**.

### Step 4: Configure Network Access (Allow from Anywhere)
1. In the same prompt, under "Where would you like to connect from?":
   - Select **Cloud Environment** or click **Add IP Address**.
   - Enter IP Address: `0.0.0.0/0` (Description: `Allow all for Vercel`).
   - Click **Add Entry**.
   *(This ensures both your local computer and Vercel's cloud servers can connect without being blocked by firewalls).*

### Step 5: Get Your Connection String
1. Go to **Database** -> Click the blue **Connect** button on your cluster.
2. Choose **Drivers** (Node.js).
3. Under "Install your driver", look at Step 3: "Add your connection string into your application code".
4. Copy the connection string. It looks like:
   ```text
   mongodb+srv://budgetUser:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
5. Replace `<password>` with your actual password (remove the `<` and `>` brackets).
6. Add `/budgetbuddy` right before the `?` to specify the database name:
   ```text
   mongodb+srv://budgetUser:BudgetPass2026!@cluster0.abcde.mongodb.net/budgetbuddy?retryWrites=true&w=majority
   ```

### Step 6: Test Locally (Optional but Recommended)
1. Open `backend/.env` on your computer.
2. Update the `MONGO_URI` with your new cloud string:
   ```ini
   MONGO_URI=mongodb+srv://budgetUser:BudgetPass2026!@cluster0.abcde.mongodb.net/budgetbuddy?retryWrites=true&w=majority
   ```
3. Run `npm run backend` and see:
   ```text
   ✅ MongoDB Connected: cluster0-shard-00-00.../budgetbuddy
   ```

---

## 9. Configuring Environment Variables in Vercel Dashboard

Once you have your MongoDB Atlas connection string, add it to Vercel so your live website connects to it:

1. Log into **[https://vercel.com](https://vercel.com)**.
2. Click on your project: **`budgetbuddy-1617`** (or `budget-buddy`).
3. Click the **Settings** tab at the top.
4. Click **Environment Variables** in the left sidebar menu.
5. Add the following two variables:

| Variable Key | Value | Notes |
| :--- | :--- | :--- |
| **`MONGO_URI`** | `mongodb+srv://budgetUser:BudgetPass2026!@cluster0.abcde.mongodb.net/budgetbuddy?retryWrites=true&w=majority` | Your Cloud MongoDB Atlas URI |
| **`JWT_SECRET`** | `budget_buddy_production_secret_key_2026_jwt` | Any secure random string (32+ characters) |

6. Click **Save**.
7. Go to the **Deployments** tab in Vercel, click the three dots (`...`) next to the latest deployment, and click **Redeploy** (or simply push a new commit to GitHub).
8. Once the build finishes, visit **`https://budgetbuddy-1617.vercel.app/signup`**! You can now sign up, log in, and manage budgets directly from the live web!

---

## 10. Comprehensive Interview & Viva Questions & Answers

### Architecture & Technology Stack

#### Q1. What architecture does this application follow?
> **Answer:** It follows a **Three-Tier MERN Architecture with Serverless Deployment**:
> 1. **Presentation Tier:** React SPA (Single Page Application) built with TypeScript and Vite.
> 2. **Application Tier:** Node.js with Express.js exposing stateless RESTful endpoints, deployable both as a traditional Node daemon and as a Vercel Serverless Function via `api/index.js`.
> 3. **Data Tier:** MongoDB document database (Local or Cloud Atlas) managed via Mongoose ODM.

#### Q2. Why did you choose React with Vite over Create React App (CRA)?
> **Answer:** Create React App is officially deprecated and relies on Webpack, which bundles the entire application before starting. Vite leverages native ES Modules (ESM) in the browser, making development server startup and Hot Module Replacement (HMR) virtually instantaneous.

#### Q3. What is the difference between client-side routing and server-side routing?
> **Answer:** In server-side routing, every navigation triggers a new HTTP GET request to the server, reloading the entire page. In client-side routing (via `react-router-dom`), navigation is handled by JavaScript updating the DOM dynamically without reloading the browser, providing a seamless desktop-app-like user experience.

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

#### Q6. How does connection pooling work in Mongoose during serverless deployment?
> **Answer:** In serverless platforms like Vercel, functions spin down when idle and spin up on demand. If a new database connection is created on every invocation, it exhausts MongoDB's connection pool. We implement connection caching (`if (mongoose.connection.readyState >= 1) return;`) so warm serverless instances reuse existing TCP connections.

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

## 11. Future Roadmap & Recommended Improvements

1. **Interactive Charts & Spending Analytics:**
   - Integrate `Recharts` to render visual pie charts for spending by category and monthly comparison bars.
2. **Monthly & Custom Date Filters:**
   - Add a month/year selector to allow users to switch between monthly budgets and archive historical records.
3. **Budget Limit Alerts & Notifications:**
   - Display amber warnings when expenses exceed 80% of the budget and red warnings when the budget is breached.
4. **Export to CSV and PDF:**
   - Allow users to download printable monthly expense reports or CSV spreadsheets for tax filing.
5. **Receipt Attachment / File Uploads:**
   - Use Cloudinary or AWS S3 to let users snap and attach photos of physical grocery or restaurant receipts.

---

## 12. Local Development & Setup Instructions

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

---

## 13. Stitch UI/UX Design System & Screen Specifications

**Stitch Project ID:** `projects/9762974202711535608`  
**Project Title:** Budget Buddy Architecture & Audit  
**Design Theme:** Modern Wealth & Budget Intelligence  

### 13.1 Visual Design Tokens
- **Primary Color:** `#059669` / `#006948` (Deep Emerald - indicates positive cash flows and primary interactive CTA targets)
- **Secondary Color:** `#10B981` (Mint Emerald - progress indicators, active badges, surplus metrics)
- **Tertiary Color:** `#0EA5E9` (Cerulean - secondary signals and recurring debit states)
- **Neutral Foundation:** `#0F172A` (Midnight Slate - high-contrast text and dark mode card surfaces)
- **Canvas / Surface:** `#F8FAFC` / `#FFFFFF` (Zero-glare background canvas paired with subtle 1px translucent ghost borders)
- **Typography:**
  - **Headings:** *Plus Jakarta Sans* (Contemporary executive curvature and clarity)
  - **Metrics & Data:** *Inter* with tabular numbers (`font-feature-settings: 'tnum' on, 'cv05' on, 'cv11' on`)
- **Currency System:** Indian Rupee (`₹`) optical cap-height baseline alignment

### 13.2 Screen Catalog

| Screen ID | Title | Viewport / Dimensions | Description |
| :--- | :--- | :--- | :--- |
| `a3e1dee50f494d189d9cfd7b3bfa7738` | Budget Buddy - Mobile Dashboard | `780 x 3918` (Extended Mobile View) | Complete mobile financial dashboard featuring user greeting, 4-tier summary metrics, circular SVG utilization gauge, velocity bento cards, real-time transaction ledger, and modal action overlays. |
| `9114df2221ae4578bd8593ad6c1e02c4` | Budget Buddy Logo | `512 x 512` (`image/svg+xml`) | Official Budget Buddy vector emblem with deep emerald gradient and financial shield contours. |
| `33384465d0684e6e8e1e50c6db5d9c67` | Budget Buddy - Mobile Dashboard | `390 x 884` (Compact Viewport) | Standard 390px mobile viewport variant optimized for ergonomic single-hand thumb navigation. |

### 13.3 Core Dashboard Components from Stitch
1. **Quick Action Header:** "Good evening, Hariharan" with "+ New Expense" and "+ Budget" quick entry triggers.
2. **Four-Quadrant Metric Deck:**
   - **Total Allocated:** Aggregated monthly allowance (`₹50,000`).
   - **Total Spent:** Current total outflow (`₹31,500`).
   - **Remaining Liquidity:** Safe-to-spend buffer (`₹18,500`).
   - **Spend Utilization Gauge:** Radial progress ring displaying utilization velocity (`63%`).
3. **Pacing Bento Grid:** Highlights peak single transaction and top velocity expense category.
4. **Dynamic Progress Thresholds:**
   - `0% - 79%`: Mint Emerald (`#10B981`)
   - `80% - 99%`: Warning Amber (`#F59E0B`)
   - `100%+`: Critical Rose-Crimson (`#EF4444`)

