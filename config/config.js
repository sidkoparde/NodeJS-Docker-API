require("dotenv").config();
module.exports = {
  development: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres"
  },

  test: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres"
  },

  production: {
    username: "admin",
    password: "password",
    database: "postgres",
    host: "127.0.0.1",
    dialect: "postgres"
  }
};
