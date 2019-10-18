/**
 * Test file for the User model.
 */

process.env.NODE_ENV = "test";

const models = require("../models");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../src/index.js");
let should = chai.should();

chai.use(chaiHttp);

const USERS_API_URL = "/api/v1/users";

const setupUser = {
  firstName: "FirstSetup",
  lastName: "LastSetup",
  username: "SetupName",
  email: "setup@example.com",
  password: "hello"
};

const validUser = {
  firstName: "FirstName",
  lastName: "LastName",
  username: "UserName",
  email: "someone@example.com",
  password: "123456"
};

const validCredentials = {
  email: "someone@example.com",
  password: "123456"
};

describe("Users", () => {
  // clear the Users database and add a user into the table.

  beforeEach(done => {
    models.User.destroy({
      where: {},
      truncate: false
    }).then(() => {
      models.User.create(setupUser).then(() => {
        done();
      });
    });
  });

  describe("/GET users", () => {
    it("should GET all users.", done => {
      chai
        .request(server)
        .get(USERS_API_URL)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          res.body.length.should.be.eql(1);
          done();
        });
    });
  });

  describe("/POST users", () => {
    it("should not create a user without firstName field.", done => {
      let user = { ...validUser };

      delete user.firstName;

      chai
        .request(server)
        .post(USERS_API_URL)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.error.should.eql("firstName cannot be empty.");
          done();
        });
    });

    it("should not create a user without lastName field.", done => {
      let user = { ...validUser };

      delete user.lastName;

      chai
        .request(server)
        .post(USERS_API_URL)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.error.should.eql("lastName cannot be empty.");
          done();
        });
    });

    it("should not create a user without email field.", done => {
      let user = { ...validUser };

      delete user.email;

      chai
        .request(server)
        .post(USERS_API_URL)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.error.should.eql("email cannot be empty.");
          done();
        });
    });

    it("should not create a user without password field.", done => {
      let user = { ...validUser };

      delete user.password;

      chai
        .request(server)
        .post(USERS_API_URL)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.error.should.eql("password cannot be empty.");
          done();
        });
    });

    it("should not create a user without username field.", done => {
      let user = { ...validUser };

      delete user.username;

      chai
        .request(server)
        .post(USERS_API_URL)
        .send(user)
        .end((err, res) => {
          res.should.have.status(422);
          res.body.should.be.a("object");
          res.body.error.should.eql("username cannot be empty.");
          done();
        });
    });

    it("should create a user.", done => {
      chai
        .request(server)
        .post(USERS_API_URL)
        .send(validUser)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a("object");
          res.body.should.have.property("firstName").eql(validUser.firstName);
          res.body.should.have.property("lastName").eql(validUser.lastName);
          res.body.should.have.property("username").eql(validUser.username);
          res.body.should.have.property("id");
          res.body.should.have.property("id").not.eql(setupUser.id);
          res.body.should.have.property("email");
          res.body.should.not.have.property("password");
          res.body.should.have.property("createdAt");
          res.body.should.have.property("updatedAt");
          done();
        });
    });
  });

  describe("/GET/:userId", () => {
    it("it should GET a user by the given user id", done => {
      models.User.findOne({ where: {} }).then(user => {
        const userId = user.id;
        chai
          .request(server)
          .get(USERS_API_URL + "/" + userId)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            res.body.should.have.property("firstName").eql(setupUser.firstName);
            res.body.should.have.property("lastName").eql(setupUser.lastName);
            res.body.should.have.property("username").eql(setupUser.username);
            res.body.should.have.property("id").eql(userId);
            done();
          });
      });
    });
  });

  describe("User login", () => {
    let validUserId = null;

    // create a second user before each test

    beforeEach(done => {
      models.User.create(validUser).then(user => {
        validUserId = user.id;
        done();
      });
    });

    describe("/PUT/:userId user", () => {
      it("it should update a user by the given user id after user has logged in", done => {
        const updatedUser = {
          firstName: "NewFirstName",
          lastName: "NewLastName",
          email: "NewEmail"
        };

        chai
          .request(server)
          .post(USERS_API_URL + "/login")
          .send(validCredentials)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property("token");
            let token = res.body.token;

            chai
              .request(server)
              .put(USERS_API_URL + "/" + validUserId)
              .set("Authorization", "bearer " + token)
              .send(updatedUser)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have
                  .property("firstName")
                  .eql(updatedUser.firstName);
                res.body.should.have
                  .property("lastName")
                  .eql(updatedUser.lastName);
                res.body.should.have
                  .property("username")
                  .eql(validUser.username);
                res.body.should.have.property("id").eql(validUserId);
                done();
              });
          });
      });
    });

    describe("/DELETE/:userId user", () => {
      it("it should delete a user by the given user id after user has logged in", done => {
        chai
          .request(server)
          .post(USERS_API_URL + "/login")
          .send(validCredentials)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property("token");
            let token = res.body.token;

            chai
              .request(server)
              .delete(USERS_API_URL + "/" + validUserId)
              .set("Authorization", "bearer " + token)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a("object");
                res.body.should.have
                  .property("message")
                  .eql("User has been deleted.");
                done();
              });
          });
      });
    });
  });
});
