import { startProxy } from "./core/proxy/proxy.js"
import { staticWeb } from "./modules/staticWeb/staticWeb.js"

const website = new staticWeb(8084, "../");
const adminPanel = new staticWeb(8085, "../frontend");

console.log("Running klimPI");

startProxy(420);
website.start();
adminPanel.start();