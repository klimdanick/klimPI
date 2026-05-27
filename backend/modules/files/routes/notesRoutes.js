import express from "express"
const router = express.Router()

import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNotesStruct
} from "../controllers/notesController.js"

router.get("/", getNotes)
router.get("/struct", getNotesStruct)
router.get("/:id", getNoteById)
router.post("/", createNote)
router.put("/:id", updateNote)
router.delete("/:id", deleteNote)

export default router