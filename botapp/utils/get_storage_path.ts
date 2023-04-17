import path from "path";

export function getStoragePath(appendPath: string = "") {
  // if STORAGE_PATH is not set, use /data from the root
  if (!process.env.STORAGE_PATH) {
    return path.join('/data', appendPath);
  }
  
  let storagePath = process.env.STORAGE_PATH;
  storagePath = storagePath[0] === "/" ? storagePath : `/${storagePath}`;

  return path.join(__dirname, `../..${storagePath}/`, appendPath);
}
