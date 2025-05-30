import { Sequelize } from "sequelize";
import db from "../config/database.js";

const User = db.define("users", {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  refresh_token: {
    type: Sequelize.TEXT,
  },
}, {
  timestamps: true,
});

export default User;
