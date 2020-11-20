module.exports = (sequelize, Sequelize) =>{

    return sequelize.define('collection', {
        id : {
            type : Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement: true
        },
        titre : {
            type : Sequelize.STRING(150),
            allowNull: false
        }
    },{
        timestamps : false
    })
};