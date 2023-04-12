import {Telegraf} from "telegraf";
import {getAllFilesInStorage, markFileAsDone} from "./parse_txs/files_in_storage";
import {runImport} from "./parse_txs/run_import";
import * as process from "process";
import prisma from "./db";


const getAllImports = () => {
    return prisma.transactionsImport.findMany();
}

export default async function parser(bot: Telegraf) {
    const doneImports = await getAllImports();
    const importFiles = await getAllFilesInStorage();

    for (const file of importFiles) {
        // already imported, mark as done
        if (doneImports.filter(txImport => txImport.filename === file.filename).length > 0) {
            markFileAsDone(file);
            continue;
        }

        await runImport(file);

        // TODO: mark as done

        // TODO: notify user via bot
    }
}