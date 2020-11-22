require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB,
    process.env.NAME,
    process.env.PASSWORD,
    {
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
db.collection = require('./collection.model')(sequelize, Sequelize);
db.role = require('./role.model')(sequelize, Sequelize);
db.type = require('./type.model')(sequelize, Sequelize);
db.genre = require('./genre.model')(sequelize, Sequelize);
db.auteur = require('./auteur.model')(sequelize, Sequelize);
db.editeur = require('./editeur.model')(sequelize, Sequelize);
db.user_collection = require('./user_collection.model')(sequelize, Sequelize);

db.genre.hasMany(db.collection, {
    foreignKey: {
        name: 'idGenre',
        allowNull: false
    }
});
db.collection.belongsTo(db.genre, {
    foreignKey: {
        name: 'idGenre',
        allowNull: false
    }
});

db.auteur.hasMany(db.collection, {
    foreignKey: {
        name: 'idAuteur',
        allowNull: false
    }
});
db.collection.belongsTo(db.auteur, {
    foreignKey: {
        name: 'idAuteur',
        allowNull: false
    }
});

db.editeur.hasMany(db.collection, {
    foreignKey: {
        name: 'idEditeur',
        allowNull: false
    }
});
db.collection.belongsTo(db.editeur, {
    foreignKey: {
        name: 'idEditeur',
        allowNull: false
    }
});

db.type.hasMany(db.collection, {
    foreignKey: {
        name: 'idType',
        allowNull: false
    }
});
db.collection.belongsTo(db.type, {
    foreignKey: {
        name: 'idType',
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

db.user.belongsToMany(db.collection, {
    as: 'collection',
    through: db.user_collection,
    foreignKey: {
        name: 'idUser',
        allowNull: false
    }
});
db.collection.belongsToMany(db.user, {
    as: 'utilisateur',
    through: db.user_collection,
    foreignKey: {
        name: 'idCollection',
        allowNull: false
    }
});

module.exports = db;