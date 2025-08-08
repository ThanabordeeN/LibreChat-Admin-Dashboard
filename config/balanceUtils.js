const listBalances = async ({ User, Balance }) => {
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
};

const addBalance = async ({ userId, amount, createTransaction }) => {
  return await createTransaction({
    user: userId,
    tokenType: 'credits',
    context: 'admin',
    rawAmount: +amount,
  });
};

const setBalance = async ({ userId, amount, Balance }) => {
  return await Balance.findOneAndUpdate(
    { user: userId },
    { tokenCredits: amount },
    { upsert: true, new: true },
  ).lean();
};

module.exports = {
  listBalances,
  addBalance,
  setBalance,
};

