const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split[' '][1];
        const decodeToken = jwt.verify(token, 'CLE_SECRETE');
        const idUser = decodeToken.idUser;
        const role = decodeToken.role;

        if (req.body.idUser !== idUser || req.body.role !== role) {
            throw "Authentification invalide"
        } else {
            next();
        }
    } catch (e) {
        res.send(401).send({
            message: [{
                general: [
                    {erreur: "L'authentification est invalide."},
                ]
            }]
        })
    }
};