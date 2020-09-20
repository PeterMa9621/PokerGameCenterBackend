const express = require('express');
const cors = require('cors');
const app = express();
const expressWs = require('express-ws')(app);
const MongoDatabase = require('./database/mongodb');

MongoDatabase.getInstance();

app.use(express.urlencoded());
app.use(express.json());
app.use(cors());
app.use(function (req, res, next) {
    req.testing = 'testing';
    return next();
});

/**
 * Init
 * @type {*}
 */
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

module.exports = {expressWs};

const bie7Router = require('./routers/bie7Router');
const userRouter = require('./routers/userRouter');

app.use('/bie7', bie7Router);
app.use('/user', userRouter);

app.listen(3000, () => {
    console.log("Server is listening on 3000...")
});

