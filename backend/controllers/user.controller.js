const db = require('../models');
const User = db.user;
const Role = db.role;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.findAll = (req, res) => {

    User.findAll({
        order: [
            ['id', 'ASC']
        ]
    })
        .then(data => {
            res.status(200).send(data)
        })
        .catch(err => {
            console.log(err);
            res.status(400).send({
                message: err
            })
        })
};

exports.create = (req, res) => {

    bcrypt.hash(req.body.mdp, 10)
        .then(hash => {
            const user = {
                pseudo: req.body.pseudo,
                email: req.body.email,
                mdp: hash,
                idRole: 2,
                activer: true
            };

            User.create(user)
                .then(data => {
                    res.status(200).send(data)
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).send({
                        message: err
                    })
                })
        })
        .catch(err => {
            console.log(err);
            res.status(400).send({
                message: err
            })
        })


};

exports.login = (req, res) => {

    const user = {};

    if (req.body.login.indexOf('@') === -1) {
        user['pseudo'] = req.body.login

    } else {
        user['email'] = req.body.login
    }

    User.findOne({
        where: user,
        include: [
            {model: Role, nested: true}
        ]
    })
        .then(data => {
            if (!data) {
                res.status(200).send({
                    message: 'Utilisateur non trouvé !'
                })
            }
            bcrypt.compare(req.body.mdp, data.dataValues.mdp)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).send({
                            message: "Mot de passe incorrecte !"
                        })
                    }
                    console.log(data);
                    res.status(200).send({
                        idUser: data.dataValues.id,
                        role: data.dataValues.role.id,
                        token: jwt.sign(
                            {idUser: data.id, role: data.dataValues.role.id},
                            'CLE_SECRETE',
                            {expiresIn: '24h'}
                        )
                    })
                        .catch(e => {
                            res.status(200).send({
                                message: e
                            })
                        })
                })
                .catch(e => {
                    res.status(200).send({
                        message: e
                    })
                })

        })
        .catch(e => {
            res.status(200).send({
                message: e
            })
        })
};

exports.etat = (req, res) => {

    User.update({
        active: req.body.active
    }, {
        where: {
            id: req.params.id
        }
    })
        .then(data => {
            res.status(200).send(data);
        })
        .catch(e => {
            res.status(400).send({
                message: e
            })
        })

};