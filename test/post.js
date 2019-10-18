/**
 * Test file for the Post model.
 */

process.env.NODE_ENV = "test";

const models = require("../models");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../src/index.js");

chai.use(chaiHttp);

const USERS_API_URL = "/api/v1/users";
const POSTS_API_URL = "/api/v1/posts";

const firstUser = {
  firstName: "FirstSetup",
  lastName: "LastSetup",
  username: "SetupName",
  email: "setup@example.com",
  password: "hello"
};

const secondUser = {
  firstName: "FirstName",
  lastName: "LastName",
  username: "UserName",
  email: "someone@example.com",
  password: "123456"
};

const secondUserCredentials = {
  email: secondUser.email,
  password: secondUser.password
};

const post = {
  title: "SomeTitle",
  content: "Some Content"
};

describe("Posts", () => {
  // clear the User and Post tables.
  // Then create a user and a post associated with that user

  beforeEach(done => {
    models.User.destroy({
      where: {},
      truncate: false
    }).then(() => {
      models.Post.destroy({
        where: {},
        truncate: false
      }).then(() => {
        models.User.create(firstUser).then(user => {
          const post = {
            title: "TestTitle",
            content: "Test Content",
            userId: user.id
          };

          models.Post.create(post).then(post => {
            done();
          });
        });
      });
    });
  });

  describe("/GET posts", () => {
    it("should GET all posts.", done => {
      chai
        .request(server)
        .get(POSTS_API_URL)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          done();
        });
    });
  });

  describe("/POST posts", () => {
    it("should create a post by a user.", done => {
      chai
        .request(server)
        .post(USERS_API_URL)
        .send(secondUser)
        .end((err, res) => {
          res.should.have.status(201);
          chai
            .request(server)
            .post(USERS_API_URL + "/login")
            .send(secondUserCredentials)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property("token");
              let token = res.body.token;

              chai
                .request(server)
                .post(POSTS_API_URL)
                .set("Authorization", "bearer " + token)
                .send(post)
                .end((err, res) => {
                  res.should.have.status(201);
                  chai
                    .request(server)
                    .get(POSTS_API_URL)
                    .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.be.a("array");
                      res.body.length.should.be.eql(2);
                      done();
                    });
                });
            });
        });
    });
  });

  describe("/GET posts/:id", () => {
    it("should get a post by its id.", done => {
      chai
        .request(server)
        .post(USERS_API_URL)
        .send(secondUser)
        .end((err, res) => {
          res.should.have.status(201);
          chai
            .request(server)
            .post(USERS_API_URL + "/login")
            .send(secondUserCredentials)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property("token");
              let token = res.body.token;

              chai
                .request(server)
                .post(POSTS_API_URL)
                .set("Authorization", "bearer " + token)
                .send(post)
                .end((err, res) => {
                  const postId = res.body.id;

                  chai
                    .request(server)
                    .get(POSTS_API_URL + "/" + postId)
                    .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.be.a("object");
                      res.body.should.have.property("title").eql(post.title);
                      res.body.should.have
                        .property("content")
                        .eql(post.content);
                      res.body.should.have.property("id").eql(postId);
                      res.body.should.have.property("createdAt");
                      res.body.should.have.property("updatedAt");
                      res.body.should.not.have.property("_search");
                      done();
                    });
                });
            });
        });
    });
  });

  describe("/DELETE posts/:id", () => {
    it("should delete a post by its id.", done => {
      chai
        .request(server)
        .post(USERS_API_URL)
        .send(secondUser)
        .end((err, res) => {
          res.should.have.status(201);
          chai
            .request(server)
            .post(USERS_API_URL + "/login")
            .send(secondUserCredentials)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property("token");
              let token = res.body.token;

              chai
                .request(server)
                .post(POSTS_API_URL)
                .set("Authorization", "bearer " + token)
                .send(post)
                .end((err, res) => {
                  const postId = res.body.id;

                  chai
                    .request(server)
                    .delete(POSTS_API_URL + "/" + postId)
                    .set("Authorization", "bearer " + token)
                    .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.be.a("object");
                      res.body.should.have
                        .property("message")
                        .eql("Post has been deleted");
                      done();
                    });
                });
            });
        });
    });
  });

  describe("/UPDATE posts/:id", () => {
    it("should update a post by its id.", done => {
      chai
        .request(server)
        .post(USERS_API_URL)
        .send(secondUser)
        .end((err, res) => {
          res.should.have.status(201);
          chai
            .request(server)
            .post(USERS_API_URL + "/login")
            .send(secondUserCredentials)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property("token");
              let token = res.body.token;

              chai
                .request(server)
                .post(POSTS_API_URL)
                .set("Authorization", "bearer " + token)
                .send(post)
                .end((err, res) => {
                  const postId = res.body.id;

                  const updatedPost = {
                    title: "New Title",
                    content: "New Content"
                  };

                  chai
                    .request(server)
                    .put(POSTS_API_URL + "/" + postId)
                    .set("Authorization", "bearer " + token)
                    .send(updatedPost)
                    .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.be.a("object");
                      res.body.should.have
                        .property("title")
                        .eql(updatedPost.title);
                      res.body.should.have
                        .property("content")
                        .eql(updatedPost.content);
                      done();
                    });
                });
            });
        });
    });
  });
});
