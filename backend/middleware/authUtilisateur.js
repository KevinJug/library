const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split[' '][1];
        const decodeToken = jwt.verify(token, 'CLE_SECRETE');
        const idUser = decodeToken.idUser;

        if (req.body.idUser !== idUser) {
            throw "Authentification invalide"
        } else {
            next();
        }
    } catch (e) {
        console.log(e);
        res.send(401).send({
            message: e | "Authentification invalide."
        })
    }
};