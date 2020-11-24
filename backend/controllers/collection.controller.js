const db = require('../models');
const Genre = db.genre;
const Type = db.type;
const Auteur = db.auteur;
const Editeur = db.editeur;
const Collection = db.collection;
const User = db.user;
const UserCollection = db.user_collection;
const verification = require('../security/index');

exports.findAll = async (req, res) => {

    const id = req.body.id;
    const erreurs = [];
    let resultat;

    resultat = await verification.verificationIntegerNE(id, 'users', 'id');
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

exports.findFiltre = async (req, res) => {


    const idUser = req.body.id;
    const titre = req.body.titre.trim();
    const idAuteur = req.body.auteur.trim();
    const idEditeur = req.body.editeur.trim();
    const idType = req.body.type;
    const idGenre = req.body.genre;
    let condition = '';

    const regex = /^[0-9A-Za-zàáâäçèéêëìíîïñòóôöùúûü '-]*$/;
    const autorise = 'minuscules, majuscules, chiffres, accents, espaces, apostrophes et tirets';

    const regexDesc = /^[0-9A-Za-zàáâäçèéêëìíîïñòóôöùúûü '-()]*$/;
    const autoriseDesc = 'minuscules, majuscules, chiffres, accents, espaces, apostrophes, parenthèses et tirets';

    const erreurs = [];
    let resultat;

    resultat = await verification.verificationIntegerNE(idUser, 'users', 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    resultat = await verification.verificationIntegerNEFacultatif(idType, 'types', 'id');
    if (resultat.length > 0) {
        erreurs.push({type: resultat});
    }

    resultat = await verification.verificationIntegerNEFacultatif(idGenre, 'genres', 'id');
    if (resultat.length > 0) {
        erreurs.push({genre: resultat});
    }

    resultat = await verification.verificationPRTFacultatif(titre, regex, autorise, 1, 150);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    resultat = await verification.verificationPRTFacultatif(idAuteur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({auteur: resultat});
    }

    resultat = await verification.verificationPRTFacultatif(idEditeur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({editeur: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        res.status(400).send({
            message: erreurs
        })
    } else {

        condition = ' where u."idUser" = ' + idUser;

        if (titre) {
            condition = condition + ' AND c.titre LIKE \'%' + titre + '%\'';
        }

        if (idAuteur) {
            condition = condition + ' AND a.auteur LIKE \'%' + idAuteur + '%\'';
        }

        if (idEditeur) {
            condition = condition + ' AND e.editeur LIKE \'%' + idEditeur + '%\'';
        }

        if (idType) {
            condition = condition + ' AND c."idType" = ' + idType;
        }

        if (idGenre) {
            condition = condition + ' AND c."idGenre" = ' + idGenre;
        }

        try {

            resultat = await db.sequelize.query(
                'select u.*, c.*, a.auteur, e.editeur, t.libelle as type, g.libelle as genre from user_collections u ' +
                'join collections c on u."idCollection" = c.id ' +
                'join auteurs a on c."idAuteur" = a.id ' +
                'join editeurs e on c."idEditeur" = e.id ' +
                'join types t on c."idType" = t.id ' +
                'join genres g on c."idGenre" = g.id ' + condition,
                {
                    type : db.Sequelize.QueryTypes.SELECT
                }
            );

            res.status(200).send(resultat)

        } catch (e) {
            res.status(400).send({
                message: [{
                    general: [
                        {erreur: "Un problème est survenu."},
                        {erreur: "La requête de fitrage des collection n\'a pas eu lieu."},
                        {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                    ]
                }]
            })
        }
    }
};

exports.findOne = async (req, res) => {

    const idUser = req.body.id;
    const idCollection = req.params.id;

    const erreurs = [];
    let resultat;

    resultat = await verification.verificationIntegerNE(idUser, 'users', 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    resultat = await verification.verificationIntegerNE(idCollection, 'collections', 'id');
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

    resultat = await verification.verificationIntegerNE(idUser, 'users', 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    resultat = await verification.verificationIntegerNE(idType, 'types', 'id');
    if (resultat.length > 0) {
        erreurs.push({type: resultat});
    }

    resultat = await verification.verificationIntegerNE(idGenre, 'genres', 'id');
    if (resultat.length > 0) {
        erreurs.push({genre: resultat});
    }

    resultat = await verification.verificationPRT(titre, regex, autorise, 1, 150);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    resultat = await verification.verificationPRT(idAuteur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({auteur: resultat});
    }

    resultat = await verification.verificationPRT(idEditeur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({editeur: resultat});
    }

    resultat = await verification.verificationRT(description, regexDesc, autoriseDesc, 0, 250);
    if (resultat.length > 0) {
        erreurs.push({description: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        await t.rollback();
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

exports.delete = async (req, res) => {

    const idUser = req.body.id;
    const idCollection = req.params.id;

    const erreurs = [];
    let resultat;

    resultat = await verification.verificationIntegerNE(idUser, 'users', 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    resultat = await verification.verificationIntegerNE(idCollection, 'collections', 'id');
    if (resultat.length > 0) {
        erreurs.push({collection: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        res.status(400).send({
            message: erreurs
        })
    } else {
        UserCollection.destroy({
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

    resultat = await verification.verificationIntegerNE(idUser, 'users', 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    resultat = await verification.verificationIntegerNE(idCollection, 'collections', 'id');
    if (resultat.length > 0) {
        erreurs.push({collection: resultat});
    }

    resultat = await verification.verificationIntegerNE(idType, 'types', 'id');
    if (resultat.length > 0) {
        erreurs.push({type: resultat});
    }

    resultat = await verification.verificationIntegerNE(idGenre, 'genres', 'id');
    if (resultat.length > 0) {
        erreurs.push({genre: resultat});
    }

    resultat = await verification.verificationPRT(titre, regex, autorise, 1, 150);
    if (resultat.length > 0) {
        erreurs.push({titre: resultat});
    }

    resultat = await verification.verificationPRT(idAuteur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({auteur: resultat});
    }

    resultat = await verification.verificationPRT(idEditeur, regex, autorise, 1, 100);
    if (resultat.length > 0) {
        erreurs.push({editeur: resultat});
    }

    resultat = await verification.verificationRT(description, regexDesc, autoriseDesc, 0, 250);
    if (resultat.length > 0) {
        erreurs.push({description: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        await t.rollback();
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

