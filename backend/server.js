const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const PORT = process.env.PORT | 8080;

const db = require('./models/index');
const userRouter = require('./routers/user.router');
const collectionRouter = require('./routers/collection.router');

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function (req, res, next) {
    db.sequelize
        .authenticate()
        .then(async () => {
            // await db.sequelize.sync({alter:true});
            next();
        })
        .catch(
            (e) => {
                res.send({
                    message: e
                })
            });

});


app.use('/user', userRouter);
app.use('/collection', collectionRouter);

app.listen(PORT, function () {
    console.log(`Le port est ${PORT}`)
});