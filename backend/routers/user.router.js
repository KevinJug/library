const users = require('../controllers/user.controller');
const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');

router.get('/find',users.findAll);

router.post('/create', users.create);

router.post('/login', users.login);

router.put('/etat/:id',users.etat);

module.exports = router;