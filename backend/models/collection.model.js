module.exports = (sequelize, Sequelize) =>{

    return sequelize.define('livre', {
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement: true
        },
        titre : {
            type : Sequelize.STRING(150),
            allowNull: false
        },
        auteur : {
            type : Sequelize.STRING(150),
            allowNull: false
        }
    },{
        timestamps : false
    })
};