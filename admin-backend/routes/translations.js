const express = require('express');
const Translation = require('../models/Translation');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const translations = await Translation.find({});
    res.json(translations);
  } catch (error) {
    console.error('Error fetching translations:', error);
    res.status(500).json({ message: 'Failed to fetch translations' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newTranslation = new Translation(req.body);
    await newTranslation.save();
    res.status(201).json(newTranslation);
  } catch (error) {
    console.error('Error creating translation:', error);
    res.status(500).json({ message: 'Failed to create translation' });
  }
});

module.exports = router;
