const App = require("node-project-seed");

const packageFIle = require("../package.json");

const app = new App(packageFIle, __dirname + "/module/");
app.start();