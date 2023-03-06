module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      nome: {
        type: String,
        default: true,
        maxlength: 50,
        minlength: 10
      },
      cpf: {
        type: String,
        default: true,
        maxlength: 11,
        minlength: 11
      },
      dataNascimento: {
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

  const Pessoa = mongoose.model("pessoa", schema, "pessoa"); // the third parameter is the table name
  return Pessoa;
};
