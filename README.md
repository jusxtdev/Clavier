# E-Commerce Backend

An in-progress e-commerce backend built with **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, **Prisma**, **JWT cookies**, bcrypt, **Zod validation**, Nodemailer, and Vitest.

The project is being developed backend-first as a learning and portfolio project.
- Current work covers authentication, users, products, categories, role-based access control, validation, pagination, filtering, sorting, search, tests, and password reset emails.

## IMPORTANT -- Note on AI Usage
- As this project is part of my learning process, I use ai in a selective way
- I use AI for following things
  - Writing Tests
  - Writing Styles (Tailwind CSS etc)
- I do **not** use AI for
  - Writing core backend Logic
  - Writing Components / State logic in frontend etc

## Tech Stack

- Node.js + Express 5
- TypeScript
- PostgreSQL
- Prisma 7
- Zod
- JWT stored in HTTP cookies
- bcrypt password hashing
- Nodemailer for password reset emails
- Vitest + Supertest for tests
- pnpm

## Project Structure

```txt
.
├── README.md
└── backend
    ├── prisma
    │   ├── migrations
    │   └── schema.prisma
    ├── test
    ├── vitest.config.ts
    └── src
        ├── app.ts
        ├── config
        ├── controller
        ├── middleware
        ├── routes
        ├── schema
        ├── services
        ├── utils
        └── server.ts
```

## Current Features

- Auth: signup, login, logout
- Password reset token generation, hashed token storage, and email delivery
- JWT authentication middleware
- Role-based authorization with `ADMIN`, `STAFF`, and `BUYER`
- User profile, admin user listing, filtering/search, role promotion, and deletion
- Product CRUD with pagination, filtering, sorting, search, and category assignment
- Category CRUD with pagination
- Service layer for products, categories, users, and reset tokens
- Zod request validation
- Centralized error handling
- API/router tests with Vitest and Supertest
- Controller and service unit tests with mocked dependencies
- Prisma models and migrations for users, products, categories, product-category joins, and reset tokens

## Requirements

- Node.js
- pnpm
- PostgreSQL database
- Gmail account/app password or compatible credentials for Nodemailer

## Getting Started

Install dependencies:

```bash
cd backend
pnpm install
```

Create a `.env` file in `backend`:

```env
PORT=3000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN=604800
NODE_ENV="development"
SENDER_EMAIL="your-email@gmail.com"
SENDER_EMAIL_PASS="your-gmail-app-password"
FRONTEND_URL="http://localhost:3000"
```

Run database migrations:

```bash
pnpm prisma migrate dev
```

Start the development server:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

Run selected tests:

```bash
pnpm vitest test/product.service.test.ts --run
pnpm vitest test/auth.controller.test.ts --run
```

The API is mounted at:

```txt
http://localhost:3000/api
```

Health check:

```txt
GET /api
```

## API Overview

### Auth

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Create a user and set JWT cookie | Public |
| `POST` | `/api/auth/login` | Log in and set JWT cookie | Public |
| `POST` | `/api/auth/logout` | Clear JWT cookie | Public |
| `POST` | `/api/auth/forgotpass` | Send password reset email | Public |
| `POST` | `/api/auth/resetpass?token=<userId>.<token>` | Reset password | Public |

### Users

All user routes require authentication.

| Method | Route | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/users/me` | Get current user | Any authenticated user |
| `DELETE` | `/api/users/me` | Delete current user | Any authenticated user |
| `GET` | `/api/users` | List users with pagination | `ADMIN` |
| `GET` | `/api/users/:id` | Get user by ID | `ADMIN` |
| `PATCH` | `/api/users/promote` | Update a user's role | `ADMIN` |
| `DELETE` | `/api/users/:id` | Delete user by ID | `ADMIN` |

Supported user list query parameters:

```txt
GET /api/users?page=1&limit=10
GET /api/users?role=STAFF
GET /api/users?name=ali
```

### Products

All product routes currently require authentication.

| Method | Route | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/products?page=1&limit=10` | List products with pagination/filtering/sorting/search | Any authenticated user |
| `GET` | `/api/products/:id` | Get product by ID | Any authenticated user |
| `POST` | `/api/products` | Create product | `ADMIN` |
| `PATCH` | `/api/products/:id` | Update product | `ADMIN`, `STAFF` |
| `DELETE` | `/api/products/:id` | Delete product | `ADMIN` |

Supported product list query parameters:

```txt
GET /api/products?page=1&limit=10
GET /api/products?minPrice=10&maxPrice=100
GET /api/products?minStock=1&maxStock=25
GET /api/products?category=keyboards
GET /api/products?search=wireless
GET /api/products?sortBy=price&sortOrder=asc
```

Allowed `sortBy` values:

```txt
price
stock
title
createdAt
```

Allowed `sortOrder` values:

```txt
asc
desc
```

Example product body:

```json
{
  "title": "Wireless Keyboard",
  "description": "Compact mechanical keyboard",
  "price": 79.99,
  "stock": 25,
  "categories": ["keyboards", "accessories"],
  "images": "https://example.com/keyboard.jpg"
}
```

### Categories

All category routes currently require authentication.

| Method | Route | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/categories?page=1&limit=10` | List categories | Any authenticated user |
| `GET` | `/api/categories/:id` | Get category by ID | Any authenticated user |
| `POST` | `/api/categories` | Create category | `ADMIN` |
| `PATCH` | `/api/categories/:id` | Update category | `ADMIN` |
| `DELETE` | `/api/categories/:id` | Delete category | `ADMIN` |

Example category body:

```json
{
  "title": "keyboards",
  "description": "Computer keyboards and keyboard accessories"
}
```

## Pagination

List endpoints support `page` and `limit` query parameters.

```txt
GET /api/products?page=1&limit=10
GET /api/categories?page=1&limit=10
GET /api/users?page=1&limit=10
```

The current maximum `limit` is `50`.

Responses include pagination metadata:

```json
{
  "status": true,
  "msg": "All products fetched successfully",
  "data": [],
  "page": 1,
  "limit": 10,
  "totalItems": 0
}
```

## Testing

The test suite currently includes:

- Router tests for auth, users, products, and categories
- Product service tests for Prisma query shape and category relations
- Controller tests for auth, product list query handling, and user list query handling

Some tests are intentionally strict around edge cases. For example, they should fail if:

- non-numeric pagination silently falls back to defaults
- min/max filters overwrite each other
- filtered product counts ignore the active `where` clause
- malformed reset-password tokens produce a raw runtime error instead of an application error
- reset-password emails leak hashed tokens instead of sending the raw one-time token

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the learning-focused backend roadmap. Current implementation is around phases 1-3: foundation, products, authentication/users, categories, filtering, sorting, and search. Later work includes cart logic, Redis, Docker, and more production-oriented improvements.

## Data Model

Current Prisma models:

- `User`
- `Product`
- `Category`
- `CategoriesOnProducts`
- `Password_reset_token`

Roles:

```txt
ADMIN
STAFF
BUYER
```

## Development Notes

This project is still in progress. Planned future work includes cart logic, Redis, Docker, and other production-oriented improvements.

Current implementation notes:

- Product and category listing routes are protected behind authentication.
- Password reset emails use Nodemailer with Gmail service credentials.
- Prisma client output is configured to `backend/src/generated/prisma`.
- Available scripts are `pnpm dev` and `pnpm test`.
- Docker configuration, seed scripts, and production build scripts have not been added yet.
