const express = require('express');
var cors = require('cors');
const app = express();
const expressWs = require('express-ws')(app);
app.use(cors());
app.use(function (req, res, next) {
    console.log('middleware');
    req.testing = 'testing';
    return next();
});


const bie7Router = require('./routers/bie7Router');
const userRouter = require('./routers/userRouter');

app.use('/bie7', bie7Router);
app.use('/', userRouter);

app.listen(3000, () => {
    console.log("Server is listening on 3000...")
});