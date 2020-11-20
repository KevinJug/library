const db = require('../models');
const Genre = db.genre;
const Style = db.style;
const Livre = db.livre;
const User = db.user;
const UserLivre = db.user_livre;

exports.findAll = (req, res) => {

    User.findAll({
        where: {
            id: req.body.id
        },
        attributes: {
            exclude: ['activer', 'idRole']
        },
        include: [
            {
                model: Livre,
                as: 'livre',
                through: {
                    attributes: ['description']
                },
                attributes: {
                    exclude: ['idGenre', 'idStyle']
                },
                include: [
                    {model: Genre, nested: true},
                    {model: Style, nested: false},
                ]
            }
        ]
    })
        .then(data => {
            res.status(200).send(data)
        })
        .catch(e => {
            console.log(e);
            res.status(400).send({
                message: e
            })
        })

};

exports.findGenre = (req, res) => {

    Genre.findAll()
        .then(data => {
            res.status(200).send(data)
        })
        .catch(e => {
            res.status(400).send({
                message: e
            })
        })

};

exports.findStyle = (req, res) => {

    Style.findAll()
        .then(data => {
            res.status(200).send(data)
        })
        .catch(e => {
            res.status(400).send({
                message: e
            })
        })

};

exports.findFiltre = (req, res) => {

};

exports.findOne = (req, res) => {

    User.findOne({
        where: {
            id: req.body.id
        },
        attributes: {
            exclude: ['activer', 'idRole']
        },
        include: [
            {
                model: Livre,
                as: 'livre',
                through: {
                    attributes: ['description']
                },
                attributes: {
                    exclude: ['idGenre', 'idStyle']
                },
                include: [
                    {model: Genre, nested: true},
                    {model: Style, nested: false},
                ],
                where : {
                    id : req.params.id
                }
            }
        ]
    })
        .then(data => {
            res.status(200).send(data)
        })
        .catch(e => {
            console.log(e);
            res.status(400).send({
                message: e
            })
        })

};

exports.create = (req, res) => {

    const livre = {
        titre: req.body.titre,
        auteur: req.body.auteur,
        idGenre: req.body.genre,
        idStyle: req.body.style
    };

    Livre.findOne({
        where: livre
    })
        .then(data => {
            if (data) {
                UserLivre.findOne({
                    where: {
                        idUser: req.body.id,
                        idLivre: data.dataValues.id
                    }
                })
                    .then(data => {
                        if (data) {
                            res.status(400).send({
                                message: "Vous avez déjà ajouté ce livre."
                            })
                        } else {
                            UserLivre.create({
                                idUser: req.body.id,
                                idLivre: data.dataValues.id,
                                description: req.body.description
                            })
                                .then(data => {
                                    res.status(200).send(data);
                                })
                                .catch(e => {
                                    res.status(400).send({
                                        message: e
                                    })
                                })
                        }
                    })
                    .catch(e => {
                        res.status(400).send({
                            message: e
                        })
                    })
            } else {
                Livre.create(livre)
                    .then(data => {
                        UserLivre.create({
                            idUser: req.body.id,
                            idLivre: data.dataValues.id,
                            description: req.body.description
                        })
                            .then(data => {
                                res.status(200).send(data);
                            })
                            .catch(e => {
                                res.status(400).send({
                                    message: e
                                })
                            })
                    })
                    .catch(e => {
                        res.status(400).send({
                            message: e
                        })
                    })
            }
        })
        .catch(e => {
            res.status(400).send({
                message: e
            })
        })

};

exports.delete = (req, res) => {

    UserLivre.delete({
        where: {
            idUser: req.body.id,
            idLivre: req.params.id
        }
    })
        .then(data => {
            if (data === 1) {
                res.status(200).send({
                    message: "OK"
                })
            } else {
                res.status(400).send({
                    message: " NON OK"
                })
            }
        })
        .catch(e => {
            res.status(400).send({
                message: e
            })
        })

};

exports.update = (req, res) => {

    const livre = {
        titre: req.body.titre,
        auteur: req.body.auteur,
        genre: req.body.genre,
        style: req.body.style
    };

    Livre.findOne({
        where: livre
    })
        .then(data => {
            if (data) {
                UserLivre.update({
                    description: req.body.description
                }, {
                    where: {
                        idUser: req.body.id,
                        idLivre: req.params.id
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
            } else {
                Livre.create(livre)
                    .then(data => {
                        UserLivre.update({
                            idLivre: data.dataValues.id,
                            description: req.body.description
                        }, {
                            where: {
                                idUser: req.body.id,
                                idLivre: req.params.id
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
                    })
                    .catch(e => {
                        res.status(400).send({
                            message: e
                        })
                    })
            }
        })
        .catch(e => {
            res.status(400).send({
                message: e
            })
        })

};
