module.exports = (sequelize, Sequelize)=>{

    return sequelize.define('role', {
        id : {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        role : {
            type : Sequelize.STRING(50),
            allowNull: false,
            unique : true
        }
    },{
        timestamps : false
    })
};