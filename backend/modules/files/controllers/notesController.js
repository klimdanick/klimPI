import { v4 as uuidv4 } from "uuid"
import { notes, saveNotes } from "../data/notes.js"
import Note from "../models/noteModel.js"

export const getNotes = (req, res) => {
  if (!(req.user.user == "Danick" || req.user.user == "klimdanick"))
    return res.status(403).json({ message: "Access denied" })
  else
    res.json(notes)
}

export const getNoteById = (req, res) => {
  if (!(req.user.user == "Danick" || req.user.user == "klimdanick"))
    return res.status(403).json({ message: "Access denied" })

  const note = notes.find(n => n.path + n.title == req.params.id.replace(".", "/"))

  if (!note) {
    return res.status(404).json({ message: "Note not found" })
  }

  res.json(note)
}

export const getNotesStruct = (req, res) => {
  if (!(req.user.user == "Danick" || req.user.user == "klimdanick"))
    return res.status(403).json({ message: "Access denied" })
  let struct = []
  notes.forEach(note => {
    if (!note.path) return struct.push(note.title);

    let dirs = note.path.split("/");
    let lastDir = struct;
    for (let i = 0; i < dirs.length - 1; i++) {
      let dir;
      if (dir = lastDir.find(d => d.dir == dirs[i])) {
        lastDir = dir.content;
        continue;
      }
      dir = { dir: dirs[i], content: [] };
      lastDir.push(dir)
      lastDir = dir.content;
    }
    lastDir.push(note.title);
  })
  res.json(struct)
}

export const createNote = (req, res) => {
  if (!(req.user.user == "Danick" || req.user.user == "klimdanick"))
    return res.status(403).json({ message: "Access denied" })

  const { title, content, path } = req.body


  if (!title) {
    console.log(title, content, path);
    return res.status(400).json({ message: "Title and content are required" })
  }

  const newNote = new Note(uuidv4(), title, content, path)

  notes.push(newNote)

  saveNotes(notes);

  res.status(201).json(newNote)
}

export const updateNote = (req, res) => {
  if (!(req.user.user == "Danick" || req.user.user == "klimdanick"))
    return res.status(403).json({ message: "Access denied" })

  const note = notes.find(n => n.path + n.title == req.params.id.replace(".", "/"))

  if (!note) {
    return res.status(404).json({ message: "Note not found" })
  }

  const { title, content } = req.body

  note.title = title ?? note.title
  note.content = content ?? note.content

  saveNotes(notes);

  res.json(note)
}

export const deleteNote = (req, res) => {
  if (!(req.user.user == "Danick" || req.user.user == "klimdanick"))
    return res.status(403).json({ message: "Access denied" })

  const index = notes.findIndex(n => n.path + n.title == req.params.id.replace(".", "/"))

  if (index === -1) {
    return res.status(402).json({ message: "Note not found" })
  }

  notes.splice(index, 1)

  res.json({ message: "Note deleted" })
}