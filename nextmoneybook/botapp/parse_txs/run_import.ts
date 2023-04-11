import {FileInStorage} from "./types";
import fs from "fs";
import csv from "csv-parser"
import importCurrentAccountCsv, {CurrentAccountCsvRow} from "./import_current_account_csv";

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

export const runImport = async (file: FileInStorage) => {
    console.log(`Importing ${file.fullPath}`);

    switch (true) {
        // import credit card statement
        case file.filename.indexOf('rb_cc') >= 0:
            // TODO
            return;

        // import current account statement
        case file.filename.indexOf('rb_ca') >= 0:
            const csv = await readFile<CurrentAccountCsvRow>(file.fullPath);

            await importCurrentAccountCsv(csv);
            return;
    }

    // TODO: return result
}