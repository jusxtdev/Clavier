-- CreateTable
CREATE TABLE "Password_reset_token" (
    "token" TEXT NOT NULL,
    "token_expiry" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Password_reset_token_pkey" PRIMARY KEY ("token","userId")
);

-- AddForeignKey
ALTER TABLE "Password_reset_token" ADD CONSTRAINT "Password_reset_token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
