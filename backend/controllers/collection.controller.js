const db = require('../models');
const Genre = db.genre;
const Type = db.type;
const Auteur = db.auteur;
const Editeur = db.editeur;
const Collection = db.collection;
const User = db.user;
const UserCollection = db.user_collection;
const verification = require('../security/index');

exports.findAll = (req, res) => {

    const id = req.body.id;
    const erreurs = [];
    let resultat;

    resultat = verification.verificationIntegerNE(id, User, 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        res.status(400).send({
            message: erreurs
        })
    } else {
        User.findAll({
            where: {
                id: id
            },
            attributes: {
                exclude: ['activer', 'idRole', 'mdp', 'email', 'pseudo']
            },
            include: [
                {
                    model: Collection,
                    as: 'collection',
                    through: {
                        attributes: ['description']
                    },
                    attributes: {
                        exclude: ['idGenre', 'idType', 'idAuteur', 'idEditeur']
                    },
                    include: [
                        {model: Genre, nested: true},
                        {model: Type, nested: false},
                        {model: Auteur, nested: false},
                        {model: Editeur, nested: false},
                    ]
                }
            ]
        })
            .then(data => {
                res.status(200).send(data)
            })
            .catch(e => {
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de sélection de collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            })
    }

};

exports.findGenre = (req, res) => {

    Genre.findAll()
        .then(data => {
            res.status(200).send(data)
        })
        .catch(e => {
            res.status(400).send({
                message: [{
                    general: [
                        {erreur: "Un problème est survenu."},
                        {erreur: "La requête de sélection des genres n\'a pas eu lieu."},
                        {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                    ]
                }]
            })
        })

};

exports.findType = (req, res) => {

    Type.findAll()
        .then(data => {
            res.status(200).send(data)
        })
        .catch(e => {
            res.status(400).send({
                message: [{
                    general: [
                        {erreur: "Un problème est survenu."},
                        {erreur: "La requête de sélection des types n\'a pas eu lieu."},
                        {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                    ]
                }]
            })
        })

};

exports.findFiltre = (req, res) => {

};

exports.findOne = (req, res) => {

    const idUser = req.body.id;
    const idCollection = req.params.id;

    const erreurs = [];
    let resultat;

    resultat = verification.verificationIntegerNE(idUser, User, 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    resultat = verification.verificationIntegerNE(idCollection, Collection, 'id');
    if (resultat.length > 0) {
        erreurs.push({collection: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        res.status(400).send({
            message: erreurs
        })
    } else {

        User.findOne({
            where: {
                id: idUser
            },
            attributes: {
                exclude: ['activer', 'idRole']
            },
            include: [
                {
                    model: Collection,
                    as: 'collection',
                    through: {
                        attributes: ['description']
                    },
                    attributes: {
                        exclude: ['idGenre', 'idType', 'idAuteur', 'idEditeur']
                    },
                    include: [
                        {model: Genre, nested: true},
                        {model: Type, nested: false},
                        {model: Auteur, nested: false},
                        {model: Editeur, nested: false},
                    ],
                    where: {
                        id: idCollection
                    }
                }
            ]
        })
            .then(data => {
                if (data) {
                    res.status(200).send(data)
                } else {
                    res.status(400).send({
                        message: [{
                            collection: [
                                {erreur: "La collection n'a pas été trouvé."},
                            ]
                        }]
                    })
                }
            })
            .catch(e => {
                console.log(e);
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de sélection d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            })
    }
};

exports.create = async (req, res) => {

    const t = await db.sequelize.transaction({autocommit: true});

    const titre = req.body.titre.trim();
    const idGenre = req.body.genre;
    const idType = req.body.type;
    const idAuteur = req.body.auteur.trim();
    const idEditeur = req.body.editeur.trim();
    const description = req.body.description.trim();
    const idUser = req.body.id;

    const regex = /^[0-9A-Za-zàáâäçèéêëìíîïñòóôöùúûü '-]*$/;
    const autorise = 'minuscules, majuscules, chiffres, accents, espaces, apostrophes et tirets';

    const regexDesc = /^[0-9A-Za-zàáâäçèéêëìíîïñòóôöùúûü '-()]*$/;
    const autoriseDesc = 'minuscules, majuscules, chiffres, accents, espaces, apostrophes, parenthèses et tirets';

    const erreurs = [];
    let resultat;

    resultat = await verification.verificationIntegerNE(idUser, User, 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    resultat = await verification.verificationIntegerNE(idType, Type, 'id');
    if (resultat.length > 0) {
        erreurs.push({type: resultat});
    }

    resultat = await verification.verificationIntegerNE(idGenre, Genre, 'id');
    if (resultat.length > 0) {
        erreurs.push({genre: resultat});
    }

    resultat = verification.verificationPRT(titre, regex, autorise, 1, 150);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    resultat = verification.verificationPRT(idAuteur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    resultat = verification.verificationPRT(idEditeur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    resultat = verification.verificationRT(description, regexDesc, autoriseDesc, 0, 250);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        res.status(400).send({
            message: erreurs
        })
    } else {
        const collection = {
            titre: titre,
            idGenre: idGenre,
            idType: idType,
            idAuteur: idAuteur,
            idEditeur: idEditeur,
        };

        await Auteur.findOrCreate(
            {
                where:
                    {auteur: collection['idAuteur']},
                transaction: t
            }
        )
            .then(async data => {
                collection['idAuteur'] = data[0].dataValues.id
            })
            .catch(async e => {
                await t.rollback();
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de création d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            });

        await Editeur.findOrCreate(
            {
                where:
                    {editeur: collection['idEditeur']},
                transaction: t
            }
        )
            .then(async data => {
                collection['idEditeur'] = data[0].dataValues.id
            })
            .catch(async e => {
                await t.rollback();
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de création d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            });

        const userCollection = {
            idUser: idUser,
            idCollection: 0
        };

        await Collection.findOrCreate({
            where: collection,
            transaction: t
        })
            .then(async data => {
                userCollection['idCollection'] = data[0].dataValues.id;
            })
            .catch(async e => {
                await t.rollback();
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de création d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            });

        UserCollection.findOne({
            where: userCollection,
            transaction: t
        })
            .then(async data => {
                if (data) {
                    await t.rollback();
                    res.status(400).send({
                        message: [{
                            collection: [
                                {erreur: "Vous avez déjà ajouté ce livre."}
                            ]
                        }]
                    })
                } else {
                    userCollection['description'] = description;
                    UserCollection.create(userCollection, {transaction: t})
                        .then(async data => {
                            await t.commit();
                            res.status(200).send(data);
                        })
                        .catch(async e => {
                            await t.rollback();
                            res.status(400).send({
                                message: [{
                                    general: [
                                        {erreur: "Un problème est survenu."},
                                        {erreur: "La requête de création d'une collection n\'a pas eu lieu."},
                                        {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                                    ]
                                }]
                            })
                        })
                }
            })
            .catch(async e => {
                await t.rollback();
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de création d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            })
    }
};

exports.delete = (req, res) => {

    const idUser = req.body.id;
    const idCollection = req.params.id;

    const erreurs = [];
    let resultat;

    resultat = verification.verificationIntegerNE(idUser, User, 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    resultat = verification.verificationIntegerNE(idCollection, Collection, 'id');
    if (resultat.length > 0) {
        erreurs.push({collection: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        res.status(400).send({
            message: erreurs
        })
    } else {
        UserCollection.delete({
            where: {
                idUser: idUser,
                idCollection: idCollection
            }
        })
            .then(data => {
                res.status(200).send({
                    message: [{
                        collection: [
                            {valider: "La suppression a été réalisé avec succès."},
                        ]
                    }]
                })
            })
            .catch(e => {
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de suppression d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            })
    }
};

exports.update = async (req, res) => {

    const t = await db.sequelize.transaction({autocommit: true});

    const titre = req.body.titre.trim();
    const idGenre = req.body.genre;
    const idType = req.body.type;
    const idAuteur = req.body.auteur.trim();
    const idEditeur = req.body.editeur.trim();
    const description = req.body.description.trim();
    const idUser = req.body.id;
    const idCollection = req.params.id;

    const regex = /^[0-9A-Za-zàáâäçèéêëìíîïñòóôöùúûü '-]*$/;
    const autorise = 'minuscules, majuscules, chiffres, accents, espaces, apostrophes et tirets';

    const regexDesc = /^[0-9A-Za-zàáâäçèéêëìíîïñòóôöùúûü '-()]*$/;
    const autoriseDesc = 'minuscules, majuscules, chiffres, accents, espaces, apostrophes, parenthèses et tirets';

    const erreurs = [];
    let resultat;

    resultat = await verification.verificationIntegerNE(idUser, User, 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    resultat = await verification.verificationIntegerNE(idCollection, Collection, 'id');
    if (resultat.length > 0) {
        erreurs.push({collection: resultat});
    }

    resultat = await verification.verificationIntegerNE(idType, Type, 'id');
    if (resultat.length > 0) {
        erreurs.push({type: resultat});
    }

    resultat = await verification.verificationIntegerNE(idGenre, Genre, 'id');
    if (resultat.length > 0) {
        erreurs.push({genre: resultat});
    }

    resultat = verification.verificationPRT(titre, regex, autorise, 1, 150);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    resultat = verification.verificationPRT(idAuteur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    resultat = verification.verificationPRT(idEditeur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    resultat = verification.verificationRT(description, regexDesc, autoriseDesc, 0, 250);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        res.status(400).send({
            message: erreurs
        })
    } else {
        const collection = {
            titre: titre,
            idGenre: idGenre,
            idType: idType,
            idAuteur: idAuteur,
            idEditeur: idEditeur,
        };

        await Auteur.findOrCreate(
            {
                where:
                    {auteur: collection['idAuteur']},
                transaction: t
            }
        )
            .then(async data => {
                collection['idAuteur'] = data[0].dataValues.id
            })
            .catch(async e => {
                await t.rollback();
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de modification d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            });

        await Editeur.findOrCreate(
            {
                where:
                    {editeur: collection['idEditeur']},
                transaction: t
            }
        )
            .then(async data => {
                collection['idEditeur'] = data[0].dataValues.id
            })
            .catch(async e => {
                await t.rollback();
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de modification d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            });

        const userCollection = {
            idUser: idUser,
            idCollection: 0
        };

        await Collection.findOrCreate({
            where: collection,
            transaction: t
        })
            .then(async data => {
                userCollection['idCollection'] = data[0].dataValues.id;
            })
            .catch(async e => {
                await t.rollback();
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de modification d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            });

        UserCollection.update({
            idCollection: userCollection['idCollection'],
            description: description
        }, {
            where: {
                idUser: idUser,
                idCollection: idCollection
            },
            transaction: t
        })
            .then(async data => {
                await t.commit();
                res.status(200).send(data);
            })
            .catch(async e => {
                await t.rollback();
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de modification d'une collection n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            });
    }
};

