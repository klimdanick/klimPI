import express from 'express';

export class staticWeb {
    constructor(port = 80, location = "../frontend") {
        this.port = port;
        this.location = location;

        this.server = express();
        this.server.use(express.static(location));
    }


    start() {
        console.log(`staticWeb \t| ${this.port} \t| ${this.location}`);
        this.server.listen(this.port);
    }
}

