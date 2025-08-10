const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenType: { type: String, enum: ['credits'], default: 'credits' },
    context: { type: String, default: 'admin' },
    rawAmount: { type: Number, required: true },
    balanceAfter: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
