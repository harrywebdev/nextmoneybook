import {Transaction} from "./types";
import {Transaction as PrismaTransaction} from "@prisma/client";
import prisma from "../db";

export default async function saveTransactionsToDb(values: Transaction[]): Promise<PrismaTransaction[]> {
    // console.log(`values`, values);
    // fetch existing IDs from DB
    const transactionsImportTxIds = values.map(value => value.importTxId);

    const existingTransactions = await prisma.transaction.findMany({
        select: {
            importTxId: true
        },
        where: {
            importTxId: {
                in: transactionsImportTxIds
            }
        }
    });

    const existingTransactionsImportTxIds = existingTransactions.map(tx => tx.importTxId);

    // reject existing transactions and then create the missing ones
    const transactions = values
        .filter(value => !existingTransactionsImportTxIds.includes(value.importTxId))
        .map(value => prisma.transaction.create({
            data: value
        }))

    // insert
    return await Promise.all(transactions)
}