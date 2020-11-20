const db = require('../models');
const Genre = db.genre;
const Type = db.type;
const Auteur = db.auteur;
const Editeur = db.editeur;
const Collection = db.collection;
const User = db.user;
const UserCollection = db.user_collection;

exports.findAll = (req, res) => {

    User.findAll({
        where: {
            id: req.body.id
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

exports.findType = (req, res) => {

    Type.findAll()
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
                    id: req.params.id
                }
            }
        ]
    })
        .then(data => {
            if (data) {
                res.status(200).send(data)
            } else {
                res.status(400).send({
                    message: 'Non trouvé!'
                })
            }
        })
        .catch(e => {
            console.log(e);
            res.status(400).send({
                message: e
            })
        })

};

exports.create = async (req, res) => {

    const t = await db.sequelize.transaction({autocommit: true});

    const collection = {
        titre: req.body.titre,
        idGenre: req.body.genre,
        idType: req.body.type,
        idAuteur: req.body.auteur,
        idEditeur: req.body.editeur,
    };

    await Auteur.findOrCreate(
        {
            where:
                {
                    auteur: collection['idAuteur']
                },
            transaction: t
        }
    )
        .then(async data => {
            collection['idAuteur'] = data[0].dataValues.id
        })
        .catch(async e => {
            console.log(e);
            await t.rollback();
            res.status(400).send({
                message: e
            })
        });

    await Editeur.findOrCreate(
        {
            where:
                {
                    editeur: collection['idEditeur']
                },
            transaction: t
        }
    )
        .then(async data => {
            collection['idEditeur'] = data[0].dataValues.id
        })
        .catch(async e => {
            console.log(e);
            await t.rollback();
            res.status(400).send({
                message: e
            })
        });

    const userCollection = {
        idUser: req.body.id,
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
                message: e
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
                    message: "Vous avez déjà ajouté ce livre."
                })
            } else {
                userCollection['description'] = req.body.description;
                UserCollection.create(userCollection, {transaction: t})
                    .then(async data => {
                        await t.commit();
                        res.status(200).send(data);
                    })
                    .catch(async e => {
                        await t.rollback();
                        res.status(400).send({
                            message: e
                        })
                    })
            }
        })
        .catch(async e => {
            await t.rollback();
            res.status(400).send({
                message: e
            })
        })
};

exports.delete = (req, res) => {

    UserCollection.delete({
        where: {
            idUser: req.body.id,
            idCollection: req.params.id
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

exports.update = async (req, res) => {

    const t = await db.sequelize.transaction({autocommit: true});

    const collection = {
        titre: req.body.titre,
        idGenre: req.body.genre,
        idType: req.body.type,
        idAuteur: req.body.auteur,
        idEditeur: req.body.editeur,
    };


    await Auteur.findOrCreate(
        {
            where:
                {
                    auteur: collection['idAuteur']
                },
            transaction: t
        }
    )
        .then(async data => {
            collection['idAuteur'] = data[0].dataValues.id
        })
        .catch(async e => {
            await t.rollback();
            res.status(400).send({
                message: e
            })
        });

    await Editeur.findOrCreate(
        {
            where:
                {
                    editeur: collection['idEditeur']
                },
            transaction: t
        }
    )
        .then(async data => {
            collection['idEditeur'] = data[0].dataValues.id
        })
        .catch(async e => {
            console.log(e);
            await t.rollback();
            res.status(400).send({
                message: e
            })
        });

    const userCollection = {
        idUser: req.body.id,
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
                message: e
            })
        });

    UserCollection.update({
        idCollection: userCollection['idCollection'],
        description: req.body.description
    }, {
        where: {
            idUser: req.body.id,
            idCollection: req.params.id
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
                message: e
            })
        });

    // UserCollection.findOne({
    //     where: userCollection,
    //     transaction: t
    // })
    //     .then(async data => {
    //         if (data) {
    //             await t.rollback();
    //             res.status(400).send({
    //                 message: "Vous avez déjà ajouté ce livre."
    //             })
    //         } else {
    //             userCollection['description'] = req.body.description;
    //             UserCollection.create(userCollection, {transaction: t})
    //                 .then(async data => {
    //                     await t.commit();
    //                     res.status(200).send(data);
    //                 })
    //                 .catch(async e => {
    //                     await t.rollback();
    //                     res.status(400).send({
    //                         message: e
    //                     })
    //                 })
    //         }
    //     })
    //     .catch(async e => {
    //         await t.rollback();
    //         res.status(400).send({
    //             message: e
    //         })
    //     })
    //
    //
    // Collection.findOne({
    //     where: collection
    // })
    //     .then(data => {
    //         if (data) {
    //             UserCollection.update({
    //                 description: req.body.description
    //             }, {
    //                 where: {
    //                     idUser: req.body.id,
    //                     idCollection: req.params.id
    //                 }
    //             })
    //                 .then(data => {
    //                     res.status(200).send(data);
    //                 })
    //                 .catch(e => {
    //                     res.status(400).send({
    //                         message: e
    //                     })
    //                 })
    //         } else {
    //             Collection.create(collection)
    //                 .then(data => {
    //                     UserCollection.update({
    //                         idCollection: data.dataValues.id,
    //                         description: req.body.description
    //                     }, {
    //                         where: {
    //                             idUser: req.body.id,
    //                             idCollection: req.params.id
    //                         }
    //                     })
    //                         .then(data => {
    //                             res.status(200).send(data);
    //                         })
    //                         .catch(e => {
    //                             res.status(400).send({
    //                                 message: e
    //                             })
    //                         })
    //                 })
    //                 .catch(e => {
    //                     res.status(400).send({
    //                         message: e
    //                     })
    //                 })
    //         }
    //     })
    //     .catch(e => {
    //         res.status(400).send({
    //             message: e
    //         })
    //     })

};

