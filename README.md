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

- PostgreSQL via **Supabase** (cloud-hosted)

### Media Storage

- **Cloudinary** (all uploaded images and files)

---

## Requirements

Before running the project, make sure the following are installed:

- **Node.js** v20 LTS - <https://nodejs.org>
- **npm** (comes with Node.js)

> No local PostgreSQL installation needed. The database is hosted on Supabase and media is stored on Cloudinary. All data and files persist in the cloud - cloning the repo on a new machine only requires setting up the `.env` files.

---

## Cloud Services

You will need accounts for the following services:

| Service | Purpose | Free Tier |
|---|---|---|
| [Supabase](https://supabase.com) | PostgreSQL database hosting | Yes |
| [Cloudinary](https://cloudinary.com) | Media storage and delivery | Yes |

---

## Environment Setup

### Backend - `my-app/backend/.env`

Create this file with the following variables:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your_app_keys_here
API_TOKEN_SALT=your_api_token_salt
ADMIN_JWT_SECRET=your_admin_jwt_secret
TRANSFER_TOKEN_SALT=your_transfer_token_salt
JWT_SECRET=your_jwt_secret

# Supabase PostgreSQL
DATABASE_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Cloudinary Media Storage
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret

# Gmail SMTP (use an App Password, not your account password)
GMAIL_USER=your_gmail@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# Frontend URL (used in OTP and password reset emails)
FRONTEND_URL=http://localhost:3000
```

### Frontend - `my-app/.env.local`

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

---

## Getting Started

### Step 1 - Set Up and Start Backend (Strapi)

Open **Terminal 1** and run:

```bash
cd my-app/backend
npm install
npm run dev
```

Strapi admin panel opens at **<http://localhost:1337/admin>**

On first run, Strapi will prompt you to create an admin account.

### Step 2 - Set Up and Start Frontend (Next.js)

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

**Terminal 1 - Backend:**

```bash
cd my-app/backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd my-app
npm run dev
```

---

## User Features

1. Register with OTP email verification
2. Login with Remember Me Option (persistent vs session login)
3. Profile management with avatar upload (stored on Cloudinary)
4. Add and manage offered skills (pending admin approval)
5. Browse and filter approved skills by category, location, and level
6. Send, edit, accept, and reject skill exchange requests
7. Symmetric exchange management - both users mark delivery and receipt independently
8. Rating and reviews after completed exchanges
9. Report abuse (users, skills, exchanges)
10. View CMS-driven public pages (Home, About, FAQs, Policies)

---

## Admin Features (via Strapi Admin Panel at localhost:1337/admin)

1. Approve or reject submitted skills
2. Manage skill categories (create, edit, delete with images stored on Cloudinary)
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
    │   ├── (auth)/             # Login, Register, OTP, Forgot Password, reset password
    │   ├── (public)/           # Home, About, FAQs, Policies
    │   └── user/               # All user dashboard pages
    |   └── components/         # Shared UI components
    ├── context/                # AuthContext (global auth state)
    └── lib/
        ├── api.ts              # All Strapi API functions
        └── auth.ts             # localStorage/sessionStorage helpers
```

---

## Authors

- Muhammad Kamran (BC220406446)
- Malaika Ashraf (BC220406139)