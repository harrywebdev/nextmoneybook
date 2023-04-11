import {FileInStorage} from "./types";

export const runImport = async (file: FileInStorage) => {
    console.log(`Importing ${file.fullPath}`)
}