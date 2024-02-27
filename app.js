require('dotenv').config();
const express = require("express");
const app = express();
const port = 3000;
const router = require("./routers/router");
const cors = require('cors');
const { errHandler } = require("./middlewares/errorHandler");

app.use(cors())
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(router);
app.use(errHandler)

module.exports = app