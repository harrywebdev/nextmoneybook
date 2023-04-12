/*
  Warnings:

  - A unique constraint covering the columns `[importTxId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transaction_importTxId_key" ON "Transaction"("importTxId");
