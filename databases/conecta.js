import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(
  "album", "root", "", {
  dialect: "mysql",
  host: "localhost",
  port: 3306
});