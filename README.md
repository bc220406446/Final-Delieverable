# Community Skills Exchange Platform (CSEP)

A web-based skill-bartering platform that allows users to exchange skills and services without money. Users can offer skills, request help, schedule exchanges, and provide feedback, while administrators moderate content and manage the system through Strapi's built-in admin panel.

This project was developed as an academic Web Programming project using modern full-stack technologies.

---

## Technology Stack

### Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

### Backend

- Strapi v5 (Headless CMS)
- JWT Authentication
- Nodemailer (Gmail SMTP for transactional email)

### Database

- PostgreSQL

---

## Requirements

Before running the project, make sure the following are installed:

- **Node.js** v20 LTS — <https://nodejs.org>
- **PostgreSQL** v16 or v17 — <https://www.postgresql.org/download/windows>
- **npm** (comes with Node.js)

---

## Environment Setup

### Backend — `my-app/backend/.env`

Create this file with the following variables:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys_here
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret

# PostgreSQL
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=csep
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_db_password
DATABASE_SSL=false

# Gmail SMTP (use an App Password, not your account password)
GMAIL_USER=csep.platform@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# Frontend URL (used in OTP and password reset emails)
FRONTEND_URL=http://localhost:3000
```

### Frontend — `my-app/.env.local`

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

---

## Getting Started

### Step 1 — Set Up and Start Backend (Strapi)

Open **Terminal 1** and run:

```bash
cd my-app/backend
npm install
npm run develop
```

Strapi admin panel opens at **<http://localhost:1337/admin>**

On first run, Strapi will prompt you to create an admin account.

### Step 2 — Set Up and Start Frontend (Next.js)

Open **Terminal 2** and run:

```bash
cd my-app
npm install
npm run dev
```

Frontend opens at **<http://localhost:3000>**

> Both terminals must be running at the same time. Backend must start before the frontend.

---

## Running After Initial Setup

**Terminal 1 — Backend:**

```bash
cd my-app/backend
npm run develop
```

**Terminal 2 — Frontend:**

```bash
cd my-app
npm run dev
```

---

## Strapi Admin Setup (First Time Only)

After starting Strapi, go to **<http://localhost:1337/admin>** and complete these steps:

### 1. Permissions — Settings → Users & Permissions → Roles → Authenticated

Enable the following:

| Section | Actions |
|---|---|
| Exchange | `cancel`, `confirm`, `myExchanges` |
| Request | `accept`, `create`, `delete`, `myRequests`, `reject`, `syncExchange`, `update` |
| Review | `create`, `myReviews` |
| Report | `create`, `myReports` |
| Skill | `create`, `find`, `findOne`, `update`, `delete`, `mySkills`, `approve`, `reject` |
| Skill-category | `find` |
| Upload | `upload` |
| Users-permissions → User | `me`, `find`, `update` |

### 2. Permissions — Settings → Users & Permissions → Roles → Public

Enable:

| Section | Actions |
|---|---|
| About-page | `find` |
| Faq-page | `find` |
| Policies-page | `find` |
| Home-page | `find` |

### 3. Add Skill Categories

Go to **Content Manager → Skill Category** and add the 7 categories:

- Cognitive / Intellectual Skills
- Technical / Hard Skills
- Interpersonal / People Skills
- Personal / Self-Management Skills
- Organizational / Management Skills
- Digital / IT Skills
- Language / Communication

### 4. Add CMS Content

Go to **Content Manager** and fill in content for:

- **Home Page** — hero title, subtitle, CTA, categories, steps, team members
- **About Page** — hero, problem/solution blocks, team members
- **FAQ Page** — hero, FAQs
- **Policies Page** — last updated, privacy policy, terms, exchange policy, community guidelines

---

## User Features

1. Register and login with OTP email verification
2. Remember Me (persistent vs session login)
3. Profile management with avatar upload
4. Browse and filter approved skills by category, location, and level
5. Add and manage offered skills (pending admin approval)
6. Send, edit, accept, and reject skill exchange requests
7. Symmetric exchange management — both users mark delivery and receipt independently
8. Rating and reviews after completed exchanges
9. Report abuse (users, skills, exchanges)
10. CMS-driven public pages (Home, About, FAQs, Policies)

---

## Admin Features (via Strapi Admin Panel at localhost:1337/admin)

1. Approve or reject submitted skills
2. Manage skill categories (create, edit, delete with images)
3. Block or unblock users
4. Review and resolve abuse reports
5. Manage all CMS content (Home, About, FAQs, Policies pages)
6. View all exchanges, requests, and reviews

---

## Security Features

- OTP-based email verification with rate limiting (max 3 sends / 10 min)
- Brute-force protection on OTP verify (locks after 5 failed attempts for 15 min)
- JWT authentication with configurable expiry
- Route protection via Next.js middleware (cookie-based)
- Remember Me: localStorage vs sessionStorage based on user preference
- Field whitelisting on request updates (prevents mass assignment)
- Admin authorization checks on all sensitive endpoints

---

## Project Structure

```
my-app/
├── backend/                    # Strapi v5 backend
│   ├── src/
│   │   ├── api/                # Custom content types and controllers
│   │   │   ├── exchange/
│   │   │   ├── request/
│   │   │   ├── review/
│   │   │   ├── report/
│   │   │   ├── skill/
│   │   │   ├── skill-category/
│   │   │   ├── otp/
│   │   │   ├── about-page/
│   │   │   ├── faq-page/
│   │   │   ├── policies-page/
│   │   │   └── home-page/
│   │   ├── extensions/         # Strapi users-permissions override
│   │   └── index.ts            # OTP lifecycle hook
│   └── config/                 # plugins.ts, middlewares.ts
│
└── src/                        # Next.js frontend
    ├── app/
    │   ├── (auth)/             # Login, Register, OTP, Forgot Password
    │   ├── (public)/           # Home, About, FAQs, Policies
    │   └── dashboard/
    │       └── user/           # All user dashboard pages
    ├── components/             # Shared UI components
    ├── context/                # AuthContext (global auth state)
    └── lib/
        ├── api.ts              # All Strapi API functions
        ├── auth.ts             # localStorage/sessionStorage helpers
        └── useDefaultAvatar.ts # Default avatar hook
```

---

## Authors

- Muhammad Kamran (BC220406446)
- Malaika Ashraf (BC220406139)
