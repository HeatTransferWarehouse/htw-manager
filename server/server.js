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

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

logtail.info("Logtail ready!");

// Route includes
const userRouter = require('./routes/userrouter');
const sanmarBP = require('./routes/sanmarBPRouter');
const nostockRouter = require('./routes/nostockrouter');
const captureRouter = require('./routes/index');
const affiliateRouter = require('./routes/affiliaterouter');
const queueItemRouter = require('./routes/queueItemRouter');
const queueUserRouter = require('./routes/queueUserRouter');
const webhooksRouter = require('./routes/webhooks');

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());


app.use(cors({
  origin: ['https://www.heattransferwarehouse.com']
}));


//change this to push update 2

app.use('/api/user', userRouter);
app.use('/api/item', sanmarBP);
app.use('/api/capture', captureRouter);
app.use('/api/nostock', nostockRouter);
app.use('/api/affiliate', affiliateRouter);
app.use('/api/webhooks', webhooksRouter);

// Queue Routers

app.use('/api/user/queue/', queueUserRouter);
app.use('/api/item/queue/', queueItemRouter);

app.get("/healthcheck", (req, res) => {
  res.sendStatus(200)
});

app.use(express.static('build'));


 const PORT = process.env.PORT || 8000;
 app.listen(PORT, () => {
  logtail.info("server running on: ", PORT);
 });