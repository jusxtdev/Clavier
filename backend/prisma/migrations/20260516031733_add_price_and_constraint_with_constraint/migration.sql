/*
  Warnings:

  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "price" INTEGER NOT NULL,
ADD COLUMN "stock" INTEGER NOT NULL,
ADD CONSTRAINT stock_non_negative CHECK ("stock" >=0),
ADD CONSTRAINT price_positive CHECK ("price" > 0);
