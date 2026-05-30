import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
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

vi.setConfig({
  hookTimeout: 20_000,
  testTimeout: 20_000,
});

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
    const carts = await prisma.cart.findMany({
      where: {
        userId: {
          in: createdUserIds,
        },
      },
      select: {
        id: true,
      },
    });
    const cartIds = carts.map((cart :any) => cart.id);

    await prisma.cartItem.deleteMany({
      where: {
        OR: [
          { cartId: { in: cartIds } },
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

    const response = await request(app).get("/api/cart");

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
      .get("/api/cart")
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
      .get("/api/cart")
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

  it("updates an existing cart item quantity", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(5);

    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 2 })
      .expect(201);

    const response = await request(app)
      .patch("/api/cart")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 4 });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: true,
      msg: "Updated Successfully",
      data: {
        productId: product.id,
        quantity: 4,
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
    expect(cartItem?.quantity).toBe(4);
  });

  it("rejects invalid update-cart payloads before changing a cart item", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(5);

    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 2 })
      .expect(201);

    const response = await request(app)
      .patch("/api/cart")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 0 });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(false);

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

  it("returns 404 when updating a user with no cart", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(5);

    const response = await request(app)
      .patch("/api/cart")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 1 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: false,
      msg: `Cart not found for user with id  : ${user.id}`,
    });
  });

  it("returns 404 when updating a product that is not in the cart", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const productInCart = await createProduct(5);
    const productNotInCart = await createProduct(5);

    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: productInCart.id, quantity: 2 })
      .expect(201);

    const response = await request(app)
      .patch("/api/cart")
      .set(authHeaderFor(user.id))
      .send({ productId: productNotInCart.id, quantity: 1 });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      status: false,
      msg: "Item to update not found",
    });

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        cart: {
          userId: user.id,
        },
        productId: productInCart.id,
      },
    });
    expect(cartItem?.quantity).toBe(2);
  });

  it("rejects updates that set quantity greater than available stock", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(2);

    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 2 })
      .expect(201);

    const response = await request(app)
      .patch("/api/cart")
      .set(authHeaderFor(user.id))
      .send({ productId: product.id, quantity: 3 });

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
    expect(cartItem?.quantity).toBe(2);
  });

  it("removes an existing item from the authenticated user's cart", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const productToRemove = await createProduct(5);
    const productToKeep = await createProduct(5);

    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: productToRemove.id, quantity: 2 })
      .expect(201);
    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: productToKeep.id, quantity: 1 })
      .expect(201);

    const response = await request(app)
      .delete(`/api/cart/items/${productToRemove.id}`)
      .set(authHeaderFor(user.id));

    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("Item Removed Successfully");
    expect(response.body.data.cartItems).toHaveLength(1);
    expect(response.body.data.cartItems[0]).toMatchObject({
      quantity: 1,
      product: {
        id: productToKeep.id,
      },
    });

    const deletedItem = await prisma.cartItem.findFirst({
      where: {
        cart: {
          userId: user.id,
        },
        productId: productToRemove.id,
      },
    });
    expect(deletedItem).toBeNull();
  });

  it("leaves the cart unchanged when deleting a product that is not in it", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const productInCart = await createProduct(5);
    const productNotInCart = await createProduct(5);

    await request(app)
      .post("/api/cart/items")
      .set(authHeaderFor(user.id))
      .send({ productId: productInCart.id, quantity: 2 })
      .expect(201);

    const response = await request(app)
      .delete(`/api/cart/items/${productNotInCart.id}`)
      .set(authHeaderFor(user.id));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: true,
      msg: "Item Removed Successfully",
      data: {
        userId: user.id,
      },
    });
    expect(response.body.data.cartItems).toHaveLength(1);
    expect(response.body.data.cartItems[0]).toMatchObject({
      quantity: 2,
      product: {
        id: productInCart.id,
      },
    });

    const cartItemCount = await prisma.cartItem.count({
      where: {
        cart: {
          userId: user.id,
        },
      },
    });
    expect(cartItemCount).toBe(1);
  });

  it("returns an empty list when deleting from a user with no cart", async () => {
    const app = await createTestApp();
    const user = await createUser();
    const product = await createProduct(5);

    const response = await request(app)
      .delete(`/api/cart/items/${product.id}`)
      .set(authHeaderFor(user.id));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: true,
      msg: "Item Removed Successfully",
      data: [],
    });
  });

  it("rejects delete requests with an invalid product id", async () => {
    const app = await createTestApp();
    const user = await createUser();

    const response = await request(app)
      .delete("/api/cart/items/not-a-number")
      .set(authHeaderFor(user.id));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      status: false,
      msg: "Invalid Product Id",
    });
  });
});
