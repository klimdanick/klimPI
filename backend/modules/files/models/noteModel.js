export default class Note {
  constructor(id, title, content, path) {
    this.id = id
    this.title = title
    this.content = content
    this.path = path
    this.createdAt = new Date()
  }
}