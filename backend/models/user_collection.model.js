module.exports = (sequelize, Sequelize) => {

    return sequelize.define('user_collection', {
        description : {
            type: Sequelize.STRING(255),
            allowNull: true
        }
    },{
        timestamps:false
    })
};