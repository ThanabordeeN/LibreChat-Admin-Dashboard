const path = require('path');
const mongoose = require(path.resolve(__dirname, '..', '..', 'api', 'node_modules', 'mongoose'));
const { v5: uuidv5 } = require('uuid');
require('module-alias')({ base: path.resolve(__dirname, '..', '..', 'api') });
const { Banner } = require('@librechat/data-schemas').createModels(mongoose);

async function updateBanner({ displayFrom, displayTo, message, isPublic }) {
  if (!message || message.trim() === '') {
    throw new Error('Message cannot be empty');
  }
  const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const bannerId = uuidv5(message, NAMESPACE);
  let result;
  const existingBanner = await Banner.findOne();
  if (existingBanner) {
    result = await Banner.findByIdAndUpdate(
      existingBanner._id,
      { displayFrom, displayTo, message, bannerId, isPublic },
      { new: true }
    );
  } else {
    result = await Banner.create({ displayFrom, displayTo, message, bannerId, isPublic });
  }
  return result;
}

module.exports = { updateBanner };
