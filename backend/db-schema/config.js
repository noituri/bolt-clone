require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DATABASE_PATH || './database.sqlite'
});

module.exports = sequelize;