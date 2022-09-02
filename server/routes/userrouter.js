const express = require("express");
const {
  rejectUnauthenticated,
} = require("../modules/authentication-middleware");
const encryptLib = require("../modules/encryption");
const pool = require("../modules/pool");
const userStrategy = require("../strategies/user.strategy");
const router = express.Router();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
require("dotenv").config();
const app = express();
const cors = require('cors');

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

app.use(cors({
  origin: ['https://www.heattransferwarehouse.com']
}));

// Handles Ajax request for user information if user is authenticated
router.get("/", rejectUnauthenticated, (req, res) => {
  // Send back user object from the session (previously queried from the database)
  res.send(req.user);
});

router.post("/addadmin", rejectUnauthenticated, (req, res) => {
  // used to reset user logins. It's on a permenent restricted path, only accessesable by manaully changing the code. Extremely secure and protected
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const email = req.body.email;
  const password = encryptLib.encryptPassword(req.body.password);
  const role = req.body.role;

  //now lets add admin information to the user table
  const query2Text =
    'INSERT INTO "user" (first_name, last_name, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id';
  pool
    .query(query2Text, [first_name, last_name, email, password, role])
    .then((result) => res.status(201).send(result.rows))
    .catch(function (error) {
      logtail.info("Sorry, there was an error with your query: ", error);
      res.sendStatus(500); // HTTP SERVER ERROR
    })

    .catch(function (error) {
      logtail.info("Sorry, there is an error", error);
      res.sendStatus(500);
    });
});

router.post("/login", userStrategy.authenticate("local"), (req, res) => {
  logtail.info("logging body", req.body.username)
  const email = req.body.username;
  // setting query text to update the username
  const queryText = `update "user" set "last_login" = NOW() WHERE "email"=$1`;

  pool.query(queryText, [email]).then((result) => {//when someone logs in, want to capture the time they log in

      res.sendStatus(201)
  });
});

router.post("/logout", (req, res) => {
  // Use passport's built-in method to log out the user
  req.logout();
  res.sendStatus(200);
});

router.post('/register', (req, res) => {
  const username = req.body.username;
  const password = encryptLib.encryptPassword(req.body.password);

  const queryText = `INSERT INTO "user" (email, password, join_date, access_level)
    VALUES ($1, $2, NOW(), 0) RETURNING id`;
  pool
    .query(queryText, [username, password])
    .then(() => res.sendStatus(201))
    .catch((err) => {
      logtail.info('User registration failed: ', err);
      res.sendStatus(500);
    });
});



module.exports = router;
