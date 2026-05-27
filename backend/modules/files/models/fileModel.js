import path from "path"

class File {
  constructor(id, title, size, date) {
    this.id = id
    this.title = title
    this.size = size
    this.createdAt = date
  }
}

export default File