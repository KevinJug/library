require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB, process.env.NAME, process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: process.env.DIALECT,
    operatorsAliases: Sequelize.Op,
    pool: {
        max: parseInt(process.env.POOLMAX),
        min: parseInt(process.env.POOLMIN),
        acquire: parseInt(process.env.POOLACQUIRE),
        idle: parseInt(process.env.POOLIDLE)
    }
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.user = require('./user.model')(sequelize, Sequelize);
db.livre = require('./livre.model')(sequelize, Sequelize);
db.role = require('./role.model')(sequelize, Sequelize);
db.style = require('./style.model')(sequelize, Sequelize);
db.genre = require('./genre.model')(sequelize, Sequelize);
db.user_livre = require('./user_livre.model')(sequelize, Sequelize);

db.genre.hasMany(db.livre, {
    foreignKey: {
        name: 'idGenre',
        allowNull: false
    }
});
db.livre.belongsTo(db.genre, {
    foreignKey: {
        name: 'idGenre',
        allowNull: false
    }
});

db.style.hasMany(db.livre, {
    foreignKey: {
        name: 'idStyle',
        allowNull: false
    }
});
db.livre.belongsTo(db.style, {
    foreignKey: {
        name: 'idStyle',
        allowNull: false
    }
});

db.role.hasMany(db.user, {
    foreignKey: {
        name: 'idRole',
        allowNull: false
    }
});
db.user.belongsTo(db.role, {
    foreignKey: {
        name: 'idRole',
        allowNull: false
    }
});

db.user.belongsToMany(db.livre, {
    as: 'livre',
    through: db.user_livre,
    foreignKey: {
        name: 'idUser',
        allowNull: false
    }
});
db.livre.belongsToMany(db.user, {
    as: 'utilisateur',
    through: db.user_livre,
    foreignKey: {
        name: 'idLivre',
        allowNull: false
    }
});

module.exports = db;