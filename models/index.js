const dbConfig = require("../config/config.js");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const db = {};
db.mongoose = mongoose;
db.url = dbConfig.url;
db.models = require("./model.js")

module.exports = db;