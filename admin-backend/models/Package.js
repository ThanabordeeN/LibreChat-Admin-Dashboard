const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credits: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
});

module.exports = mongoose.models.Package || mongoose.model('Package', PackageSchema);
