module.exports = (sequelize, Sequelize) => {

    return sequelize.define('editeur', {
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement: true
        },
        editeur : {
            type : Sequelize.STRING(100),
            unique : true,
            allowNull : false
        }
    }, {
        timestamps : false
    })
};