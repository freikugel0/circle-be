# Circle Backend

Circle Backend is the API server for the Circle microblogging application.  
It exposes endpoints for authentication, user management, and post operations that are consumed by the Circle frontend.

> Frontend repository: https://github.com/freikugel0/circle  

---

## Overview

The goal of this project is to provide a clean, type-safe backend for a small social / microblogging app.  
It uses a relational database modelled via Prisma, and exposes a simple HTTP API that can be used by web or mobile clients.

I'm using this repository as:

- The backend for the Circle frontend project
- A template for a TypeScript + Prisma backend
- A playground for designing REST APIs and relational schemas

---

## Features

Planned and typical features for this backend include:

- User registration and login
- Authentication and authorization (token-based sessions)
- CRUD operations for posts (create, read, update, delete)
- Timeline / feed endpoint for listing posts
- Basic profile information for each user
- Prisma schema as the single source of truth for the database
- Environment-based configuration

Update this section to match the exact features that are implemented.

---

## Tech Stack

- Node.js
- TypeScript
- Prisma ORM
- Relational database (for example PostgreSQL or Supabase)
- PNPM / NPM workspace setup

If you are using a specific HTTP framework (Express, Fastify, etc.), you can explicitly mention it here.

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- pnpm (recommended), npm, or yarn
- A running relational database (e.g. PostgreSQL or a Supabase project)

### Environment Variables

Create a `.env` file in the project root with at least:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/circle
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### Installation

Clone this repository:

```bash
git clone https://github.com/freikugel0/circle-be.git
cd circle-be
```

Install dependencies:

```bash
# choose one
pnpm install
npm install
yarn install
```

### Database and Prisma

Apply migrations and generate the Prisma client:

```bash
# run migrations
pnpm prisma migrate dev
# or
npx prisma migrate dev

# generate client
pnpm prisma generate
# or
npx prisma generate
```

You can inspect and modify the database schema in prisma/schema.prisma.

### Development

Start the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

By default the server will usually run on something like http://localhost:4000.
Update this line if you are using a different port.

### Production

Build the project:

```bash
pnpm build
# or
npm run build
# or
yarn build
```

Then start the compiled server:

```bash
pnpm start
# or
npm start
# or
yarn start
```

Make sure your production environment has the correct .env variables set and the database is reachable.

## Notes
Circle Backend is intended to be used together with the Circle frontend.
For local development, run the backend and frontend simultaneously, and configure the frontend to point to the backend base URL (for example http://localhost:4000).
