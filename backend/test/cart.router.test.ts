import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { prisma } from "../src/config/db.js";
import { errorHandler } from "../src/middleware/errorHandler.middleware.js";
import generateToken from "../src/utils/generateToken.js";

const createTestApp = async () => {
  const { default: cartRouter } = await import("../src/routes/cart.router.js");
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/cart", cartRouter);
  app.use(errorHandler);

  return app;
};

const testRunId = `cart-test-${Date.now()}`;
let testCounter = 0;
let createdUserIds: number[] = [];
let createdProductIds: number[] = [];

const createUser = async () => {
  testCounter += 1;
  const user = await prisma.user.create({
    data: {
      name: "Cart Test User",
      email: `${testRunId}-${testCounter}@example.com`,
      password: "hashed-test-password",
      role: "BUYER",
    },
  });
  createdUserIds.push(user.id);

  return user;
};

const createProduct = async (stock: number) => {
  testCounter += 1;
  const product = await prisma.product.create({
    data: {
      title: `${testRunId}-product-${testCounter}`,
      description: "Product created by cart integration tests",
      price: 19.99,
      stock,
      images: "cart-test.jpg",
    },
  });
  createdProductIds.push(product.id);

  return product;
};

const authHeaderFor = (userId: number) => ({
  Authorization: `Bearer ${generateToken({ userId, role: "BUYER" })}`,
});

describe("/api/cart", () => {
  afterEach(async () => {
    await prisma.cartItem.deleteMany({
      where: {
        OR: [
          { cart: { userId: { in: createdUserIds } } },
          { productId: { in: createdProductIds } },
        ],
      },
    });
    await prisma.cart.deleteMany({
      where: {
        userId: {
          in: createdUserIds,
        },
      },
    });
    await prisma.product.deleteMany({
      where: {
        id: {
          in: createdProductIds,
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: {
          in: createdUserIds,
        },
      },
    });

    createdUserIds = [];
    createdProductIds = [];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("rejects requests without a valid JWT", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/cart/items");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      status: false,
      msg: "Invalid or expired token",
    });
  });

  it("returns an empty cart for an authenticated user with no cart", async () => {
    const app = await createTestApp();
    const user = await createUser();

    const response = await request(app)
      .get("/api/cart/items")
      .set(authHeaderFor(user.id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: true,
      msg: "Empty Cart",
      data: [],
    });
  });

  it("creates a cart and adds a product for the authenticated user", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(5);

    const response = await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 2 });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      status: true,
      msg: "Product added to Cart",
      data: {
        productId: product.id,
        quantity: 2,
      },
    });

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cart: {
          userId: user.id,
        },
        productId: product.id,
      },
    });
    expect(cartItem?.quantity).toBe(2);
  });

  it("increments quantity when the product is already in the cart", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(5);

    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 2 })
      .expect(201);

    const response = await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 3 });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      productId: product.id,
      quantity: 5,
    });

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cart: {
          userId: user.id,
        },
        productId: product.id,
      },
    });
    expect(cartItem?.quantity).toBe(5);
  });

  it("returns cart products for the authenticated user", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(3);

    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 1 })
      .expect(201);

    const response = await request(app)
      .get("/api/cart/items")
      .set(authHeaderFor(user.id));

    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("Cart Fetched Successfully");
    expect(response.body.data.userId).toBe(user.id);
    expect(response.body.data.cartItems).toHaveLength(1);
    expect(response.body.data.cartItems[0].product).toMatchObject({
      id: product.id,
      title: product.title,
      stock: product.stock,
    });
  });

  it("rejects invalid add-to-cart payloads before writing a cart item", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(5);

    const response = await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 0 });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(false);

    const cartItemCount = await prisma.cartItem.count({
      where: {
        productId: product.id,
      },
    });
    expect(cartItemCount).toBe(0);
  });

  it("returns 404 when the product does not exist", async () => {
    const app = await createTestApp();
    const user = await createUser();

    const response = await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: 999_999_999, quantity: 1 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: false,
      msg: "Product Not found",
    });
  });

  it("rejects products that are out of stock", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(0);

    const response = await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 1 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: false,
      msg: "Not in stock",
    });
  });

  it("rejects an initial quantity greater than available stock", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(2);

    const response = await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 3 });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      status: false,
      msg: "Quantity greater than Stock",
    });
  });

  it("rejects an increment that would exceed available stock", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(4);

    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 3 })
      .expect(201);

    const response = await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 2 });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      status: false,
      msg: "Quantity greater than Stock",
    });

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cart: {
          userId: user.id,
        },
        productId: product.id,
      },
    });
    expect(cartItem?.quantity).toBe(3);
  });
});
