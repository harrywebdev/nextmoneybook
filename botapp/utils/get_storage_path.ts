import path from "path";

export function getStoragePath(appendPath: string = "") {
  let storagePath = process.env.STORAGE_PATH || "/data";
  storagePath = storagePath[0] === "/" ? storagePath : `/${storagePath}`;

  return path.join(__dirname, `../..${storagePath}/`, appendPath);
}
