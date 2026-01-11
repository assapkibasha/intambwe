// ===================================
// FILE: config/database.js
// ===================================
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

const dotenvPath = (() => {
  const cwd = path.resolve(__dirname, "..");
  const candidates = [
    process.env.DOTENV_PATH,
    path.join(cwd, ".env"),
    path.join(cwd, "env"),
    path.join(cwd, "intambwe.txt"),
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  return undefined;
})();

require("dotenv").config(dotenvPath ? { path: dotenvPath } : undefined);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), // usually NOT 3306 on Aiven
    dialect: "mysql",
    logging: false,
    // dialectOptions: {
    //   ssl: {
    //     ca: fs.readFileSync(__dirname + "/ca.pem"),
    //     rejectUnauthorized: true,
    //   },
    // },
  }
);

module.exports = sequelize;

