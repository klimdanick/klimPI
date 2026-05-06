import { startProxy } from "./core/proxy/proxy.js"
import { staticWeb } from "./modules/staticWeb/staticWeb.js"

const website = new staticWeb();

console.log("Running klimPI");

startProxy(420);
website.start();