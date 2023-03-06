const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports = (mongoose) => {
    var schema = mongoose.Schema(
      {
        idConta: {
          type: Schema.Types.ObjectId,
          index: true,
          ref: 'conta',
          required: true
        },
        valor: {
          type: Schema.Types.Decimal128,
          required: true
        },
        dataTransacao: {
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
  
    const Transacao = mongoose.model("transacao", schema, "transacao"); // the third parameter is the table name
    return Transacao;
  };
  