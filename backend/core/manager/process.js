import express from "express";
import bodyParser from 'body-parser';
import cookieParser from "cookie-parser";
import { getUser } from "../auth/users.js"

export class Process {
    constructor(p) {

    }

    toggle() {
        if (this.running) this.stop();
        else this.start();
    }

    start() {
        console.log("starting " + this.name);
    }

    stop() {
        console.log("stopping " + this.name);
	}
}

export class VPS {
    constructor() {
        this.cpu = [];
        this.ram = [];
        this.up = [];
        this.down = [];
        this.mem = [];
        for (let i = 0; i < 100; i++) {
            let p = {x: new Date() - i * 1000/5, y: 0}
            this.cpu.push(p)
            this.ram.push(p)
            this.up.push(p)
            this.down.push(p)
        }
    }

    update() {

    }
}

export const startAPI = (port = 8089) => {
  let app = express();
  app.use(getUser);
  app.use(bodyParser.json())
  
  app.listen(port, () => {
    console.log(`mainAPI \t| ${port} \t|`);
  });
}