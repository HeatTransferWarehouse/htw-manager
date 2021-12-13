require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("build"));

// Route includes
const itemRouter = require('./routes/itemrouter');
const captureRouter = require('./routes/index');



//change this to push update 1



app.use('/api/item', itemRouter);
app.use('/api/capture', captureRouter);
     

 const PORT = process.env.PORT || 5000;
 app.listen(PORT, () => {
   console.log("server running on: ", PORT);
 });