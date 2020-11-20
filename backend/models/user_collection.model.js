module.exports = (sequelize, Sequelize) => {

    return sequelize.define('user_livre', {
        description : {
            type: Sequelize.STRING(255),
            allowNull: true
        }
    },{
        timestamps:false
    })
};