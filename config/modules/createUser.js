const path = require('path');
const mongoose = require(path.resolve(__dirname, '..', '..', 'api', 'node_modules', 'mongoose'));
require('module-alias')({ base: path.resolve(__dirname, '..', '..', 'api') });
const { User } = require('@librechat/data-schemas').createModels(mongoose);
const { registerUser } = require('~/server/services/AuthService');

async function createUser({ email, password, name, username, emailVerified = true }) {
  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    throw new Error('A user with that email or username already exists');
  }
  const user = { email, password, name, username, confirm_password: password };
  const result = await registerUser(user, { emailVerified });
  if (result.status !== 200) {
    throw new Error(result.message);
  }
  const userCreated = await User.findOne({ $or: [{ email }, { username }] }).lean();
  return userCreated;
}

module.exports = { createUser };
