import fs from "fs";
import path from "path";

export function checkExistsWithTimeout(filePath: string, timeout: number) {
    return new Promise<void>(function (resolve, reject) {

        const timer = setTimeout(function () {
            watcher.close();
            reject(new Error('File did not exists and was not created during the timeout.'));
        }, timeout);

        fs.access(filePath, fs.constants.R_OK, function (err) {
            if (!err) {
                clearTimeout(timer);
                watcher.close();
                resolve();
            }
        });

        const dir = path.dirname(filePath);
        const basename = path.basename(filePath);
        const watcher = fs.watch(dir, function (eventType, filename) {
            if (eventType === 'rename' && filename === basename) {
                clearTimeout(timer);
                watcher.close();
                resolve();
            }
        });
    });
}

export function moveFile(fromPath: string, toPath: string) {
    return new Promise<void>(function (resolve, reject) {
        fs.rename(fromPath, toPath, function (err) {
            if (err) {
                reject(new Error('File did not move.'));
                throw err;
            } else {
                resolve();
            }
        });
    });
}