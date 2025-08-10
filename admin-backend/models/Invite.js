const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  token: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Invite || mongoose.model('Invite', InviteSchema);
