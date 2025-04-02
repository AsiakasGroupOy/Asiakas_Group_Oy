const Call = require('../models/Call');

// Fetch all calls
exports.getAllCalls = async (req, res) => {
  try {
    const calls = await Call.findAll();
    res.status(200).json(calls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new call
exports.createCall = async (req, res) => {
  try {
    const newCall = await Call.create(req.body);
    res.status(201).json(newCall);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
