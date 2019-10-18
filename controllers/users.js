require("dotenv").config();

const Sequelize = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const models = require("../models");

const deleteFields = userJSON => {
  delete userJSON.password;

  return userJSON;
};

module.exports = {
  add: (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;

    models.User.create({
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      password: password
    })
      .then(user => {
        const returnUser = deleteFields(user.toJSON());

        return res.status(201).send(returnUser);
      })
      .catch(Sequelize.ValidationError, msg => {
        const errorMsg = msg.errors[0].message
          .split(".")[1]
          .replace("null", "empty.");

        return res.status(422).json({ error: errorMsg });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).send("Could not create user.");
      });
  },
  login: (req, res) => {
    const { email, password } = req.body;

    let result = {};
    result.result = null;

    models.User.scope("withEmailAndPassword")
      .findOne({
        where: {
          email: email
        },
        raw: true
      })
      .then(user => {
        if (!user) {
          return res.status(401).json({
            error: "Authentication error. Incorrect email or password."
          });
        } else {
          bcrypt
            .compare(password, user.password)
            .then(match => {
              if (match) {
                const payload = { userId: user.id };
                const options = {
                  expiresIn: "2d",
                  issuer: "https://example.com"
                };
                const secret = process.env.JWT_SECRET;
                const token = jwt.sign(payload, secret, options);

                delete user.password;

                return res.status(200).json({
                  token: token,
                  result: user
                });
              } else {
                return res.status(401).json({
                  error: "Authentication error. Incorrect email or password."
                });
              }
            })
            .catch(err => {
              console.log(err);
              return res.status(500).send({
                error: "You can't log in for some reason. Please try again."
              });
            });
        }
      });
  },
  getUsers: (req, res) => {
    models.User.findAll({ raw: true })
      .then(users => {
        return res.status(200).send(users);
      })
      .catch(err => {
        console.log(err);
        return res.status(500).send({
          error: "Could not find users for some reason. Please try again."
        });
      });
  },

  getUser: (req, res) => {
    const userId = req.params.userId;

    models.User.findByPk(userId, { raw: true })
      .then(user => {
        return res.status(200).send(user);
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({
          error: "Could not find user for some reason. Please try again."
        });
      });
  },

  getUserPosts: (req, res) => {
    const userId = req.params.userId;

    models.Post.findAll({
      where: {
        userId: userId,
        order: [["createdAt", "DESC"]]
      },
      raw: true
    })
      .then(post => {
        return res.status(200).json({
          result: post
        });
      })
      .catch(err => {
        console.log(err);
        return res.status(404).json({
          error: "Can't find posts for some reason. Please try again."
        });
      });
  },

  updateUser: (req, res) => {
    const payload = req.decoded;

    const userId = req.params.userId;
    if (payload) {
      if (payload.userId === userId) {
        models.User.scope("withEmailAndPassword")
          .findByPk(userId)
          .then(user => {
            let updatedUser = {};

            if (req.body.firstName) {
              updatedUser.firstName = req.body.firstName;
            }

            if (req.body.lastName) {
              updatedUser.lastName = req.body.lastName;
            }

            if (req.body.email) {
              updatedUser.email = req.body.email;
            }

            if (req.body.username) {
              updatedUser.username = req.body.username;
            }

            if (req.body.password) {
              updatedUser.password = req.body.password;
            }

            user
              .update(updatedUser)
              .then(user => {
                const returnUser = deleteFields(user.toJSON());
                return res.status(200).send(returnUser);
              })
              .catch(Sequelize.ValidationError, msg => {
                return res.status(422).send(msg);
              });
          })
          .catch(err => {
            console.log(err);
            return res.status(500).json({
              error: "Can't find user."
            });
          });
      } else {
        return res.status(401).json({
          error: "You can't modify this user."
        });
      }
    } else {
      return res.status(401).json({
        error: "Authentication error. You must log in."
      });
    }
  },

  deleteUser: (req, res) => {
    const payload = req.decoded;

    const userId = req.params.userId;

    if (payload) {
      if (payload.userId === userId) {
        models.User.findByPk(userId)
          .then(user => {
            user.destroy();

            return res.status(200).json({
              message: "User has been deleted."
            });
          })
          .catch(err => {
            console.log(err);
            return res.status(500).json({
              message: "Can't find user for some reason. Please try again."
            });
          });
      } else {
        return res.status(401).json({
          error: "You can't delete this user."
        });
      }
    } else {
      return res.status(401).json({
        error: "Authentication error."
      });
    }
  }
};
