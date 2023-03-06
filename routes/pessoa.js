var express = require('express');
var router = express.Router();
var pessoaController = require('../controller/pessoaController');

// Get all the people
router.get('/', pessoaController.findAll);

// Get one person by ID
router.get('/:id', pessoaController.findOne);

// Insert a person
router.post('/', pessoaController.insert);

// Updates a person by ID
router.put('/:id', pessoaController.update);

// Deletes a person by ID
router.delete('/:id', pessoaController.delete);

// Erase all people
router.delete('/', pessoaController.deleteAll);

module.exports = router;
