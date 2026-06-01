# E-Commerce Backend

An e-commerce backend built with Node.js, Express, TypeScript, PostgreSQL, Prisma, JWT authentication, bcrypt, Zod validation, Nodemailer, Vitest, and Supertest.

This project is being developed backend-first as a learning and portfolio project. The current backend covers authentication, users, products, categories, carts, role-based access control, validation, pagination, filtering, sorting, search, password reset emails, and automated tests.

# High Level Overview
![](./E-Commerce.png)

## AI Usage Note

This project is part of my learning process, so AI is used selectively.

I use AI for:

- Writing tests
- Writing styles, such as Tailwind CSS

I do not use AI for:

- Core backend logic
- Frontend component or state logic

## Tech Stack

- Node.js
- Express 5
- TypeScript
- PostgreSQL
- Prisma 7
- Zod
- JWT authentication with HTTP cookies or bearer tokens
- bcrypt password hashing
- Nodemailer for password reset emails
- Vitest and Supertest for tests
- pnpm

## Project Structure

```txt
.
├── README.md
└── backend
    ├── package.json
    ├── prisma
    │   ├── migrations
    │   └── schema.prisma
    ├── src
    │   ├── app.ts
    │   ├── config
    │   ├── controller
    │   ├── generated
    │   ├── middleware
    │   ├── routes
    │   ├── schema
    │   ├── services
    │   ├── utils
    │   └── server.ts
    ├── test
    ├── tsconfig.json
    └── vitest.config.ts
```

## Features

- Signup, login, logout, and authenticated user sessions
- Password reset token generation, hashed token storage, and email delivery
- JWT authentication middleware
- Role-based authorization with `ADMIN`, `STAFF`, and `BUYER`
- User profile, admin user listing, role promotion, and deletion
- Product CRUD with pagination, filtering, sorting, search, and category assignment
- Category CRUD with pagination
- Cart item add, fetch, update, and remove flows
- Zod request validation
- Centralized error handling
- Prisma models and migrations for users, products, categories, product-category joins, carts, cart items, and reset tokens
- Router, controller, service, and integration-style tests

## Requirements

- Node.js
- pnpm
- PostgreSQL database
- Gmail account/app password or compatible SMTP credentials for Nodemailer

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

The API is mounted at:

```txt
http://localhost:3000/api
```

Health check:

```txt
GET /api
```

## Scripts

```bash
pnpm dev
pnpm test
```

Run a single test file:

```bash
pnpm vitest run test/cart.router.test.ts
```

## Authentication

Protected routes require a valid JWT. The auth middleware accepts the token from either:

- `Authorization: Bearer <token>`
- `jwt` cookie

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
| `GET` | `/api/users` | List users | `ADMIN` |
| `GET` | `/api/users/:id` | Get user by ID | `ADMIN` |
| `PATCH` | `/api/users/promote` | Update a user's role | `ADMIN` |
| `DELETE` | `/api/users/:id` | Delete user by ID | `ADMIN` |

Supported user list query examples:

```txt
GET /api/users?page=1&limit=10
GET /api/users?role=STAFF
GET /api/users?name=ali
```

Promote user body:

```json
{
  "userId": 4,
  "role": "STAFF"
}
```

### Products

All product routes require authentication.

| Method | Route | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/products?page=1&limit=10` | List products with pagination, filtering, sorting, and search | Any authenticated user |
| `GET` | `/api/products/:id` | Get product by ID | Any authenticated user |
| `POST` | `/api/products` | Create product | `ADMIN` |
| `PATCH` | `/api/products/:id` | Update product | `ADMIN`, `STAFF` |
| `DELETE` | `/api/products/:id` | Delete product | `ADMIN` |

Supported product list query examples:

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

Product body:

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

All category routes require authentication.

| Method | Route | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/categories?page=1&limit=10` | List categories | Any authenticated user |
| `GET` | `/api/categories/:id` | Get category by ID | Any authenticated user |
| `POST` | `/api/categories` | Create category | `ADMIN` |
| `PATCH` | `/api/categories/:id` | Update category | `ADMIN` |
| `DELETE` | `/api/categories/:id` | Delete category | `ADMIN` |

Category body:

```json
{
  "title": "keyboards",
  "description": "Computer keyboards and keyboard accessories"
}
```

### Cart

All cart routes require authentication.

| Method | Route | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/cart` | Get the current user's cart | Any authenticated user |
| `POST` | `/api/cart/items` | Add a product to the cart, or increment quantity if it already exists | Any authenticated user |
| `PATCH` | `/api/cart` | Set the quantity for an existing cart item | Any authenticated user |
| `DELETE` | `/api/cart/items/:id` | Remove a product from the cart | Any authenticated user |

Add item body:

```json
{
  "productId": 1,
  "quantity": 2
}
```

Update item body:

```json
{
  "productId": 1,
  "quantity": 4
}
```

Cart behavior notes:

- `POST /api/cart/items` creates a cart for the user if one does not already exist.
- Adding an existing product increments its quantity.
- `PATCH /api/cart` updates the item quantity to the exact value sent.
- Cart quantity cannot be greater than product stock.
- Product IDs and quantities must be positive integers.

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

## Response Shape

Successful responses generally use:

```json
{
  "status": true,
  "msg": "Operation message",
  "data": {}
}
```

Error responses generally use:

```json
{
  "status": false,
  "msg": "Error message"
}
```

## Testing

Run the full test suite:

```bash
pnpm test
```

Run selected tests:

```bash
pnpm vitest run test/product.service.test.ts
pnpm vitest run test/cart.router.test.ts
```

The test suite includes:

- Router tests for auth, users, products, categories, and carts
- Controller tests for auth, products, and users
- Service tests for product behavior and Prisma query shape
- Integration-style cart tests that use real Express middleware and Prisma database operations

Some cart tests are slower because they intentionally avoid mocking the router/service/database path.

## Data Model

Current Prisma models:

- `User`
- `Product`
- `Category`
- `CategoriesOnProducts`
- `Cart`
- `CartItem`
- `Password_reset_token`

Roles:

```txt
ADMIN
STAFF
BUYER
```

## Development Notes

- Product, category, user, and cart routes are protected behind authentication unless documented as public auth routes.
- Password reset emails use Nodemailer with configured sender credentials.
- Prisma client output is configured to `backend/src/generated/prisma`.
- Available scripts are `pnpm dev` and `pnpm test`.
- Docker configuration, seed scripts, and production build scripts have not been added yet.
