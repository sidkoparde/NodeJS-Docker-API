var express = require("express");
var router = express.Router();
const controller = require("../controllers").posts;
const validateToken = require("../utils").validateToken;

router
  .route("/")
  .get(controller.getPosts)
  .post(validateToken, controller.createPost);

router
  .route("/:postId")
  .get(controller.getPost)
  .put(validateToken, controller.updatePost)
  .delete(validateToken, controller.deletePost);

module.exports = router;
