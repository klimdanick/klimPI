import { v4 as uuidv4 } from "uuid"
import { files, loadFiles } from "../data/files.js"
import path from "path"
import fs from "fs"
import File from "../models/fileModel.js"

export const getFiles = (req, res) => {
    if (!(req.user.user == "Danick" || req.user.user == "klimdanick")) 
      return res.status(403).json({ message: "Access denied" })
    else
      res.json(loadFiles())
}

export const getFile = (req, res) => {
    const fileId = req.params.id

    const file = files.find(f => f.title === fileId)

    if (!file) {
        return res.status(404).json({ message: "File not found" })
    }

    const filePath = path.join(__dirname, "..", "files", file.title)

    console.log("Trying path:", filePath)

    console.log(require("fs").readdirSync(path.join(__dirname, "..", "files")))

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on disk" })
    }

    res.sendFile(filePath, err => {
        if (err) {
            console.error(err)
            res.status(500).json({ message: "Error sending file" })
        }
    })
}

export const uploadFile = (req, res) => {
  if (!(req.user.user == "Danick" || req.user.user == "klimdanick"))
    return res.status(403).json({ message: "Access denied" })
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const newFile = new File(
      uuidv4(),
      req.file.originalname,
      new Date(),
      req.file.size
    )

    files.push(newFile)

    res.status(201).json({
      message: "File uploaded successfully",
      file: newFile
    })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Upload failed" })
  }
}

export const deleteFile = (req, res) => {
    res.json({})
}