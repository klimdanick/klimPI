import fs from "fs"
import path from "path"
import File from "../models/fileModel.js"
import { v4 as uuidv4 } from "uuid"

const _dirname = path.dirname(new URL(import.meta.url).pathname)
const filesDir = path.join(_dirname, "..", "files")


export let files = [];

export const loadFiles = () => {

    files = fs.readdirSync(filesDir).map(fileName => {
        const filePath = path.join(filesDir, fileName)
        const stats = fs.statSync(filePath)

        return new File(
            uuidv4(),
            fileName,
            stats.size,         // file size in bytes
            stats.birthtime || stats.mtime,   // creation date
        )
    })

    return files;
}

loadFiles();