const db = require("../database/appDatabase");
const ContaDatabase = db.conta;
const TransacaoDatabase = db.transacao;

const contaService = {};

contaService.blockAccount = async function(id, flag) {
    var hasError = false;
    var errorMsg = { message: "no error." };

    var objId = new db.mongoose.Types.ObjectId(id);

    // Update flag
    await ContaDatabase.updateOne({_id: objId}, {$set: { flagAtivo: flag}})
        .then((data) => {
            if (!data) {
                errorMsg = {
                    message: "Some error occurred while updating the Conta [1].",
                };
                hasError = true;
            }
        })
        .catch((err) => {
            errorMsg = {
                message: "Some error occurred while updating the Conta [2]." + err.message,
            };
            hasError = true;
        });

    return {hasError: hasError, errorMsg: errorMsg.message.toString()};
}

contaService.createAccount = async function(contaDatabase) {
    const accountTransaction = await db.mongoose.startSession();
    var hasError = false;
    var errorMsg = { message: "no error." };
    var conta;

    // Start MongoDB operations transaction
    accountTransaction.startTransaction();

    // Create the conta document
    await contaDatabase
        .save({ session: accountTransaction })
        .then((data) => {
            conta = data;
        })
        .catch((err) => {
            errorMsg = {
                message:
                    err.message ||
                    "Some error occurred while creating the Conta [1].",
            };
            hasError = true;
        });

    // Create a Transacao model
    var transacaoDatabase = new TransacaoDatabase({
        idConta: conta.id,
        valor: 0,
        dataTransacao: new Date(),
    });

    // Create the transaction document
    if (!hasError) {
        await transacaoDatabase.save({ session: accountTransaction })
            .catch((err) => {
                errorMsg = {
                    message:
                        err.message ||
                        "Some error occurred while creating the Conta [2].",
                };
                hasError = true;
            });
    }

    // Database Rollback or commit code block
    if (hasError) {
        // Rool back to original data
        await accountTransaction.abortTransaction();

        // Close session
        accountTransaction.endSession();

        return { hasError: hasError, errorMsg: errorMsg.message.toString() };
    } else {
        // Commit all database operations
        await accountTransaction.commitTransaction();

        // Close session
        accountTransaction.endSession();

        return {
            hasError: hasError,
            errorMsg: errorMsg.message.toString(),
            account: conta,
        };
    }
};

module.exports = contaService;