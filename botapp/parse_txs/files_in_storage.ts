import fs from "fs";
import type { FileInStorage } from "./types";
import { getStoragePath } from "../utils/get_storage_path";

export const getStatementsInStorage = (): Promise<FileInStorage[]> => {
  return new Promise((resolve, reject) => {
    fs.readdir(getStoragePath(), (err, files) => {
      if (err) reject(err);

      resolve(
        files
          .filter((file) => {
            return file.match(/^rb_/) && file.endsWith(".csv");
          })
          .map((file) => {
            return {
              filename: file,
              fullPath: getStoragePath(file),
            };
          })
      );
    });
  });
};

export const markFileAsDone = (file: FileInStorage) => {
  fs.renameSync(file.fullPath, file.fullPath + ".done");
};
