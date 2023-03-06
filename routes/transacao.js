var express = require('express');
var router = express.Router();
var transacaoController = require('../controller/transacaoController');

// Get all transactions
router.get('/', transacaoController.findAll);

// Implement path that performs balance inquiry operation on a given account
router.get('/saldo/:id', transacaoController.findAllApplySaldo);

// Implement statement by period
router.get('/extrato/:id', transacaoController.findAllByPeriod);

// Implement path that performs deposit operation on an account
router.post('/deposito', transacaoController.cashOperation);

// Implement path that performs withdrawal operation on an account
router.post('/saque', transacaoController.cashOperation);

// Deletes a transaction by ID
router.delete('/:id', transacaoController.delete);

// Deletes all transactions by ID
router.delete('/', transacaoController.deleteAll);

// Deletes all transactions by Account's ID
router.delete('/all/:idConta', transacaoController.deleteAllByAccountId);

module.exports = router;
