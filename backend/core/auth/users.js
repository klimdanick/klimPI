import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createHash } from "crypto";
import express from "express";
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import fs from "fs";
import crypto from "crypto";

export let users = [];

export class User {
  constructor(u) {
    this.id = u.id || 0;
    this.user = u.user || "guest";
    this.roles = u.roles || ["guest"];
    this.salt = u.salt || "";
    this.hash = u.hash || "";
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Create salted hash
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString("hex");
  }

  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return { salt, hash };
}

// Verify password
function verifyPassword(password, salt, hash) {
  const testHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(testHash, "hex")
  );
}

export const proxyAuthentication = (req, res, next) => {
  let token = req.cookies.token;
  if (token) {
    let user = checkToken(token);
    if (user) {
      req.user = user;
      // console.log("User authenticated via token:", user.user);
      return next();
    }
  }
  req.user = new User({});
  // console.log("Unauthorized access attempt to:", req.path);
  return next();
}

export const authentication = (req, res, next) => {
  let token = req.cookies.token;
  if (token) {
    let user = checkToken(token);
    if (user) {
      req.user = user;
      console.log("User authenticated via token:", user.user);
      return next();
    }
  }
  let username = req.body?.username;
  let password = req.body?.password;
  if (username && password) {
    let user = checkUserPass(username, password);
    if (user) {
      const token = generateToken();
      user.token = token;
      res.cookie('token', token, { maxAge: 900000000, httpOnly: false, path: '/' })
      req.user = user;
      console.log("User logged in:", username);
      return next();
    }
  }
  // return res.status(401).redirect("/admin/login")
  req.user = new User({});
  console.log("Unauthorized access attempt to:", req.path);
  return next();
}

const registerUser = (username, password, roles = ["user"]) => {
  if (users.find(u => u.user === username)) {
    return { success: false, message: "User already exists" };
  }
  let id = users.length ? users[users.length - 1].id + 1 : 1;
  let { salt, hash } = hashPassword(password);
  let newUser = new User({ id, user: username, salt, hash, roles });
  users.push(newUser);
  saveUsers();
  return { success: true, user: newUser };
}

export const registration = (req, res) => {
  console.log(req.body);
  let username = req.body?.username;
  let password = req.body?.password;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }
  let result = registerUser(username, password);
  if (result.success) {
    res.json({ success: true, user: result.user });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
}

const saveUsers = () => {
  try {
    fs.writeFileSync(join(__dirname, "../../../users.json"), JSON.stringify({ users }, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving users.json:", err);
  }
}

const checkUserPass = (user, pass) => {
  for (let i = 0; i < users.length; i++) {
    if (users[i].user == user && verifyPassword(pass, users[i].salt, users[i].hash)) {
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

const loadUsers = () => {
  try {
    let data = JSON.parse(fs.readFileSync(join(__dirname, "../../../users.json"), "utf-8"));
    let loadedUsers = data["users"] || [];
    users = loadedUsers.map(u => new User(u));
  } catch (err) {
    console.error("Error loading users.json:", err);
  }
}

export const getUser = (req, res, next) => {
  const userHeader = req.headers['x-user'];

  if (userHeader) {
    try {
      req.user = JSON.parse(userHeader);
    } catch (err) {
      console.error("Invalid x-user header");
    }
  }

  next();
}

export const startAuth = (port = 8087) => {
  loadUsers();
  saveUsers(); // Ensure users.json is created if it doesn't exist
  let app = express();
  app.use(bodyParser.json())
  app.use(cookieParser());
  app.post('/logout', (req, res) => {
    res.setHeader(
      "Set-Cookie",
      `session=; HttpOnly; Path=/; SameSite=Strict`
    );
    res.sendStatus(200);
  });
  app.use(authentication);
  app.post("/register", registration);
  app.post("/login", (req, res) => {
    if (req.user && req.user.user !== "guest") {
      res.json({ success: true, user: req.user });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
  app.get("/user", (req, res) => {
    res.send(req.user);
  });
  app.listen(port, () => {
    console.log(`authAPI \t| ${port} \t|`);
  });
}

const levels = {
  Admin: 0
}

const permissions = {
  admin: [
    "view_dashboard",
    "view_processes",
    "restart_processes",
    "start_processes",
    "stop_processes",
    "edit_processes",
    "view_proxy",
    "edit_proxy",
    "view_users",
    "edit_users",
  ],
  operator: [
    "view_dashboard",
    "view_processes",
    "restart_processes",
    "start_processes",
    "view_proxy",
  ],
  guest: [
    
  ]
}

export const hasAccess = (permission, user_ = user) => {
  let ret = false
  user_.roles.forEach(role => {
    if (permissions[role]?.includes(permission)) ret = true;
  });
  return ret;
}