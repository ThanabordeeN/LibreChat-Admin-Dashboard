const Balance = require('../models/Balance');
const Transaction = require('../models/Transaction');

async function listBalances(User) {
  const users = await User.find({});
  const balances = [];
  for (const user of users) {
    const balance = await Balance.findOne({ user: user._id });
    balances.push({
      id: user._id,
      email: user.email,
      balance: balance ? balance.tokenCredits : 0,
    });
  }
  return balances;
}

async function addBalance({ userId, amount }) {
  const balanceDoc = await Balance.findOneAndUpdate(
    { user: userId },
    { $inc: { tokenCredits: amount } },
    { upsert: true, new: true }
  );
  await Transaction.create({ user: userId, rawAmount: amount, balanceAfter: balanceDoc.tokenCredits });
  return balanceDoc;
}

async function setBalance({ userId, amount }) {
  const balanceDoc = await Balance.findOneAndUpdate(
    { user: userId },
    { tokenCredits: amount },
    { upsert: true, new: true }
  );
  await Transaction.create({ user: userId, rawAmount: 0, balanceAfter: balanceDoc.tokenCredits });
  return balanceDoc;
}

module.exports = { listBalances, addBalance, setBalance };
