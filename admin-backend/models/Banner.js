const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    bannerId: { type: String, unique: true },
    message: { type: String, required: true },
    displayFrom: { type: Date, default: () => new Date() },
    displayTo: { type: Date },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
