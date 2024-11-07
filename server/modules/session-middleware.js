const session = require("express-session");
const warnings = require("../constants/warnings");

const { Logtail } = require("@logtail/node");

const logtail = new Logtail("KQi4An7q1YZVwaTWzM72Ct5r");

const serverSessionSecret = () => {
  if (
    !process.env.SERVER_SESSION_SECRET ||
    process.env.SERVER_SESSION_SECRET.length < 8 ||
    process.env.SERVER_SESSION_SECRET === warnings.exampleBadSecret
  ) {
    logtail.info(warnings.badSecret);
  }

  return process.env.SERVER_SESSION_SECRET;
};

module.exports = session({
  secret: serverSessionSecret() || "secret", // please set this in your .env file
  resave: false, // Do not save session if unmodified
  saveUninitialized: false, // Do not create session until something is stored
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false, // Set to true if using https
  },
});
