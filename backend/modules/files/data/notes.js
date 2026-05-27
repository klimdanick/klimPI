import { v4 as uuidv4 } from "uuid"
import Note from "../models/noteModel.js"
import fs from "fs"
import path from "path"

export const notes = []

const _dirname = path.dirname(new URL(import.meta.url).pathname)

// notes.push(new Note(uuidv4(), "Todo", '[ ] Edit title\n[ ] More Markdown\n[ ] File upload\n[ ] File overview\n[ ] File link\n[ ] Search\n\n[Old Todo](http://127.0.0.1:5501/frontend/index.html?note=Old%2FTodo&tab=1&md=true)\n\n', ""))
// notes.push(new Note(uuidv4(), "Requirements", '', ""))
// notes.push(new Note(uuidv4(), "Todo", '# test123\n## test123\n### test123\n[ ] 1\n[x] 2\n[ ] 3\n[ ] 4\n---\n [New Todo](http://127.0.0.1:5501/frontend/index.html?note=Todo&tab=1&md=true)\n![ksp](https://wiki.kerbalspaceprogram.com/images/5/52/KSP2_Roadmap.png)', "Old/"))
// notes.push(new Note(uuidv4(), "readme", "# electron-quick-start\n\n**Clone and run for a quick way to see Electron in action.**\n\nThis is a minimal Electron application based on the [Quick Start Guide](https://electronjs.org/docs/latest/tutorial/quick-start) within the Electron documentation.\n\nA basic Electron application needs just these files:\n\n- `package.json` - Points to the app's main file and lists its details and dependencies.\n- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.\n- `index.html` - A web page to render. This is the app's **renderer process**.\n- `preload.js` - A content script that runs before the renderer process loads.\n\nYou can learn more about each of these components in depth within the [Tutorial](https://electronjs.org/docs/latest/tutorial/tutorial-prerequisites).\n\n## To Use\n\nTo clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:\n\n```bash\n# Clone this repository\ngit clone https://github.com/electron/electron-quick-start\n# Go into the repository\ncd electron-quick-start\n# Install dependencies\nnpm install\n# Run the app\nnpm start\n```\n\nNote: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.\n\n## Resources for Learning Electron\n\n- [electronjs.org/docs](https://electronjs.org/docs) - all of Electron's documentation\n- [Electron Fiddle](https://electronjs.org/fiddle) - Electron Fiddle, an app to test small Electron experiments\n\n## License\n\n[CC0 1.0 (Public Domain)](LICENSE.md)\n", "Old/"))

/*
{
    Todo: { title: "Todo", content: "app fixen" },
    old: {
        Old_Note: {title: "Old_Note", content: "bla bla bla"},
        test: {title: "test", content: "test"},
        }
        }
        */

export const saveNotes = (notes) => {
    // Save notes to files
    // file path should be notes[i].path + notes[i].title + ".json"

    for (const note of notes) {
        const dir = path.join(_dirname, "notes", note.path)

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
        }

        const filePath = path.join(dir, `${note.title}.json`)
        fs.writeFileSync(filePath, JSON.stringify(note))
    }
}

const loadNotes = () => {
    const dir = path.join(_dirname, "notes")
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }

    const loadNotesFromDir = (dirPath, currentPath = "") => {
        const files = fs.readdirSync(dirPath)
        for (const file of files) {
            const filePath = path.join(dirPath, file)
            const stat = fs.statSync(filePath)
            if (stat.isDirectory()) {
                loadNotesFromDir(filePath, path.join(currentPath, file))
            } else if (stat.isFile() && path.extname(file) === ".json") {
                const noteData = JSON.parse(fs.readFileSync(filePath, "utf-8"))
                console.log(currentPath);
                const note = new Note(noteData.id, noteData.title, noteData.content, currentPath.length > 0 ? currentPath + "/" : "")
                notes.push(note)
            }
        }
    }

    loadNotesFromDir(dir)
}

loadNotes()