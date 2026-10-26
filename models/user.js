const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: '/images/default-avatar.png' }
});


//encriptar password
UserSchema.pre('save', async function (next) {  //middleware que ocorre antes de um save()
  if (!this.isModified('password')) return next();  //evitar dupla encriptação caso a password seja mudada
  this.password = await bcrypt.hash(this.password, 10);//encriptaçao da password
  next();
});

module.exports = mongoose.model('User', UserSchema);