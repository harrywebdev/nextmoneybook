import {Telegraf} from "telegraf";
import {PrismaClient} from "@prisma/client";
import {getAllFilesInStorage, markFileAsDone} from "./parse_txs/files_in_storage";
import {runImport} from "./parse_txs/run_import";


const getAllImports = () => {
    const prisma = new PrismaClient();
    return prisma.transactionsImport.findMany();
}

export default async function parser(bot: Telegraf) {
    const doneImports = await getAllImports();
    const importFiles = await getAllFilesInStorage();

    importFiles.forEach((file) => {
        // already imported, mark as done
        if (doneImports.filter(txImport => txImport.filename === file.filename).length > 0) {
            markFileAsDone(file);
            return
        }

        runImport(file);
    })
}