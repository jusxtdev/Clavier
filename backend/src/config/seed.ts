import bcrypt from "bcrypt";
import { disconnectDB, prisma } from "@/config/db.js";
import { Role } from "@/generated/prisma/client.js";

const DEFAULT_PASSWORD = "Password123";

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    role: Role.ADMIN,
  },
  {
    name: "Staff User",
    email: "staff@example.com",
    role: Role.STAFF,
  },
  {
    name: "Buyer User",
    email: "buyer@example.com",
    role: Role.BUYER,
  },
];

const categories = [
  {
    title: "gaming",
    description: "Fast, responsive keyboards for gaming setups.",
  },
  {
    title: "wireless",
    description: "Bluetooth and low-latency wireless keyboards.",
  },
  {
    title: "mechanical",
    description: "Mechanical keyboards with tactile, linear, or clicky switches.",
  },
  {
    title: "custom",
    description: "Hot-swappable and enthusiast keyboards for custom builds.",
  },
  {
    title: "keycaps",
    description: "Keycap sets for customizing keyboard layouts and themes.",
  },
  {
    title: "accessories",
    description: "Keyboard desk mats, cables, switch pullers, and maintenance tools.",
  },
];

const products = [
  {
    title: "Wireless Mechanical Keyboard",
    description: "Compact hot-swappable keyboard with low-latency wireless.",
    price: 89.99,
    stock: 24,
    images: "https://keychron.in/wp-content/uploads/2023/10/Keychron-K3-Pro-QMK-VIA-ultra-slim-custom-mechanical-keyboard-75-percent-layout-for-Mac-Windows-Linux-White-RGB-low-profile-Gateron-red_1800x1800-1536x1536.jpg",
    categories: ["wireless", "mechanical", "custom"],
  },
  {
    title: "RGB Gaming Keyboard",
    description: "Full-size mechanical keyboard with RGB lighting and fast switches.",
    price: 109.99,
    stock: 16,
    images: "https://keychron.in/wp-content/uploads/2022/02/oem-dye-sub-pbt-keycap-set-q2_1800x1800.jpg",
    categories: ["gaming", "mechanical"],
  },
  {
    title: "PBT Keycap Set",
    description: "Durable double-shot PBT keycaps for compact and full-size boards.",
    price: 54.99,
    stock: 35,
    images: "https://keychron.in/wp-content/uploads/2022/08/Keychron-PBT-Keycaps-Christmas-gift_1800x1800-900x900.jpg",
    categories: ["keycaps", "custom"],
  }
];

const seed = async () => {
  const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  await prisma.$transaction(
    async (tx) => {
      for (const user of users) {
        await tx.user.upsert({
          where: {
            email: user.email,
          },
          update: {
            name: user.name,
            role: user.role,
          },
          create: {
            ...user,
            password,
          },
        });
      }

      for (const category of categories) {
        await tx.category.upsert({
          where: {
            title: category.title,
          },
          update: {
            description: category.description,
          },
          create: category,
        });
      }

      for (const product of products) {
        const { categories: productCategories, ...productData } = product;

        const savedProduct = await tx.product.upsert({
          where: {
            title: product.title,
          },
          update: productData,
          create: productData,
        });

        for (const categoryTitle of productCategories) {
          const category = await tx.category.findUniqueOrThrow({
            where: {
              title: categoryTitle,
            },
          });

          await tx.categoriesOnProducts.upsert({
            where: {
              productId_categoryId: {
                productId: savedProduct.id,
                categoryId: category.id,
              },
            },
            update: {},
            create: {
              productId: savedProduct.id,
              categoryId: category.id,
            },
          });
        }
      }

      const buyer = await tx.user.findUniqueOrThrow({
        where: {
          email: "buyer@example.com",
        },
      });

      const keyboard = await tx.product.findUniqueOrThrow({
        where: {
          title: "Wireless Mechanical Keyboard",
        },
      });

      const cart = await tx.cart.upsert({
        where: {
          userId: buyer.id,
        },
        update: {},
        create: {
          userId: buyer.id,
        },
      });

      await tx.cartItem.upsert({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: keyboard.id,
          },
        },
        update: {
          quantity: 1,
        },
        create: {
          cartId: cart.id,
          productId: keyboard.id,
          quantity: 1,
        },
      });
    },
    {
      timeout: 20000,
    },
  );
};

seed()
  .then(() => {
    console.log("Database seeded successfully");
    console.log(`Demo password for all seeded users: ${DEFAULT_PASSWORD}`);
  })
  .catch((error) => {
    console.error("Database seed failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
