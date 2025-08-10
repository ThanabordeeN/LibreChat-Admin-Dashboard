const mongoose = require('mongoose');

const BalanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenCredits: { type: Number, default: 0 },
});

module.exports = mongoose.models.Balance || mongoose.model('Balance', BalanceSchema);
