import fs from "fs";
import path from "path";
import {FileInStorage} from "./types";

export const getAllFilesInStorage = (): Promise<FileInStorage[]> => {
    return new Promise((resolve, reject) => {
        fs.readdir(path.join(__dirname, '../../storage'), (err, files) => {
            if (err) reject(err);

            resolve(files.filter(file => {
                return file.endsWith('.csv');
            }).map(file => {
                return {
                    filename: file,
                    fullPath: path.join(__dirname, '../../storage', file)
                }
            }));
        });
    })
}

export const markFileAsDone = (file: FileInStorage) => {
    fs.renameSync(file.fullPath, file.fullPath + '.done')
}

