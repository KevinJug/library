const express = require('express');
const router = express.Router();
const livres = require('../controllers/livre.controller');
const authUtilisateur = require('../middleware/authUtilisateur');

router.get('/findAll',livres.findAll);
router.get('/findOne/:id',livres.findOne);
router.get('/findFiltre',livres.findFiltre);
router.get('/findGenre',livres.findGenre);
router.get('/findStyle',livres.findStyle);

router.post('/create', livres.create);

router.put('/update/:id', livres.update);

router.delete('/delete/:id', livres.delete);

module.exports = router;