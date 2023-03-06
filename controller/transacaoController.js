const e = require("express");
const db = require("../database/appDatabase");
const TransacaoDatabase = db.transacao;
const transacaoService = require('../service/transacaoService');
const constants = require('../resources/appConstants');

// Create and Save a new Transacao
exports.insert = (req, res) => {

  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Transacao model
  var transacaoDatabase = new TransacaoDatabase({
    idConta: req.body.idConta,
    valor: req.body.valor,
    dataTransacao: req.body.dataTransacao,
  });

  // Save Transacao in the database
  transacaoDatabase
    .save(transacaoDatabase)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Transacao.",
      });
    });

};

// Create and Save a new Transacao
exports.cashOperation = async (req, res) => {
  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  try {
    if (req.path == "/deposito" && Number.parseInt(req.body.valor) < 0) {
      res.status(400).send({ message: "Wrong 'valor' value. You should do a 'saque' operation." });
      return;
    } else if (req.path == "/saque" && Number.parseInt(req.body.valor) > 0) {
      res.status(400).send({ message: "Wrong 'valor' value. You should do a 'deposito' operation." });
      return;
    }
  } catch (e) {
    res.status(400).send({ message: "Wrong 'valor' value." });
    return;
  }

  // Create a Transacao model
  var transacaoDatabase = new TransacaoDatabase({
    idConta: req.body.idConta,
    valor: req.body.valor,
    dataTransacao: new Date(),
  });

  const updateSaldo = await transacaoService.updataSaldo(
    transacaoDatabase, 
    (Number.parseInt(req.body.valor) < 0) ? constants.TRANSACTION_ITHDRAWAL : constants.TRANSACTION_DEPOSIT
  );
  if (updateSaldo.hasError) {
    res.status(400).send({ message: updateSaldo.errorMsg});
  } else {
    res.send({ message: "ok"});
  }

};

// Retrieve all Transacao from the database.
exports.findAll = (req, res) => {
  TransacaoDatabase.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Transacao.",
      });
    });
};

// Find a single Transacao with an id
exports.findOne = (req, res) => {
  // ID from HTTP request
  const id = req.params.id;
  // Retrieve a Pessoa from the database.
  TransacaoDatabase.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Transacao with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving Transacao with id=" + id });
    });
};

// Update a Transacao by the id in the request
exports.update = (req, res) => {
  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // ID from HTTP request
  const id = req.params.id;

  TransacaoDatabase.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Transacao with id=${id}. Maybe Transacao was not found!`,
        });
      } else res.send({ message: "Transacao was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Transacao with id=" + id,
      });
    });
};

// Delete a Transacao with the specified id in the request
exports.delete = (req, res) => {
  // ID from HTTP request
  const id = req.params.id;
  TransacaoDatabase.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Transacao with id=${id}. Maybe Transacao was not found!`,
        });
      } else {
        res.send({
          message: "Transacao was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Transacao with id=" + id,
      });
    });
};

// Delete all Transacaos from the database.
exports.deleteAll = (req, res) => {
  TransacaoDatabase.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Transacao were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all transacao.",
      });
    });
};

exports.deleteAllByAccountId = (req, res) => {

  // ID from HTTP request
  const idConta = req.params.idConta;

  TransacaoDatabase.deleteMany({idConta: idConta})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Transacao were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all transacao.",
      });
    });
};

// Get Saldo
exports.findAllApplySaldo = (req, res) => {

  // ID from HTTP request
  const id = req.params.id;

  TransacaoDatabase.aggregate(
    [
      {
        '$match': {
          'idConta': new db.mongoose.Types.ObjectId(id)
        }
      }, {
        '$group': {
          '_id': '$idConta', 
          'saldo': {
            '$sum': '$valor'
          }
        }
      }
    ]
  ).then((data) => {
      if (data.length == 0) {
        res.status(400).send({
          message: "Data not found.",
        });
      } else {
        res.send(data[0]);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving 'transacao'.",
      });
    });
};

// Get 'extrato' and it will return {date and amount}
exports.findAllByPeriod = (req, res) => {

  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // ID from HTTP request
  const id = req.params.id;
  // Body values
  const startDate = req.body.startDate;
  const endDate =  req.body.endDate;

  TransacaoDatabase.aggregate(
    [
      {
        '$match': {
          'createdAt': {
            '$gte': new Date(startDate), 
            '$lt': new Date(endDate)
          }
        }
      }, {
        '$project': {
          '_id': 0, 
          'valor': '$valor', 
          'dataTransacao': '$createdAt'
        }
      }
    ]
  ).then((data) => {
      if (data.length == 0) {
        res.status(400).send({
          message: "Data not found.",
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving 'transacao'.",
      });
    });
};
