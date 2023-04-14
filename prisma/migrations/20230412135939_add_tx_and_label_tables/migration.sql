-- CreateTable
CREATE TABLE "Transaction" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LabelsOnTransactions" (
    "labelId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("labelId", "transactionId"),
    CONSTRAINT "LabelsOnTransactions_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LabelsOnTransactions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
