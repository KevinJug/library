module.exports = (sequelize, Sequelize) => {

    return sequelize.define('style', {
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement: true
        },
        libelle : {
            type : Sequelize.STRING(50),
            unique : true,
            allowNull : false
        }
    }, {
        timestamps : false
    })
};