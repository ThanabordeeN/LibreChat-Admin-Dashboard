const path = require('path');
const mongoose = require(path.resolve(__dirname, '..', '..', 'api', 'node_modules', 'mongoose'));
require('module-alias')({ base: path.resolve(__dirname, '..', '..', 'api') });
const { User } = require('@librechat/data-schemas').createModels(mongoose);
const banViolation = require('~/cache/banViolation');
const { ViolationTypes } = require('librechat-data-provider');

async function banUser(email, duration, req = {}, res = { clearCookie: () => {}, status(){return this;}, json(){return this;} }) {
  if (!email || !duration) {
    throw new Error('Email and duration are required');
  }
  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw new Error('No user with that email was found');
  }
  const errorMessage = {
    type: ViolationTypes.CONCURRENT,
    violation_count: 20,
    user_id: user._id,
    prev_count: 0,
    duration: duration,
  };
  await banViolation(req, res, errorMessage);
  return true;
}

module.exports = { banUser };
