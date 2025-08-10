const express = require('express');
const { v5: uuidv5 } = require('uuid');
const User = require('../models/User');
const Balance = require('../models/Balance');
const Banner = require('../models/Banner');
const Invite = require('../models/Invite');
const { listBalances, addBalance, setBalance } = require('../lib/balanceUtils');

const router = express.Router();

// Simple admin API key auth (header: x-admin-key). If ADMIN_API_KEY not set, allow all (dev mode) with warning.
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
router.use((req, res, next) => {
  if (!ADMIN_API_KEY) {
    if (!router.__warnedNoKey) {
      console.warn('[admin] ADMIN_API_KEY not set. Endpoints are unprotected.');
      router.__warnedNoKey = true;
    }
    return next();
  }
  if (req.headers['x-admin-key'] === ADMIN_API_KEY) return next();
  return res.status(401).json({ message: 'Unauthorized' });
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'email username name provider emailVerified createdAt banned banUntil');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { email, password, name, username, emailVerified = true } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ message: 'User exists' });
    const user = await User.create({ email, password, name, username, emailVerified });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user (limited fields)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, username, emailVerified } = req.body;
    const updates = {};
    if (email) updates.email = email;
    if (typeof name === 'string') updates.name = name;
    if (typeof username === 'string') updates.username = username;
    if (typeof emailVerified === 'boolean') updates.emailVerified = emailVerified;
    // uniqueness checks
    if (email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: id } });
      if (existingEmail) return res.status(409).json({ message: 'email already in use' });
    }
    if (username) {
      const existingUsername = await User.findOne({ username, _id: { $ne: id } });
      if (existingUsername) return res.status(409).json({ message: 'username already in use' });
    }
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Promise.all([
      Balance.deleteMany({ user: id }),
      Invite.deleteMany({ email: (await User.findById(id))?.email || '' }),
    ]);
    await User.findByIdAndDelete(id);
    res.json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { durationMinutes = 60 } = req.body;
    const banUntil = new Date(Date.now() + durationMinutes * 60000);
    const user = await User.findByIdAndUpdate(id, { banned: true, banUntil }, { new: true });
    if (!user) return res.status(404).json({ message: 'not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users/:id/unban', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { banned: false, banUntil: null }, { new: true });
    if (!user) return res.status(404).json({ message: 'not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ message: 'Password too short' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'not found' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'password reset' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users/reset-terms', async (req, res) => {
  try {
    const result = await User.updateMany({}, { $set: { termsAccepted: false } });
    res.json({ modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/balances', async (req, res) => {
  try {
    const balances = await listBalances(User);
    res.json(balances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/balances/:id/add', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (typeof amount !== 'number') return res.status(400).json({ message: 'amount number required' });
    if (!Number.isFinite(amount)) return res.status(400).json({ message: 'amount must be finite' });
    if (amount === 0) return res.status(400).json({ message: 'amount cannot be zero' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'user not found' });
    const balance = await addBalance({ userId: id, amount });
    res.json({ message: 'balance updated', balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/balances/:id/set', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    if (typeof amount !== 'number') return res.status(400).json({ message: 'amount number required' });
    if (!Number.isFinite(amount) || amount < 0) return res.status(400).json({ message: 'amount must be non-negative finite' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'user not found' });
    const balance = await setBalance({ userId: id, amount });
    res.json({ message: 'balance set', balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/user-stats', async (req, res) => {
  try {
    const users = await User.find({});
    const stats = users.map((u) => ({
      user: u.name || u.username || u.email,
      email: u.email,
      conversations: 0,
      messages: 0,
    }));
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/banner', async (req, res) => {
  try {
    const { message, displayFrom, displayTo, isPublic } = req.body;
    if (!message) return res.status(400).json({ message: 'message required' });
    const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
    const bannerId = uuidv5(message, NAMESPACE);
    let existing = await Banner.findOne();
    if (existing) {
      existing.message = message;
      existing.displayFrom = displayFrom ? new Date(displayFrom) : new Date();
      existing.displayTo = displayTo ? new Date(displayTo) : null;
      existing.isPublic = !!isPublic;
      existing.bannerId = bannerId;
      await existing.save();
      return res.json(existing);
    }
    const created = await Banner.create({
      message,
      displayFrom: displayFrom ? new Date(displayFrom) : new Date(),
      displayTo: displayTo ? new Date(displayTo) : null,
      isPublic: !!isPublic,
      bannerId,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current banner (singleton)
router.get('/banner', async (_req, res) => {
  try {
    const existing = await Banner.findOne();
    if (!existing) return res.status(404).json({ message: 'no banner' });
    res.json(existing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/banner', async (req, res) => {
  try {
    await Banner.deleteMany({});
    res.json({ message: 'banner removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/invite', async (req, res) => {
  try {
    const { email, role = 'user' } = req.body;
    if (!email) return res.status(400).json({ message: 'email required' });
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ message: 'invalid email' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'User already exists' });
    const existingInvite = await Invite.findOne({ email });
    if (existingInvite) {
      return res.status(200).json({
        message: 'invite already exists',
        inviteLink: `${process.env.DOMAIN_CLIENT || ''}/register?token=${existingInvite.token}`,
        invite: existingInvite,
      });
    }
    const token = uuidv5(email + Date.now(), uuidv5.URL);
    const invite = await Invite.create({ email, role, token });
    res.status(201).json({ inviteLink: `${process.env.DOMAIN_CLIENT || ''}/register?token=${token}`, invite });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Health check
router.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

module.exports = router;
