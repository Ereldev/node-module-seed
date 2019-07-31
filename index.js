const Chalk = require("chalk");
const Async = require("async");
const fs = require("fs");

const config = require("config");

exports = class App {

    constructor(packageFile, modulesDir) {
        this.packageFile = packageFile;
        this.modulesDir = modulesDir;

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
            console.log(Chalk.green("        " + this.packageFile.displayName + " " + this.packageFile.version + " started"));
            console.log(Chalk.green("---------------------------------------------------------"));
        });
    }

    loadFiles(callback) {
        console.log("=> Loading modules ...");

        fs.readdir(this.modulesDir, (error, files) => {
            if (error) return callback(error);

            console.log("==> " + files.length + " module(s) found");

            callback(null, files);
        });
    }

    loadModulesFromFiles(files, callback) {
        Async.forEach(files, (file, next) => {
            let name = file.substring(0, file.lastIndexOf("."));
            let moduleConfig = config.get(name);

            let Module = require(this.modulesDir + file)
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