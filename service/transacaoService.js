const db = require("../database/appDatabase");
const ContaDatabase = db.conta;
const TransacaoDatabase = db.transacao;
const mongoose = require('mongoose');
const constants = require('../resources/appConstants');
const moment = require('moment');

const transacaoService = {};

// Documentation: https://mongoosejs.com/docs/transactions.html
transacaoService.updataSaldo = async function(transacaoDatabase, transacaoType) {
    const sessionTransaction = await db.mongoose.startSession();
    var hasError = false;
    var errorMsg = { message: "no error." };
    var conta;

    // Start MongoDB operations transaction
    sessionTransaction.startTransaction();

    // Create the transaction document
    await transacaoDatabase
        .save({session: sessionTransaction})
        .catch((err) => {
            errorMsg = {
                message:
                    err.message ||
                    "Some error occurred while creating the Transacao.",
            };
            hasError = true;
        });

    // Retrieve the "conta" information from database
    if (!hasError) {
        conta = await ContaDatabase.findById(transacaoDatabase.idConta).session(sessionTransaction)
            .catch((err) => {
                errorMsg = {
                    message: "Some error occurred while creating the Transacao [1].",
                };
                hasError = true;
            });
        
        if (!conta) {
            errorMsg = {
                message: "Account does not exist.",
            };
            hasError = true;
        }

        // Is the account locked? (true is actived)
        if (!hasError) {
            if(!conta.flagAtivo) {
                errorMsg = {
                    message: "Account is not activated.",
                };
                hasError = true;
            } else {
                // Calculate the new "saldo" value
                conta.saldo = Number(conta.saldo) + Number(transacaoDatabase.valor);
            }
        }
    }

    // Check the diary limit withdrawal
    if (!hasError && transacaoType == constants.TRANSACTION_ITHDRAWAL) {
        var dateTodayAtMidnight = new Date().setHours(0,0,0,0);
        // TODO: Workaround for solve UTC. I need to check the clock out before setup to production (it will not happen :))
        var dateNextDayAtMidnight = new Date().setHours(48,0,0,0);

        try {
            const transacoesAgg = await TransacaoDatabase.aggregate([
                {
                    '$match': {
                        'idConta': new db.mongoose.Types.ObjectId(conta.id),
                        'createdAt': {
                            '$gte': new Date(moment(dateTodayAtMidnight).format('YYYY-MM-DD[T00:00:00.000Z]')), 
                            '$lt': new Date(moment(dateNextDayAtMidnight).format('YYYY-MM-DD[T00:00:00.000Z]'))
                        }, 
                        'valor': {
                            '$lt': 0
                        }
                    }
                }, {
                    '$project': {
                        '_id': 0, 
                        'idConta': '$idConta', 
                        'valor': '$valor', 
                        'dataTransacao': '$createdAt'
                    }
                }, {
                    '$group': {
                        '_id': '$idConta', 
                        'total': {
                            '$sum': '$valor'
                        }
                    }
                }
            ]).session(sessionTransaction);

            // It checks max withdrawal amount per day
            var amountNormalized = 0;
            if (transacoesAgg.length > 0) {
                amountNormalized = Number(transacoesAgg[0].total);
            }

            if (-(amountNormalized) > Number(conta.limiteSaqueDiario)) {
                errorMsg = {
                    message: "Max withdrawal amount per day reached.",
                };
                hasError = true;
            }
        } catch (e) {
            errorMsg = {
                message: "Amount could not updated.",
            };
            hasError = true;
        }
    }

    // Update "saldo"
    if (!hasError) {
        await ContaDatabase.findByIdAndUpdate(conta.id, conta, { useFindAndModify: false }).session(sessionTransaction)
            .then((data) => {
                if (!data) {
                    errorMsg = {
                        message: "Some error occurred while creating the Transacao [2].",
                    };
                    hasError = true;
                }
            })
            .catch((err) => {
                errorMsg = {
                    message: "Some error occurred while creating the Transacao [3].",
                };
                hasError = true;
            });
    }

    try {
        // Database Rollback or commit code block
        if (hasError) {
            // Rool back to original data
            await sessionTransaction.abortTransaction();
        } else {
            // Commit all database operations
            await sessionTransaction.commitTransaction();
        }
    } catch(e) {
        errorMsg = {
            message: "Some error occurred while creating the Transacao [4].",
        };
        hasError = true;
    }

    // Close session
    sessionTransaction.endSession();

    return {hasError: hasError, errorMsg: errorMsg.message.toString()};
}

module.exports = transacaoService;