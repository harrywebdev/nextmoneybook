import {CreditCardCsvRow, CurrentAccountCsvRow, FileInStorage, TransactionImportResult} from "./types";
import fs from "fs";
import csv from "csv-parser"
import importCurrentAccountCsv from "./import_current_account_csv";

const readFile = async <T>(pathToFile: string): Promise<T[]> => {
    const results: T[] = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(pathToFile)
            .pipe(csv({
                separator: ';',
            }))
            .on('error', (error) => {
                console.error(error)
                reject(error)
            })
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results)
            })
    })
}

export const runImport = async (file: FileInStorage): Promise<TransactionImportResult> => {
    console.log(`Importing ${file.fullPath}`);

    switch (true) {
        // import credit card statement
        case file.filename.indexOf('rb_cc') >= 0:
            return {
                ...await importCreditCardCsv(await readFile<CreditCardCsvRow>(file.fullPath)),
                filename: file.filename,
                action: "import",
            }

        // import current account statement
        case file.filename.indexOf('rb_ca') >= 0:
            return {
                ...await importCurrentAccountCsv(await readFile<CurrentAccountCsvRow>(file.fullPath)),
                filename: file.filename,
                action: "import",
            }

        default:
            return {
                added: 0,
                ignored: 0,
                total: 0,
                filename: file.filename,
                action: "skip"
            }
    }
}