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
const clothingQueueRouter = require("./routes/clothingQueue");
const adminRouter = require("./routes/admin");
const promoTracker = require("./routes/promo-tracking");
const htwRouter = require("./routes/htwRequests");

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

const allowedOrigins = [
  // "http://localhost:3000",
  // "http://localhost:5005", // Allow localhost for development
  "https://www.heattransferwarehouse.com",
  "https://heat-transfer-warehouse-sandbox.mybigcommerce.com",
  "https://admin.heattransferwarehouse.com",
  "https://manager.heattransferwarehouse.com",
];

// CORS Middleware (allow both localhost and production)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow these HTTP methods
    credentials: true, // Allow cookies and credentials to be sent
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
);

// Manually handle the preflight requests (OPTIONS) to ensure proper CORS
app.options("*", cors()); // Allow pre-flight requests from any origin

//change this to push update 2

app.use("/api/user", userRouter);
app.use("/api/bp-api", captureRouter);
app.use("/supacolor-api", supacolorRouter);
app.use("/api/lookup", lookupRouter);
app.use("/api/promotions", promoTracker);
app.use("/api/htw", htwRouter);

// Queue Routers

app.use("/api/sff-queue", sffQueueRouter);
app.use("/api/queue", queueRouter);
app.use("/api/clothing-queue", clothingQueueRouter);

// Admin Router

app.use("/api/admin", adminRouter);

app.get("/healthcheck", (req, res) => {
  res.sendStatus(200);
});

app.use(express.static("build"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logtail.info("server running on: ", PORT);
});
