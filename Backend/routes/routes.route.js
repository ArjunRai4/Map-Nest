const express = require('express');
const router = express.Router();
const { suggestSafeRoute, getSafestRoute } = require('../controllers/route.controller');

router.get('/safe', suggestSafeRoute);
router.get('/safest-path', getSafestRoute);

module.exports = router;
