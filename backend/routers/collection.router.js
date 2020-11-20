const express = require('express');
const router = express.Router();
const collections = require('../controllers/collection.controller');
const authUtilisateur = require('../middleware/authUtilisateur');

router.get('/findAll',collections.findAll);
router.get('/findOne/:id',collections.findOne);
router.get('/findFiltre',collections.findFiltre);
router.get('/findGenre',collections.findGenre);
router.get('/findType',collections.findType);

router.post('/create', collections.create);

router.put('/update/:id', collections.update);

router.delete('/delete/:id', collections.delete);

module.exports = router;