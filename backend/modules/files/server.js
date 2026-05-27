import express from "express"
import cors from "cors"
import morgan from "morgan"
import path from "path"

import notesRoutes from "./routes/notesRoutes.js"
import filesRoutes from "./routes/filesRoutes.js"
import { errorHandler } from "./middleware/errorMiddleware.js"

import { getUser } from "../../core/auth/users.js"

const _dirname = path.dirname(new URL(import.meta.url).pathname)

export const startFilesServer = (PORT = 8092) => {
  console.log("Starting Files Server...")
  const app = express()

  app.use(getUser)
  app.use(cors())
  app.use(express.json())
  app.use(morgan("dev"))

  app.use("/api/notes", notesRoutes)

  app.use("/api/files", filesRoutes)

  app.use("/api/files", express.static(path.join(_dirname, "files")))

  app.get("/", (req, res) => {
    res.send("Notes API running")
  })

  app.use(errorHandler)

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}