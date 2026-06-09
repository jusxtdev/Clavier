import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/utils/AppError.js";

const mockTx = vi.hoisted(() => ({
  order: {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  orderItem: {
    createMany: vi.fn(),
  },
  product: {
    update: vi.fn(),
  },
}));

const mockPrisma = vi.hoisted(() => ({
  $transaction: vi.fn(),
  order: {
    update: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
}));

const mockCartService = vi.hoisted(() => ({
  getUserCart: vi.fn(),
  emptyCart: vi.fn(),
}));

vi.mock("@/config/db.js", () => ({
  prisma: mockPrisma,
}));

vi.mock("@/services/cart.service.js", () => ({
  default: mockCartService,
}));

const { default: OrderService } = await import(
  "../src/services/order.service.js"
);

describe("OrderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) =>
      callback(mockTx),
    );
  });

  it("creates an order from the user's cart in a transaction", async () => {
    const cart = {
      id: 3,
      userId: 5,
      cartItems: [
        {
          quantity: 2,
          product: {
            id: 10,
            title: "Running Shoe",
            description: "Lightweight shoe",
            price: 99.99,
            stock: 7,
            images: "shoe.jpg",
          },
        },
        {
          quantity: 1,
          product: {
            id: 11,
            title: "Cap",
            description: "Cotton cap",
            price: 19.99,
            stock: 4,
            images: "cap.jpg",
          },
        },
      ],
    };
    const createdOrder = { id: 20, userId: 5, status: "PENDING" };
    mockCartService.getUserCart.mockResolvedValue(cart);
    mockTx.order.create.mockResolvedValue(createdOrder);

    const result = await OrderService.createOrder(5);

    expect(result).toBe(createdOrder);
    expect(mockCartService.getUserCart).toHaveBeenCalledWith(mockPrisma, 5);
    expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockTx.order.create).toHaveBeenCalledWith({
      data: {
        userId: 5,
      },
    });
    expect(mockTx.orderItem.createMany).toHaveBeenCalledWith({
      data: [
        {
          orderId: 20,
          productId: 10,
          productTitle: "Running Shoe",
          productPrice: 99.99,
          quantity: 2,
        },
        {
          orderId: 20,
          productId: 11,
          productTitle: "Cap",
          productPrice: 19.99,
          quantity: 1,
        },
      ],
    });
    expect(mockTx.product.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { stock: { decrement: 2 } },
    });
    expect(mockTx.product.update).toHaveBeenCalledWith({
      where: { id: 11 },
      data: { stock: { decrement: 1 } },
    });
    expect(mockCartService.emptyCart).toHaveBeenCalledWith(mockTx, 5);
    expect(mockTx.order.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { status: "CONFIRMED" },
    });
  });

  it("rejects checkout when the cart is missing or empty", async () => {
    mockCartService.getUserCart.mockResolvedValue({
      id: 3,
      userId: 5,
      cartItems: [],
    });

    await expect(OrderService.createOrder(5)).rejects.toMatchObject({
      statusCode: 400,
      message: "Cart is empty",
    } satisfies Partial<AppError>);

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects checkout when a cart item quantity exceeds stock", async () => {
    mockCartService.getUserCart.mockResolvedValue({
      id: 3,
      userId: 5,
      cartItems: [
        {
          quantity: 6,
          product: {
            id: 10,
            title: "Running Shoe",
            description: "Lightweight shoe",
            price: 99.99,
            stock: 5,
            images: "shoe.jpg",
          },
        },
      ],
    });

    await expect(OrderService.createOrder(5)).rejects.toMatchObject({
      statusCode: 400,
      message: "Not enough stock for Running Shoe",
    } satisfies Partial<AppError>);

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("scopes getOrders to the buyer's user id", async () => {
    const orders = [{ id: 20, userId: 5, status: "CONFIRMED" }];
    mockPrisma.order.findMany.mockResolvedValue(orders);

    const result = await OrderService.getOrders(mockPrisma, 5, "BUYER");

    expect(result).toBe(orders);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 5,
        },
      }),
    );
  });

  it("does not user-scope getOrders for staff/admin roles", async () => {
    const orders = [{ id: 20, userId: 5, status: "CONFIRMED" }];
    mockPrisma.order.findMany.mockResolvedValue(orders);

    const result = await OrderService.getOrders(mockPrisma, 1, "ADMIN");

    expect(result).toBe(orders);
    expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
      }),
    );
  });

  it("fetches one order with its order items", async () => {
    const order = { id: 20, userId: 5, status: "CONFIRMED", orderItems: [] };
    mockPrisma.order.findUniqueOrThrow.mockResolvedValue(order);

    const result = await OrderService.getOrderById(mockPrisma, 20);

    expect(result).toBe(order);
    expect(mockPrisma.order.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 20,
        },
        select: expect.objectContaining({
          orderItems: {
            select: {
              id: true,
              productId: true,
              productTitle: true,
              productPrice: true,
              quantity: true,
            },
          },
        }),
      }),
    );
  });

  it("updates an order status", async () => {
    mockPrisma.order.update.mockResolvedValue({ id: 20, status: "SHIPPED" });

    await OrderService.updateStatus(mockPrisma, 20, "SHIPPED");

    expect(mockPrisma.order.update).toHaveBeenCalledWith({
      where: {
        id: 20,
      },
      data: {
        status: "SHIPPED",
      },
    });
  });
});
