# E-Commerce App

Full-stack e-commerce application with a Node.js/Express/TypeScript backend and a React/Tailwind frontend.

## Tech Stack

### Backend
- Node.js with Express 5
- TypeScript
- PostgreSQL with Prisma 7
- JWT authentication (HTTP cookies or bearer tokens)
- bcrypt password hashing
- Nodemailer for password reset emails
- Zod request validation
- Vitest and Supertest for tests
- pnpm

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- Zustand (state management)
- React Router 7
- Axios (HTTP client)

## High Level Overview

![E-Commerce backend overview](./E-Commerce.png)

## AI Usage Note

This project is part of my learning process, so AI is used selectively.

I use AI for:

- Drafting and improving tests that I review and understand
- Writing styles, such as Tailwind CSS
- README/documentation polish

I do not use AI for:

- Core backend logic
- Frontend component or state logic

## Project Structure

```txt
.
├── backend
│   ├── package.json
│   ├── pnpm-workspace.yaml
│   ├── prisma
│   │   ├── migrations
│   │   └── schema.prisma
│   ├── src
│   │   ├── app.ts
│   │   ├── config
│   │   ├── controller
│   │   ├── generated
│   │   ├── middleware
│   │   ├── routes
│   │   ├── schema
│   │   ├── services
│   │   ├── types
│   │   ├── utils
│   │   └── server.ts
│   ├── test
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend
│   ├── package.json
│   ├── eslint.config.js
│   ├── index.html
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── pages
│   │   ├── stores
│   │   └── App.tsx
│   ├── vite.config.js
│   └── dist
└── README.md
```

## Features

### Backend
- Signup, login, logout, and authenticated user sessions
- Password reset token generation, hashed token storage, token expiry, and email delivery
- JWT authentication middleware using `Authorization: Bearer <token>` or the `jwt` cookie
- Role-based authorization with `ADMIN`, `STAFF`, and `BUYER`
- User profile, admin user listing, role promotion, and deletion
- Public product browsing with pagination, filtering, sorting, search, and category filtering
- Protected product create, update, and delete flows
- Category CRUD with pagination
- Cart add, fetch, update, remove item, and empty cart flows
- Order creation from cart, order item snapshots, stock decrement, cart cleanup, and order status updates
- Zod request validation
- Centralized error handling with `AppError`
- Router, controller, service, and integration-style tests

### Frontend
- User authentication (signup, login, logout)
- Password reset flow
- Product browsing with search, filters, and sorting
- Shopping cart management
- Order placement and order history
- Responsive design with Tailwind CSS
- State management with Zustand

## Requirements

- Node.js
- pnpm
- PostgreSQL database
- Gmail account/app password or compatible SMTP credentials for Nodemailer

## Getting Started

### Backend

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
FRONTEND_URL="http://localhost:5173"
```

Run database migrations:

```bash
pnpm prisma migrate dev
```

Start the development server:

```bash
pnpm dev
```

### Frontend

Install dependencies:

```bash
cd frontend
pnpm install
```

Create a `.env` file in `frontend`:

```env
VITE_API_URL=http://localhost:3000/api
```

Start the development server:

```bash
pnpm dev
```

The frontend is available at:

```txt
http://localhost:5173
```

The backend API is mounted at:

```txt
http://localhost:3000/api
```

Health check:

```txt
GET /api
```

## Scripts

### Backend

```bash
pnpm dev
pnpm run build
pnpm test
```

Run selected tests:

```bash
pnpm vitest run test/product.service.test.ts
pnpm vitest run test/cart.router.test.ts
pnpm vitest run test/order.service.test.ts
```

### Frontend

```bash
pnpm dev
pnpm build
pnpm lint
pnpm preview
```

## Authentication

Protected routes require a valid JWT. The auth middleware accepts the token from either:

- `Authorization: Bearer <token>`
- `jwt` cookie

Signup and login set the `jwt` cookie automatically.

## API Overview

### Auth

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Create a user and set JWT cookie | Public |
| `POST` | `/api/auth/login` | Log in and set JWT cookie | Public |
| `POST` | `/api/auth/logout` | Clear JWT cookie | Public |
| `POST` | `/api/auth/forgotpass` | Send password reset email | Public |
| `POST` | `/api/auth/resetpass?token=<userId>.<token>` | Reset password | Public |

Signup body:

```json
{
  "name": "Ali Khan",
  "email": "ali@example.com",
  "password": "password123"
}
```

Login body:

```json
{
  "email": "ali@example.com",
  "password": "password123"
}
```

Forgot password body:

```json
{
  "email": "ali@example.com"
}
```

Reset password body:

```json
{
  "password": "new-password123"
}
```

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

Product read routes are public. Product write routes require authentication and the required role.

| Method | Route | Description | Roles |
| --- | --- | --- | --- |
| `GET` | `/api/products?page=1&limit=10` | List products with pagination, filtering, sorting, and search | Public |
| `GET` | `/api/products/:id` | Get product by ID | Public |
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
| `DELETE` | `/api/cart/items/:id` | Remove a product from the cart by product ID | Any authenticated user |
| `DELETE` | `/api/cart/items` | Empty the current user's cart | Any authenticated user |

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
- `DELETE /api/cart/items/:id` treats `:id` as the product ID.
- `DELETE /api/cart/items` empties the full cart and returns `204 No Content`.
- Cart quantity cannot be greater than product stock.
- Product IDs and quantities must be positive integers.

### Orders

All order routes require authentication.

| Method | Route | Description | Roles |
| --- | --- | --- | --- |
| `POST` | `/api/orders` | Create an order from the current user's cart | Any authenticated user |
| `GET` | `/api/orders` | List current user's orders, or all orders for staff/admin users | Any authenticated user |
| `GET` | `/api/orders/:id` | Get order by ID | Any authenticated user |
| `PATCH` | `/api/orders/:id` | Update order status | `ADMIN`, `STAFF` |

Update order status body:

```json
{
  "status": "SHIPPED"
}
```

Allowed order statuses:

```txt
PENDING
CONFIRMED
PROCESSING
SHIPPED
```

Order behavior notes:

- Creating an order requires a non-empty cart.
- Each cart item is copied into `OrderItem` with the product title and price at checkout time.
- Product stock is decremented by the ordered quantity.
- The user's cart is emptied after a successful order transaction.
- New orders are confirmed after checkout.

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

Some delete operations return `204 No Content`.

## Testing

Run the full test suite:

```bash
cd backend
pnpm test
```

Run selected tests:

```bash
pnpm vitest run test/product.service.test.ts
pnpm vitest run test/cart.router.test.ts
pnpm vitest run test/order.router.test.ts
```

The test suite includes:

- Router tests for auth, users, products, categories, carts, and orders
- Controller tests for auth, products, users, and orders
- Service tests for product and order behavior, including Prisma query shape and transaction behavior
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
- `Order`
- `OrderItem`
- `Password_reset_token`

Roles:

```txt
ADMIN
STAFF
BUYER
```

## Development Notes

- Product read routes are public; product write routes are protected by authentication and roles.
- Category, user, and cart routes are protected behind authentication unless documented as public auth routes.
- Order routes are authenticated; status updates are limited to `ADMIN` and `STAFF`.
- Password reset emails use Nodemailer with configured sender credentials.
- Password reset links use `FRONTEND_URL` as the base URL, falling back to the backend URL when no frontend is configured.
- Prisma client output is configured to `backend/src/generated/prisma`.
- Docker configuration and seed scripts have not been added yet.
