import {getStatementsInStorage, markFileAsDone} from "./parse_txs/files_in_storage";
import {runImport} from "./parse_txs/run_import";
import prisma from "./db";

const getAllImports = () => {
    return prisma.transactionsImport.findMany();
}

export default async function parser(sendMessage: (message: string) => void) {
    const doneImports = await getAllImports();
    const importFiles = await getStatementsInStorage();

    for (const file of importFiles) {
        // already imported, mark as done
        if (doneImports.filter(txImport => txImport.filename === file.filename).length > 0) {
            markFileAsDone(file);
            continue;
        }

        const importResult = await runImport(file);

        if (importResult.action === "import") {
            await prisma.transactionsImport.create({
                data: {
                    filename: file.filename
                }
            });

            markFileAsDone(file);

            const message = [
                `Imported ${file.filename} ✅.`,
                `Added ${importResult.added}, ignored ${importResult.ignored}, total of ${importResult.total} transactions.`
            ]

            await sendMessage(message.join("\n"));
        }
    }
}