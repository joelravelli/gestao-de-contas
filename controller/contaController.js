const db = require("../database/appDatabase");
const ContaDatabase = db.conta;
const contaService = require('../service/contaService')

// Create and Save a new Conta
exports.insert = (req, res) => {
  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Conta
  var contaDatabase = new ContaDatabase({
    idPessoa: req.body.idPessoa,
    saldo: 0.0,
    limiteSaqueDiario: req.body.limiteSaqueDiario,
    flagAtivo: req.body.flagAtivo,
    tipoConta: req.body.tipoConta,
    dataCriacao: new Date()
  });

  // Save Conta in the database
  contaDatabase
    .save(contaDatabase)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Conta.",
      });
    });
};

// Create and Save a new Conta
exports.create = async (req, res) => {
  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Conta
  var contaDatabase = new ContaDatabase({
    idPessoa: req.body.idPessoa,
    saldo: 0.0,
    limiteSaqueDiario: req.body.limiteSaqueDiario,
    flagAtivo: req.body.flagAtivo,
    tipoConta: req.body.tipoConta,
    dataCriacao: new Date()
  });

  try {
    const updateSaldo = await contaService.createAccount(contaDatabase);
    if (updateSaldo.hasError) {
      res.status(500).send({ message: updateSaldo.errorMsg});
    } else {
      res.send(updateSaldo.account);
    }
    return;
  } catch {
    res.status(500).send({ message: "Some error occurred while creating the Conta" });
    return;
  }

};

// Retrieve all Conta from the database.
exports.findAll = (req, res) => {
  ContaDatabase.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving Conta.",
      });
    });
};

// Find a single Conta with an id
exports.findOne = (req, res) => {
  // ID from HTTP request
  const id = req.params.id;
  // Retrieve a Conta from the database.
  ContaDatabase.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Conta with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving Conta with id=" + id });
    });
};

// Update a Conta by the id in the request
exports.update = (req, res) => {
  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // ID from HTTP request
  const id = req.params.id;

  ContaDatabase.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Conta with id=${id}. Maybe Conta was not found!`,
        });
      } else res.send({ message: "Conta was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Conta with id=" + id,
      });
    });
};

// Delete a Conta with the specified id in the request
exports.delete = (req, res) => {
  // ID from HTTP request
  const id = req.params.id;
  ContaDatabase.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Conta with id=${id}. Maybe Conta was not found!`,
        });
      } else {
        res.send({
          message: "Conta was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Conta with id=" + id,
      });
    });
};

// Delete all Contas from the database.
exports.deleteAll = (req, res) => {
  ContaDatabase.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Contas were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all contas.",
      });
    });
};

// Create and Save a new Transacao
exports.blockAccount = async (req, res) => {
  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }
  
  try {
    if (JSON.stringify(req.body.flagAtivo).trim() == "") {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    } 
  } catch {
    res.status(500).send({ message: "Could not found the propertie 'flagAtivo'." });
    return;
  }

  // ID from HTTP request
  const id = req.params.id;

  try {
    const updateSaldo = await contaService.blockAccount(id, req.body.flagAtivo);
    if (updateSaldo.hasError) {
      res.status(500).send({ message: updateSaldo.errorMsg});
    } else {
      res.send({ message: "ok"});
    }
    return;
  } catch {
    res.status(500).send({ message: "Some error occurred while updating the Conta [3]" });
    return;
  }
};