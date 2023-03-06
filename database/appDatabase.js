const dbConfig = require('../resources/appConstants');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.set('debug', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const db = {};
db.mongoose = mongoose;
db.url = dbConfig.mongodbUrl;
db.pessoa = require('./model/pessoa')(mongoose);
db.conta = require('./model/conta')(mongoose);
db.transacao = require('./model/transacao')(mongoose);

db.queryReturnIsEmpty = function(queryValue) {
    switch (queryValue) {
        case []:
        case {}:
        case null:
        case undefined:
        case '[]':
        case '{}':
            return true;
        default:
            return false;
    }
};

module.exports = db;
