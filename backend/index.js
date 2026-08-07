import { startProxy } from "./core/proxy/proxy.js"
import { staticWeb } from "./modules/staticWeb/staticWeb.js"
import { startAuth } from "./core/auth/users.js";
import { startAPI } from "./core/manager/vps.js"
import { klimPIProc, Process, processes } from "./core/manager/process.js"
import { startFilesServer } from "./modules/files/server.js"

const website = new staticWeb(8084, "../../website", "website");
const adminPanel = new staticWeb(8085, "../frontend/main", "adminPanel");
const authPanel = new staticWeb(8086, "../frontend/auth", "authPanel");
const elementalJS = new staticWeb(8088, "../../elementalJS", "elementalJS");
const elementalJSv1 = new staticWeb(8091, "../../elementalJSV1", "elementalJSV1")
while (processes.length > 0) processes.pop();

console.log(process.pid);

const klimPI = new klimPIProc();

const minecraft = new Process({
    name: "minecraft",
    command: "/usr/bin/java",
    args: ["-jar", "paper.jar"],
    cwd: "/home/ubuntu/mc/"
})

const assetto = new Process({
    name: "assetto corsa",
    command: "ls",
    args: [],
    cwd: "/home/ubuntu/assetto"
})

const quotebot = new Process({
    name: "quotebot",
    command: "./run.sh",
    args: [],
    cwd: "/home/ubuntu/QuoteBot"
})

const Athleticks = new Process({
    name: "Athleticks",
    command: "./run.sh",
    args: ["8090"],
    cwd: "/home/ubuntu/Athleticks"
})

console.log("Running klimPI");

startProxy(443);
startAuth();
startAPI();
startFilesServer();
website.start();
adminPanel.start();
authPanel.start();
elementalJS.start();
elementalJSv1.start();

// minecraft.start();
// assetto.start();
// quotebot.start();
// Athleticks.start();

// console.log(processes.map(p => p.name));
