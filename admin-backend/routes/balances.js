const express = require('express');
const Balance = require('../models/Balance');
const User = require('../models/User');

const router = express.Router();

// Helper function to get all balances
async function getAllBalances() {
  const users = await User.find({});
  const balances = [];
  for (const user of users) {
    let balance = await Balance.findOne({ user: user._id });

    balances.push({
      id: user._id,
      email: user.email,
      balance: balance ? balance.tokenCredits : null,
    });
  }
  return balances;
}

router.get('/', async (req, res) => {
  try {
    const balances = await getAllBalances();
    res.json(balances);
  } catch (error) {
    console.error('Error fetching balances:', error);
    res.status(500).json({ message: 'Failed to fetch balances' });
  }
});

module.exports = router;
