const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  theme: { type: String, required: true },

  players: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ideas: [String]
  }],

  result: { type: mongoose.Schema.Types.Mixed, default: {} },

  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  loser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', sessionSchema);
