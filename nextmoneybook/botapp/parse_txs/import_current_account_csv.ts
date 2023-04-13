import {CurrentAccountCsvRow, Transaction, TransactionAccountType, TransactionCategory} from "./types";
import saveTransactionsToDb from "./save_txs_to_db";

const md5 = require('md5');

function transformCategory(category: string) {
    if (category.indexOf('Trval') >= 0) {
        return TransactionCategory.StandingOrder
    }

    if (category.indexOf('Inkaso') >= 0) {
        return TransactionCategory.DirectDebit
    }

    if (category.indexOf('bankomat') >= 0) {
        return TransactionCategory.Atm
    }

    if (category.indexOf('kartou') >= 0) {
        return TransactionCategory.CardPayment
    }

    if (category.indexOf('Poplatek') >= 0) {
        return TransactionCategory.Fee
    }

    if (category.indexOf('Platba') >= 0) {
        return TransactionCategory.Payment
    }

    if (category.indexOf('rok') >= 0) {
        return TransactionCategory.Interest
    }

    return TransactionCategory.Unknown;
}

function transformAmount(amount: string) {
    // eg. -23 305,68
    return parseInt(amount.replace(/[ , ]*/gi, ''), 10);
}

function transformDate(dateString: string) {
    // eg. 03.04.2023
    // eg. 29.03.2023 06:06
    const [date, time] = dateString.split(' ');

    const timeDefault = (timeChunk: string | undefined) => timeChunk ? timeChunk : '00'

    const dateChunks = date.substring(0, 10).split('.')
    const timeChunks = time ? time.split(':') : ['00', '00', '00']
    const formattedDate = `${dateChunks[2]}-${dateChunks[1]}-${dateChunks[0]}`
    const formattedTime = `${timeDefault(timeChunks[0])}:${timeDefault(timeChunks[1])}:${timeDefault(timeChunks[2])}`

    return new Date(`${formattedDate} ${formattedTime}.000Z`)
}

export default async function importCurrentAccountCsv(csv: CurrentAccountCsvRow[]) {
    const values: Transaction[] = csv.map(row => {
        // the strings are terrible, let's just use indexes
        const rowValues = Object.values(row);

        const value = {
            accountType: TransactionAccountType.BankAccount,
            account: rowValues[2],
            dateCreated: transformDate(rowValues[0]),
            dateCharged: transformDate(rowValues[1]),
            category: transformCategory(rowValues[4]),
            offsetAccount: rowValues[5] || null,
            customNote: `${rowValues[6] !== "" ? rowValues[6] + ', ' : ''}${rowValues[19] !== "" ? rowValues[19] + ', ' : ''}${rowValues[9]}` || null,
            message: rowValues[8] || null,
            amount: transformAmount(rowValues[13]),
            currency: rowValues[14],
            txId: String(rowValues[17]),
            importTxId: '',
        }

        value.importTxId = md5(`${value.txId}${value.dateCreated}${value.amount}`)

        return value;
    });

    // save the values in DB
    return await saveTransactionsToDb(values)
}