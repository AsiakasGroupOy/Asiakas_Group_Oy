const express = require('express');
const { getAllCalls, createCall } = require('../controllers/callController');
const router = express.Router();

router.get('/', getAllCalls);
router.post('/', createCall);

module.exports = router;
