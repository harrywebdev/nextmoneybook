import {
    CreditCardCsvRow,
    Transaction,
    TransactionAccountType,
    TransactionCategory
} from "./types";
import saveTransactionsToDb from "./save_txs_to_db";

const md5 = require('md5');

function transformCategory(category: string) {
    if (category.indexOf('Platba') >= 0) {
        return TransactionCategory.Payment
    }

    if (category.indexOf('bankomat') >= 0) {
        return TransactionCategory.Atm
    }

    if (category.indexOf('Poplat') >= 0) {
        return TransactionCategory.Fee
    }

    if (category.indexOf('Splátk') >= 0) {
        return TransactionCategory.Repayment
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

export default async function importCreditCardCsv(csv: CreditCardCsvRow[]) {
    const values: Transaction[] = csv.map(row => {
        // the strings are terrible, let's just use indexes
        const rowValues = Object.values(row);

        const value = {
            accountType: TransactionAccountType.CreditCard,
            account: rowValues[0],
            dateCreated: transformDate(rowValues[2]),
            dateCharged: transformDate(rowValues[3]),
            category: transformCategory(rowValues[4]),
            offsetAccount: null,
            customNote: `${rowValues[11] !== "" ? rowValues[11] + ', ' : ''}${rowValues[10] !== "" ? rowValues[10] + ', ' : ''}${rowValues[12]}` || null,
            message: null,
            amount: transformAmount(rowValues[7]),
            currency: rowValues[8],
            txId: '',
            importTxId: '',
            rawData: JSON.stringify(rowValues),
        }

        value.importTxId = md5(`${value.txId}${value.dateCreated}${value.amount}`)

        return value;
    });

    // save the values in DB
    return await saveTransactionsToDb(values)
}