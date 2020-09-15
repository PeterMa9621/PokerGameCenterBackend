const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

app.use(function (req, res, next) {
    console.log('middleware');
    req.testing = 'testing';
    return next();
});
/*
app.get('/', function(req, res, next){
    console.log('get route', req.testing);
    res.end();
});

 */

const bie7Router = require('./routers/bie7Router');
const homeRouter = require('./routers/homeRouter');

app.use('/bie7', bie7Router);
app.use('/', homeRouter);

app.listen(3000, () => {
    console.log("Server is listening on 3000...")
});