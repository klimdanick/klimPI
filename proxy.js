export class Proxy {
    constructor(p) {
        console.log(p);
        this.id = p.id || 0;
        this.name = p.name || "New Proxy";
        this.port = p.port || 80;
        this.url = p.url || "/";
        this.default = p.default;
    }
}