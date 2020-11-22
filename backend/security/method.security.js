const db = require('../models/index');
const {QueryTypes} = require('sequelize');

exports.boolean = (erreur, parametre) => {

    if (parametre !== 'true' && parametre !== 'false') {
        erreur.push('La valeur doit être true ou false.');
    }

};

exports.existant = async (erreur, parametre, table, colonne)=>{

    const response = await db.sequelize.query(
        'SELECT * FROM ' + table + ' WHERE ' + colonne + ' = :valeur',
        {
            replacements:{valeur : parametre},
            type : QueryTypes.SELECT
        }
    );

    if (response.length > 0){
        erreur.push('La valeur existe déjà');
    }
};

exports.integer = (erreur, parametre) => {

    if (isNaN(parametre) || parseInt(parametre) <= 0) {
        erreur.push('La valeur doit être un numérique positif.');
    }

};

exports.presence = (erreur, parametre) => {

    if(!parametre && parametre !== 0){
        erreur.push('Veuillez remplir le champ.');
        return false;
    }
    return true;
};

exports.regex = (erreur, parametre, regex, autorise) =>{

    if(!regex.test(parametre)){
        erreur.push(`Il est autorisé : ${autorise}`);
    }
};

exports.nonExistant = async (erreur, parametre, table, colonne)=>{

    const response = await db.sequelize.query(
        'SELECT * FROM ' + table + ' WHERE ' + colonne + ' = :valeur',
        {
            replacements:{valeur : parametre},
            type : QueryTypes.SELECT
        }
    );

    if (response.length === 0){
        erreur.push('La valeur n\'existe pas.');
    }
};

exports.taille = (erreur, parametre, minimum, maximum)=>{

    if(minimum > parametre.length || maximum < parametre.length){
        erreur.push(`Il doit y avoir entre ${minimum} et ${maximum} caractères.`);
    }
};

