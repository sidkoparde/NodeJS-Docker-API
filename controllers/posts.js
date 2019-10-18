require("dotenv").config();

const Sequelize = require("sequelize");

const models = require("../models");

const deleteFields = postJSON => {
  delete postJSON._search;

  return postJSON;
};

module.exports = {
  getPosts: (req, res) => {
    models.Post.findAll({
      order: [["createdAt", "DESC"]],
      raw: true
    })
      .then(posts => {
        return res.status(200).send(posts);
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({
          error: "Could not find posts for some reason."
        });
      });
  },

  getPost: (req, res) => {
    const postId = req.params.postId;

    models.Post.findByPk(postId, {
      raw: true
    })
      .then(post => {
        return res.status(200).send(post);
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({
          error: "Could not find post for some reason."
        });
      });
  },

  createPost: (req, res) => {
    const payload = req.decoded;

    if (payload) {
      models.Post.create({
        title: req.body.title,
        content: req.body.content,
        userId: payload.userId
      })
        .then(post => {
          const returnPost = deleteFields(post.toJSON());

          return res.status(201).send(returnPost);
        })
        .catch(Sequelize.ValidationError, msg => {
          return res.status(422).send(msg);
        });
    } else {
      return res.status(401).json({
        error: "You did not include a post."
      });
    }
  },

  updatePost: (req, res) => {
    const payload = req.decoded;

    const postId = req.params.postId;

    if (payload) {
      models.Post.findByPk(postId)
        .then(post => {
          if (payload.userId === post.userId) {
            let updatedPost = {};

            if (req.body.title) {
              updatedPost.title = req.body.title;
            }

            if (req.body.content) {
              updatedPost.content = req.body.content;
            }

            post
              .update(updatedPost)
              .then(post => {
                const returnPost = deleteFields(post.toJSON());
                return res.status(200).send(returnPost);
              })
              .catch(Sequelize.ValidationError, msg => {
                return res.status(422).send(msg);
              });
          } else {
            return res.status(401).json({
              error: "You can't modify this post."
            });
          }
        })
        .catch(err => {
          console.log(err);
          return res.status(500).json({
            error: "Can't find post."
          });
        });
    } else {
      return res.status(401).json({
        error: "Authentication error. You must sign in."
      });
    }
  },

  deletePost: (req, res) => {
    const payload = req.decoded;

    const postId = req.params.postId;

    if (payload) {
      models.Post.findByPk(postId)
        .then(post => {
          if (payload.userId === post.userId) {
            post.destroy();

            return res.status(200).json({
              message: "Post has been deleted"
            });
          } else {
            return res.status(401).json({
              error: "You can't delete this post."
            });
          }
        })
        .catch(err => {
          console.log(err);
          return res.status(500).json({
            error: "Can't find post for some reason."
          });
        });
    } else {
      return res.status(401).json({
        error: "Authentication error. You must sign in."
      });
    }
  }
};
