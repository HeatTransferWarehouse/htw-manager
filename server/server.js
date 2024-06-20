require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const sessionMiddleware = require("./modules/session-middleware");
const passport = require("./strategies/user.strategy");

app.use(bodyParser.json({ limit: "200mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "200mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(express.static("build"));

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

logtail.info("Logtail ready!");

// Route includes
const userRouter = require("./routes/userrouter");
const captureRouter = require("./routes/index");
const sffQueueRouter = require("./routes/sffQueueRouter");
const supacolorRouter = require("./routes/supacolorOrderRouter");
const queueRouter = require("./routes/queueRouter");
const lookupRouter = require("./routes/orderLookUp");

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: ["https://www.heattransferwarehouse.com"],
  })
);

//change this to push update 2

app.use("/api/user", userRouter);
app.use("/api/bp-api", captureRouter);
app.use("/supacolor-api", supacolorRouter);
app.use("/api/lookup", lookupRouter);

// Queue Routers

app.use("/api/sff-queue", sffQueueRouter);
app.use("/api/queue", queueRouter);

app.get("/healthcheck", (req, res) => {
  res.sendStatus(200);
});

app.use(express.static("build"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logtail.info("server running on: ", PORT);
});
