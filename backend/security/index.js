const controle = require('./method.security');

exports.verificationBoolean = async (parametre) => {

    const erreurs = [];

    if (controle.presence(erreurs, parametre)) {

        controle.boolean(erreurs, parametre);
    }
    return erreurs;
};

exports.verificationIntegerNE = async (parametre, table, colonne) => {

    const erreurs = [];

    if (controle.presence(erreurs, parametre)) {
        if(controle.integer(erreurs, parametre)){
            await controle.nonExistant(erreurs, parametre, table, colonne)
        }
    }

    return erreurs;
};

exports.verificationPR = async (parametre, regex, autorise) => {

    const erreurs = [];

    if (controle.presence(erreurs, parametre)) {

        controle.regex(erreurs, parametre, regex, autorise);
    }

    return erreurs;
};

exports.verificationPERT = async (parametre, table, colonne, regex, autorise, mini, maxi) => {

    const erreurs = [];

    if (controle.presence(erreurs, parametre)) {

        await controle.existant(erreurs, parametre, table, colonne);
        controle.regex(erreurs, parametre, regex, autorise);
        controle.taille(erreurs, parametre, mini, maxi);
    }

    return erreurs;
};

exports.verificationPRT = async (parametre, regex, autorise, mini, maxi) => {

    const erreurs = [];

    if (controle.presence(erreurs, parametre)) {

        controle.regex(erreurs, parametre, regex, autorise);
        controle.taille(erreurs, parametre, mini, maxi);
    }

    return erreurs;
};

exports.verificationRT = async (parametre, regex, autorise, mini, maxi) => {

    const erreurs = [];

    if (parametre) {

        controle.regex(erreurs, parametre, regex, autorise);
        controle.taille(erreurs, parametre, mini, maxi);
    }

    return erreurs;
};