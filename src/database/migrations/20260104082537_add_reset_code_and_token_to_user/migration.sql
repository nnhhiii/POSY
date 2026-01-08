-- AlterTable
ALTER TABLE "users" ADD COLUMN     "reset_code" TEXT,
ADD COLUMN     "reset_code_exp" TIMESTAMP(3),
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_exp" TIMESTAMP(3);
