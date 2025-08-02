/**
 * @fileOverview FileSystem Methods
 */
import fs from "fs";

/**
 * creates folder if not exists
 * @param {string} path
 */
async function ensureFolderExists(path) {
  try {
    await fs.promises.access(path, fs.constants.F_OK); // check if folder exists
  } catch (error) {
    console.log(error);
    await fs.promises.mkdir(path, { recursive: true });
  }
}

/**
 * upload file
 * @param {object} file
 * @param {string} destinationFilePath
 * @return {Promise<boolean>}
 */
async function uploadBase64File(file, destinationFilePath) {
  if (!destinationFilePath) return false;
  await ensureFolderExists(destinationFilePath);
  try {
    const buffer = Buffer.from(file.content, 'base64');
    await fs.promises.writeFile(`${destinationFilePath}/${file.name}`, buffer);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}


export { ensureFolderExists, uploadBase64File }