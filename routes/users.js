var express = require("express");
var router = express.Router();
const controller = require("../controllers").users;
const validateToken = require("../utils").validateToken;

router
  .route("/")
  .get(controller.getUsers)
  .post(controller.add);

router.route("/login").post(controller.login);

router
  .route("/:userId")
  .get(controller.getUser)
  .put(validateToken, controller.updateUser)
  .delete(validateToken, controller.deleteUser);

router.route("/:userId/posts").get(controller.getUserPosts);

module.exports = router;
