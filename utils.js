/**
 * This file includes the logic for validating JSON web tokens.
 */

require("dotenv").config();

const jwt = require("jsonwebtoken");

module.exports = {
  validateToken: (req, res, next) => {
    const authorizationHeader = req.headers.authorization;
    let result;
    if (authorizationHeader) {
      const token = req.headers.authorization.split(" ")[1];
      const options = {
        expiresIn: "2d",
        issuer: "https://example.com"
      };
      try {
        result = jwt.verify(token, process.env.JWT_SECRET, options);

        req.decoded = result;

        next();
      } catch (err) {
        throw new Error(err);
      }
    } else {
      const status = 401;
      result = {
        error: "Authentication error."
      };
      res.status(status).send(result);
    }
  }
};
