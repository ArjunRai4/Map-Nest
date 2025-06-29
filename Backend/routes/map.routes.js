const express = require('express');
const { getSafestPath, initMapSession } = require('../controllers/map.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/init',auth,initMapSession);
router.get('/safest-path', auth, getSafestPath);

module.exports = router;
