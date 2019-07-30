const Chalk = require("chalk");
const Async = require("async");
const fs = require("fs");

const Package = require("../package.json");
const config = require("config");

module.exports = class App {

    constructor() {
        this.modules = {};
    }

    start() {
        this.loadAndStartModules();
    }

    loadAndStartModules() {
        var files = null;

        Async.series([
            (next) => {
                this.loadFiles((error, f) => {
                    if(error) return next(error);

                    files = f;
                    
                    next();
                })
            },
            (next) => {
                this.loadModulesFromFiles(files, next);
            },
            (next) => {
                this.startModules(next);
            }
        ], (error) => {
            if (error) {
                console.log(Chalk.red(error));
                return;
            }

            console.log(Chalk.green("---------------------------------------------------------"));
            console.log(Chalk.green("        " + Package.displayName + " " + Package.version + " started"));
            console.log(Chalk.green("---------------------------------------------------------"));
        });
    }

    loadFiles(callback) {
        console.log("=> Loading modules ...");

        fs.readdir(__dirname + "/module/", (error, files) => {
            if (error) return callback(error);

            console.log("==> " + files.length + " module(s) found");

            callback(null, files);
        });
    }

    loadModulesFromFiles(files, callback) {
        Async.forEach(files, (file, next) => {
            let name = file.substring(0, file.lastIndexOf("."));
            let moduleConfig = config.get(name);

            let Module = require(__dirname + "/module/" + file)
            this.modules[name] = new Module(this, moduleConfig);

            next();
        }, (error) => {
            callback(error);
        });
    }

    startModules(callback) {
        console.log("=> Starting modules ...");

        Async.eachOf(this.modules, (m, name, next) => {
            console.log("==> Starting " + name);
            m.start(next);
        }, (error) => {
            callback(error);
        });
    }

    getModule(name) {
        return this.modules[name];
    }

}