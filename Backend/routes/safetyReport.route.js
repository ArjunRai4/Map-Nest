const express = require('express');
const auth = require('../middleware/auth');
const { createReport, getNearbyReports } = require('../controllers/safetyReport.controller');
const router = express.Router();

router.post('/',auth,createReport);
router.get('/nearby',getNearbyReports);

module.exports=router;