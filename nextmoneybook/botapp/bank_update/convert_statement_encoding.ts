import fs from "fs";

const Iconv = require('iconv').Iconv;

export default function convertStatementEncoding(statementFilePath: string) {
    const iconv = new Iconv('CP1250', 'UTF-8');
    const buffer = iconv.convert(fs.readFileSync(statementFilePath));

    const newFilePath = statementFilePath.replace('.csv', '_utf8.csv')
    fs.writeFileSync(newFilePath, buffer.toString(), 'utf8');

    return newFilePath;
}