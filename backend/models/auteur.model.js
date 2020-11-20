module.exports = (sequelize, Sequelize) => {

    return sequelize.define('auteur', {
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement: true
        },
        auteur : {
            type : Sequelize.STRING(100),
            unique : true,
            allowNull : false
        }
    }, {
        timestamps : false
    })
};