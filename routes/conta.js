var express = require('express');
const { route } = require('.');
var router = express.Router();
var contaController = require('../controller/contaController')

// Get all accounts
router.get('/', contaController.findAll);

// Get an account by ID
router.get('/:id', contaController.findOne);

// Implement path that performs the creation of an account with no business roles
// Please, use /criar instead of this
router.post('/', contaController.insert);

// Implement path that performs the creation of an account
router.post('/criar', contaController.create);

// Implement account update path
router.put('/:id', contaController.update);

// Implement path that performs an account lockout
router.put('/bloqueio/:id', contaController.blockAccount);

// Implement path to delete all accounts
router.delete('/', contaController.deleteAll);

// Implement path to delete an account
router.delete('/:id', contaController.delete);

module.exports = router;
