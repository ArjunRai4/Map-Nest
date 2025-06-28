const express = require('express');
const router = express.Router();
const { suggestSafeRoute } = require('../controllers/route.controller');

router.get('/safe', suggestSafeRoute);

module.exports = router;
