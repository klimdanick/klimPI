import express from "express"
const router = express.Router()
import multer from "multer"
import path from "path"

import {
  getFile,
  getFiles,
  uploadFile,
  deleteFile,
} from "../controllers/filesController.js"

const _dirname = path.dirname(new URL(import.meta.url).pathname)

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(_dirname, "..", "files"))
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname) // or make unique if needed
  }
})

const upload = multer({ storage })


router.get("/", getFiles)
router.post("/", upload.single("file"), uploadFile)
router.delete("/:id", deleteFile)

export default router