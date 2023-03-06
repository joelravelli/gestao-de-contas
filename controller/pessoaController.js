const db = require("../database/appDatabase");
const PessoaDatabase = db.pessoa;

// Create and Save a new Pessoa
exports.insert = (req, res) => {
  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // Create a Pessoa
  var pessoaDatabase = new PessoaDatabase({
    nome: req.body.nome,
    cpf: req.body.cpf,
    dataNascimento: req.body.dataNascimento,
  });

  // Save Pessoa in the database
  pessoaDatabase
    .save(pessoaDatabase)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Pessoa.",
      });
    });
};

// Retrieve all Pessoa from the database.
exports.findAll = (req, res) => {
  PessoaDatabase.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving pessoa.",
      });
    });
};

// Find a single Pessoa with an id
exports.findOne = (req, res) => {
  // ID from HTTP request
  const id = req.params.id;
  // Retrieve a Pessoa from the database.
  PessoaDatabase.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found Conta with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: "Error retrieving Conta with id=" + id });
    });
};

// Update a Pessoa by the id in the request
exports.update = (req, res) => {
  //Validate body request
  if (JSON.stringify(req.body).trim() == "{}") {
    res.status(400).send({ message: "Content can not be empty!" });
    return;
  }

  // ID from HTTP request
  const id = req.params.id;

  PessoaDatabase.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot update Pessoa with id=${id}. Maybe Pessoa was not found!`,
        });
      } else res.send({ message: "Pessoa was updated successfully." });
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating Pessoa with id=" + id,
      });
    });
};

// Delete a Pessoa with the specified id in the request
exports.delete = (req, res) => {
  // ID from HTTP request
  const id = req.params.id;
  PessoaDatabase.findByIdAndRemove(id, { useFindAndModify: false })
    .then((data) => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Pessoa with id=${id}. Maybe Pessoa was not found!`,
        });
      } else {
        res.send({
          message: "Pessoa was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete Pessoa with id=" + id,
      });
    });
};

// Delete all Pessoas from the database.
exports.deleteAll = (req, res) => {
  PessoaDatabase.deleteMany({})
    .then((data) => {
      res.send({
        message: `${data.deletedCount} Pessoas were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all pessoas.",
      });
    });
};
