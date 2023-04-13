/*
  Warnings:

  - Added the required column `rawData` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountType" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "dateCreated" DATETIME NOT NULL,
    "dateCharged" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "offsetAccount" TEXT,
    "customNote" TEXT,
    "message" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "txId" TEXT NOT NULL,
    "importTxId" TEXT NOT NULL,
    "rawData" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Transaction" ("account", "accountType", "amount", "category", "createdAt", "currency", "customNote", "dateCharged", "dateCreated", "id", "importTxId", "message", "offsetAccount", "txId", "updatedAt") SELECT "account", "accountType", "amount", "category", "createdAt", "currency", "customNote", "dateCharged", "dateCreated", "id", "importTxId", "message", "offsetAccount", "txId", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_importTxId_key" ON "Transaction"("importTxId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
