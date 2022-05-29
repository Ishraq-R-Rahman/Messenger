const Sequelize = require("sequelize");

// const db = new Sequelize(
//   "messenger", "shwarup","shwarup",
//   {
//     host: "localhost",
//     dialect: "postgres",
//     logging: false,
//   }
// );

const db = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost:5432/messenger",
  {
    logging: false,
  }
);



module.exports = db;
