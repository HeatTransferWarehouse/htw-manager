require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
const sessionMiddleware = require('./modules/session-middleware');
const passport = require('./strategies/user.strategy');

app.use(bodyParser.json({limit: "200mb"}));
app.use(bodyParser.urlencoded({limit: "200mb", extended: true, parameterLimit:50000}));
app.use(express.static("build"));

// Route includes
const userRouter = require('./routes/userrouter');
const itemRouter = require('./routes/itemrouter');
const captureRouter = require('./routes/index');

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());


app.use(cors({
  origin: ['https://www.heattransferwarehouse.com']
}));


//change this to push update 1

app.use('/api/user', userRouter);
app.use('/api/item', itemRouter);
app.use('/api/capture', captureRouter);


app.get("/healthcheck", (req, res) => {
  res.sendStatus(200)
});

app.use(express.static('build'));
     

 const PORT = process.env.PORT || 5000;
 app.listen(PORT, () => {
   console.log("server running on: ", PORT);
 });