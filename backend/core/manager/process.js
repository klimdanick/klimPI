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