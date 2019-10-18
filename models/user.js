const bcrypt = require("bcryptjs");
const environment = process.env.NODE_ENV;
const stage = require("../config")[environment];

const hashPassword = user => {
  if (user.changed("password")) {
    return bcrypt
      .hash(user.password, stage.saltingRounds)
      .then(hash => {
        user.password = hash;
      })
      .catch(err => {
        console.log(err);
        console.log("Error hashing password for ", user.email);
        throw new Error();
      });
  }
};

const beforeCreate = hashPassword;
const beforeUpdate = hashPassword;

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        defaultValue: DataTypes.UUIDV4,
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      },
      firstName: {
        allowNull: false,
        type: DataTypes.STRING
      },
      lastName: {
        allowNull: false,
        type: DataTypes.STRING
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {
      defaultScope: {
        attributes: { exclude: ["email", "password", "updatedAt", "createdAt"] }
      },
      scopes: {
        withEmailAndPassword: {
          attributes: { exclude: ["updatedAt", "createdAt"] }
        }
      },
      hooks: {
        beforeCreate,
        beforeUpdate
      }
    }
  );
  User.associate = models => {
    User.hasMany(models.Post, {
      foreignKey: "userId",
      onDelete: "CASCADE"
    });
  };

  return User;
};
