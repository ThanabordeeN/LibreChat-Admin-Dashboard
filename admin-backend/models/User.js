const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    emailVerified: { type: Boolean, default: true },
    name: { type: String },
    username: { type: String, unique: true, sparse: true, index: true },
    provider: { type: String, default: 'email' },
    password: { type: String },
    passwordVersion: { type: Number, default: () => Date.now() },
    termsAccepted: { type: Boolean, default: true },
    banned: { type: Boolean, default: false },
    banUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordVersion = Date.now();
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
