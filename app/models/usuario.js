const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//esquema solicitado en la consigna //
const usuarioSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true },
});

usuarioSchema.pre('save', async function (next) {
  const usuario = this;

  if (usuario.isModified('password') || usuario.isNew) {
    try {
      const hash = await bcrypt.hash(usuario.password, 10);
      usuario.password = hash;
    } catch (error) {
      return next(error);
    }
  }

  return next();
});
//modelo solicitado en la consigna //
const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;