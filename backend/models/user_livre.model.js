module.exports = (sequelize, Sequelize) => {

    return sequelize.define('user_livre', {
        tome : {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        description : {
            type: Sequelize.STRING(255),
            allowNull: true
        }
    },{
        timestamps:false
    })
};