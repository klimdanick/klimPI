import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createHash } from "crypto";

export let users = [];

export class User {
    constructor(u) {
        this.id = u.id || 0;
        this.user = u.user || "guest_user";
        this.pass = u.pass || "";
        this.role = u.role || "guest";
    }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const authorization = (req, res, next) => {
    let token = req.cookies.token;
    if (token) {
      let user = checkToken(token);
      if (user) {
        req.user = user;
        return next();
      }
    }
    let username = req.body.username;
    let password = req.body.password;
    if (username && password) {
      password = createHash_(password);
      let user = checkUserPass(username, password);
      if (user) {
        let token = createHash_(Math.floor(Math.random() * Number.MAX_VALUE) + "");
        user.token = token;
        res.cookie('token', token, { maxAge: 900000000, httpOnly: false })
        req.user = user;
        return next();
      }
    }
    if (req.url == "/style.css") {
      return next();
    }
    //return res.status(401).redirect("/admin/login")
    return res.sendFile('login.html', { root: __dirname + '/public' });
  }
  
  const checkUserPass = (user, pass) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].user == user && users[i].pass == pass) {
        return users[i];
      }
    }
    return false;
  }
  
  const checkToken = (token) => {
    for (let i = 0; i < users.length; i++) {
      if (users[i].token && users[i].token == token) {
        return users[i];
      }
    }
    return false;
  }

  const createHash_ = (password) => {
    return createHash('sha256').update(password).digest('hex');
  }