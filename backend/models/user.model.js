module.exports = (sequelize, Sequelize) => {

    return sequelize.define('user', {
        id : {
            type: Sequelize.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        email : {
            type : Sequelize.STRING(150),
            unique : true,
            allowNull : true
        },
        mdp : {
            type : Sequelize.STRING,
            allowNull: true
        },
        pseudo : {
            type : Sequelize.STRING(40),
            unique: true,
            allowNull: true
        },
        activer : {
            type : Sequelize.BOOLEAN,
            allowNull: false
        }
    },{
        timestamps: false
    })
};