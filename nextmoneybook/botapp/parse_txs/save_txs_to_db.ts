import { Transaction, TransactionDbResult } from "./types";
import prisma from "../db";

export default async function saveTransactionsToDb(
  values: Transaction[]
): Promise<TransactionDbResult> {
  // fetch existing IDs from DB
  const transactionsImportTxIds = values.map((value) => value.importTxId);

  const existingTransactions = await prisma.transaction.findMany({
    select: {
      importTxId: true,
    },
    where: {
      importTxId: {
        in: transactionsImportTxIds,
      },
    },
  });

  const existingTransactionsImportTxIds = existingTransactions.map(
    (tx) => tx.importTxId
  );

  // reject existing transactions and then create the missing ones
  const transactions = values
    .filter(
      (value) => !existingTransactionsImportTxIds.includes(value.importTxId)
    )
    .map((value) =>
      prisma.transaction.create({
        data: value,
      })
    );

  // insert
  await Promise.all(transactions);

  return {
    added: transactions.length,
    total: values.length,
    skipped: values.length - transactions.length,
  };
}
