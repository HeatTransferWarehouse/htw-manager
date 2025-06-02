require("dotenv").config();
require("./cron-jobs/product-sync");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const session = require("express-session"); // Use express-session instead of cookie-session
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
const logtail = new Logtail(process.env.LOGTAIL_ID);

logtail.info("Logtail ready!");

// Session Middleware
app.use(
  session({
    secret: process.env.SERVER_SESSION_SECRET || "your-secret", // Ensure this is securely stored
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()) || [];
const trustedDevIp = process.env.ALLOWED_CORS_IP || "";

const dynamicCors = (req, res, next) => {
  const origin = req.headers.origin;
  const clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  const isWhitelistedOrigin = allowedOrigins.includes(origin);
  const isLocalhostOrigin = /^http:\/\/localhost:\d+$/.test(origin);
  const isTrustedIp = clientIp?.includes(trustedDevIp);

  const allowOrigin = isWhitelistedOrigin || (isLocalhostOrigin && isTrustedIp);

  const corsOptions = {
    origin: allowOrigin ? origin : false,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200,
  };

  cors(corsOptions)(req, res, next);
};

app.use(dynamicCors);
// Manually handle preflight OPTIONS requests
app.options("*", cors());

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
const htwRoutes = require("./routes/product-issues/htw");
const sffProductRoutes = require("./routes/product-issues/sff");

app.use("/api/user", userRouter);
app.use("/api/bp-api", captureRouter);
app.use("/supacolor-api", supacolorRouter);
app.use("/api/lookup", lookupRouter);
app.use("/api/promotions", promoTracker);
app.use("/api/htw", htwRouter);
app.use("/api/products/htw", htwRoutes);
app.use("/api/products/sff", sffProductRoutes);

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
