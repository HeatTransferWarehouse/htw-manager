require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const session = require('express-session'); // Use express-session instead of cookie-session
const passport = require('./strategies/user.strategy');

app.use(bodyParser.json({ limit: '200mb' }));
app.use(
  bodyParser.urlencoded({
    limit: '200mb',
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(express.static('build'));

const { Logtail } = require('@logtail/node');
const logtail = new Logtail(process.env.LOGTAIL_ID);

logtail.info('Logtail ready!');

// Session Middleware
app.use(
  session({
    secret: process.env.SERVER_SESSION_SECRET || 'your-secret', // Ensure this is securely stored
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

const allowedOrigins = [
  'https://www.heattransferwarehouse.com',
  'https://www.heat-transfer-warehouse-sandbox.mybigcommerce.com',
  'http://admin.heattransferwarehouse.com',
  'https://www.yourcustomtransfers.com',
  'https://yourcustomtransfers.com',
  'http://localhost:3000',
  'http://localhost:3012',
  'http://localhost:8000',
  'http://localhost:4577',
  // add more if needed

];

const dynamicCors = (req, res, next) => {
  const origin = req.headers.origin;

  const isWhitelistedOrigin = allowedOrigins.includes(origin);

  const corsOptions = {
    origin: isWhitelistedOrigin ? origin : false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
  };

  cors(corsOptions)(req, res, next);
};

app.use(dynamicCors);

// Route includes
const userRouter = require('./routes/userrouter');
const sffQueueRouter = require('./routes/sffQueueRouter');
const supacolorRouter = require('./routes/supacolorOrderRouter');
const queueRouter = require('./routes/queueRouter');
const lookupRouter = require('./routes/orderLookUp');
const clothingQueueRouter = require('./routes/clothingQueue');
const adminRouter = require('./routes/admin');
const htwRouter = require('./routes/htwRequests');
const htwRoutes = require('./routes/product-issues/htw');
const sffProductRoutes = require('./routes/product-issues/sff');
const JDS = require('./routes/JDS/index');
const google = require('./routes/google-sheets');
const bigCommerceOrdersAPI = require('./routes/big-commerce/orders/route');
const bigCommerceTokenRouter = require('./routes/big-commerce/token');
const ssActivewear = require('./routes/ssActivewear/route');

app.use('/api/user', userRouter);
app.use('/supacolor-api', supacolorRouter);
app.use('/api/lookup', lookupRouter);
app.use('/api/htw', htwRouter);
app.use('/api/products/htw', htwRoutes);
app.use('/api/products/sff', sffProductRoutes);
app.use('/api/jds', JDS);
app.use('/api/google', google);
app.use('/api/big-commerce/orders', bigCommerceOrdersAPI);
app.use('/api/big-commerce/token', bigCommerceTokenRouter);
app.use('/api/ss-activewear', ssActivewear);


// Queue Routers
app.use('/api/sff-queue', sffQueueRouter);
app.use('/api/queue', queueRouter);
app.use('/api/clothing-queue', clothingQueueRouter);

// Admin Router
app.use('/api/admin', adminRouter);

app.get('/healthcheck', (req, res) => {
  res.sendStatus(200);
});

app.use(express.static('build'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logtail.info('server running on: ', PORT);
});
