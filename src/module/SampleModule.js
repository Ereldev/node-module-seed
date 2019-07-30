
module.exports = class SampleModule {

    constructor(app, config) {
        this.app = app;
        this.config = config;
    }

    start(callback) {
        let m = this.app.getModule("SampleModule");
        if (m == null) return callback("Unable to find me");

        let value = this.config.get("testKey");
        if (value == null || value != "testValue") return callback("Unable to get config value");

        callback();
    }
    
}