require("dotenv").config();

const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");

const cors = require("cors");
const helmet = require("helmet");
const routes = require("../routes");

const app = express();

const environment = process.env.NODE_ENV;
const stage = require("../config")[environment];

import * as constants from "../constants";

app.use(helmet());

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (environment !== "test") {
  app.use(logger("dev"));
}

app.use(constants.API_PATH + "/users", routes.users);
app.use(constants.API_PATH + "/posts", routes.posts);

app.listen(`${stage.port}`, () =>
  console.log(`App listening on port ${stage.port}`)
);

module.exports = app;
