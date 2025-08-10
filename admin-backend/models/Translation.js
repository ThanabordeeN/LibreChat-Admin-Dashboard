const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  en: { type: String, required: true },
  es: { type: String },
  fr: { type: String },
});

module.exports = mongoose.models.Translation || mongoose.model('Translation', TranslationSchema);
