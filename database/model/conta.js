const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
      {
        idPessoa: {
          type: Schema.Types.ObjectId,
          ref: 'pessoa',
          required: true
        },
        saldo: {
          type: Schema.Types.Decimal128,
          required: true
        },
        limiteSaqueDiario: {
          type: Schema.Types.Decimal128,
          required: true
        },
        flagAtivo: {
          type: Boolean,
          default: true
        },
        tipoConta: {
          type: Number,
          required: true,
          enum: [0, 1]
        },
        dataCriacao: {
          type: Date,
          require: true,
        }
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function () {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const Conta = mongoose.model("conta", schema, "conta"); // the third parameter is the table name
    return Conta;
  };
  