# Community Skills Exchange Platform (CSEP)

A web-based skill-bartering platform that allows users to exchange skills and services without money. Users can offer skills, request help, schedule exchanges, and provide feedback, while administrators moderate content and manage the system.

This project is developed as an academic Web Programming project using modern full-stack technologies.

---

## Technology Stack

### Frontend

1. Next.js 15 (App Router)
2. React 19
3. TypeScript
4. Tailwind CSS

### Backend (will be completed in next phase)

1. Strapi v5 (Headless CMS)
2. JWT Authentication

### Database

1. PostgreSQL

### Media

1. Local `/public` assets (images and icons)
2. Cloudinary (next phase)

---

## Requirements

Before running the project, make sure the following are installed:

- **Node.js** v20 LTS - <https://nodejs.org>
- **PostgreSQL** v16 or v17 - <https://www.postgresql.org/download/windows> (if want to see database table)
- **npm** (comes with Node.js)

---

## Getting Started

### Step 1 - Set Up Backend (Strapi)

**Open Terminal 1 and run:**

```bash
cd backend
npm install
```

**Start the backend:**

```bash
npm run develop
```

- Strapi will open at **<http://localhost:1337/admin>**
email: <muhammadkamranyar@gmail.com> & password: test@123

---

### Step 2 - Set Up Frontend (Next.js)

**Open Terminal 2 and run:**

```bash
cd my-app
npm install
```

**Start the frontend:**

```bash
npm run dev
```

- Frontend will open at **<http://localhost:3000>**

---

## Running the Project (After Initial Setup)

Every time you want to run the project, open **two terminals**:

**Terminal 1 - Backend:**

```bash
cd backend
npm run develop
```

**Terminal 2 - Frontend:**

```bash
cd my-app
npm run dev
```

> Both must be running at the same time. Backend must start before frontend.

---

## User Features

1. Register and Login with OTP verification
2. Profile management
3. Browse available skills
4. Add offered skills
5. Send skill requests
6. Exchange management (Providing and Receiving)
7. Rating and reviews
8. Report abuse

---

## Admin Features

1. Manage users (view, delete)
2. Manage Skills (view & delete existing skills and Approve or Reject new skills)
3. Manage categories
4. Moderate abuse reports
5. Manage static pages (About, FAQs, Policies)

---

## Current Status

- ✅ Frontend UI fully implemented
- ✅ Strapi backend set up with PostgreSQL
- ✅ Skill content type created in Strapi
- 🔲 Full backend integration (login, profile, skill submission) in progress

---

## Authors

- Muhammad Kamran (BC220406446)
- Malaika Ashraf (BC220406139)
