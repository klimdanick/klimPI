import { startProxy } from "./core/proxy/proxy.js"
import { staticWeb } from "./modules/staticWeb/staticWeb.js"
import { startAuth } from "./core/auth/users.js";

const website = new staticWeb(8084, "~/website");
const adminPanel = new staticWeb(8085, "../frontend/main");
const authPanel = new staticWeb(8086, "../frontend/auth");

console.log("Running klimPI");

startProxy(420);
startAuth();
website.start();
adminPanel.start();
authPanel.start();