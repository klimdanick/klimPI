import { startProxy } from "./core/proxy/proxy.js"
import { staticWeb } from "./modules/staticWeb/staticWeb.js"
import { startAuth } from "./core/auth/users.js";
import { startAPI } from "./core/manager/process.js"

const website = new staticWeb(8084, "../../website");
const adminPanel = new staticWeb(8085, "../frontend/main");
const authPanel = new staticWeb(8086, "../frontend/auth");
const elementalJS = new staticWeb(8088, "../../elementalJS")

console.log("Running klimPI");

startProxy(443);
startAuth();
startAPI();
website.start();
adminPanel.start();
authPanel.start();
elementalJS.start();
