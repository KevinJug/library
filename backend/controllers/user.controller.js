const db = require('../models');
const User = db.user;
const Role = db.role;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verification = require('../security/index');

exports.findAll = (req, res) => {

    User.findAll({
        order: [
            ['id', 'ASC']
        ],
        attributes: {
            exclude: ['mdp']
        },
        where : {
            activer : true
        }
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

exports.create = async (req, res) => {

    const pseudo = req.body.pseudo;
    const mdp = req.body.mdp;
    const email = req.body.email;

    const regexPseudo = /^[0-9A-Za-zàáâäçèéêëìíîïñòóôöùúûü]*$/;
    const autorisePseudo = 'Le champ accepte des minuscules, majuscules, chiffres, accents';
    const regexEmail = /^(([0-9A-Za-z-]+(.[0-9A-Za-z-"]+))|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
    const autoriseEmail = 'Le format doit être sous forme d\'un email avec des minuscules, majuscules, chiffres et points';
    const regexMdp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
    const autoriseMdp = 'Le mot de passe doit avoir entre 8 et 10 caractères et au moins une minuscule, une majuscule, un chiffre et un caractère : @$!%*?&';

    const erreurs = [];

    let resultat;

    resultat = await verification.verificationPERT(pseudo, 'users', 'pseudo', regexPseudo, autorisePseudo, 3, 40);
console.log(resultat)
console.log(resultat.length)
    if (resultat.length > 0) {
        erreurs.push({pseudo: resultat});
    }

    resultat = await verification.verificationPERT(email, 'users', 'email', regexEmail, autoriseEmail, 3, 150);

    if (resultat.length > 0) {
        erreurs.push({email: resultat});
    }

    resultat = await verification.verificationPR(mdp, regexMdp, autoriseMdp);

    if (resultat.length > 0) {
        erreurs.push({mdp: resultat});
    }

    if (Object.keys(erreurs).length > 0) {
        res.status(400).send({
            message: erreurs
        })
    } else {
        bcrypt.hash(mdp, 10)
            .then(hash => {
                const user = {
                    pseudo: pseudo,
                    email: email,
                    mdp: hash,
                    idRole: 2,
                    activer: true
                };

                User.create(user)
                    .then(data => {
                        res.status(200).send({
                            message: [{
                                inscription: [
                                    {etat: "Vous êtes inscrit."},
                                ]
                            }]
                        })
                    })
                    .catch(e => {
                        res.status(500).send({
                            message: [{
                                general: [
                                    {erreur: "Un problème est survenu."},
                                    {erreur: "La requête de création de compte n\'a pas eu lieu."},
                                    {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                                ]
                            }]
                        })
                    })
            })
            .catch(e => {
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de création de compte n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            })
    }
};

exports.login = (req, res) => {

    const user = {};

    const login = req.body.login;
    const mdp = req.body.mdp;

    if (login.indexOf('@') === -1) {
        user['pseudo'] =login

    } else {
        user['email'] = login
    }

    User.findOne({
        where: user,
        include: [
            {model: Role, nested: true}
        ]
    })
        .then(data => {
            if (!data) {
                res.status(400).send({
                    message: [{
                        connexion: [
                            {erreur: "Le login (email ou pseudo) est incorrecte."},
                        ]
                    }]
                })
            }
            bcrypt.compare(mdp, data.dataValues.mdp)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).send({
                            message: [{
                                connexion: [
                                    {erreur: "Le mot de passe est incorrecte."},
                                ]
                            }]
                        })
                    }

                    res.status(200).send({
                        idUser: data.dataValues.id,
                        role: data.dataValues.role.id,
                        token: jwt.sign(
                            {idUser: data.dataValues.id, role: data.dataValues.role.id},
                            'CLE_SECRETE',
                            {expiresIn: '24h'}
                        )
                    })
                })
                .catch(e => {
                    res.status(200).send({
                        message: [{
                            general: [
                                {erreur: "Un problème est survenu."},
                                {erreur: "La requête de connexion de compte n\'a pas eu lieu."},
                                {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                            ]
                        }]
                    })
                })
        })
        .catch(e => {
            res.status(200).send({
                message: [{
                    general: [
                        {erreur: "Un problème est survenu."},
                        {erreur: "La requête de connexion de compte n\'a pas eu lieu."},
                        {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                    ]
                }]
            })
        })
};

exports.etat = async (req, res) => {

    const erreurs = [];
    const active = req.body.active;
    const id = req.params.id;
    let resultat;

    resultat = await verification.verificationBoolean(active);
    if (resultat.length > 0) {
        erreurs.push({active: resultat});
    }

    resultat = await verification.verificationIntegerNE(id, 'users', 'id');
    if (resultat.length > 0) {
        erreurs.push({user: resultat});
    }

    if(Object.keys(erreurs).length > 0) {
        res.status(400).send({
            message: erreurs
        })
    } else {
        User.update({
            activer: active
        }, {
            where: {
                id: id
            }
        })
            .then(data => {
                res.status(200).send(data);
            })
            .catch(e => {
                res.status(400).send({
                    message: [{
                        general: [
                            {erreur: "Un problème est survenu."},
                            {erreur: "La requête de désactivation de compte n\'a pas eu lieu."},
                            {erreur: "Veuillez réessayer ou contacter l'administrateur."},
                        ]
                    }]
                })
            })
    }



};