/**
 * @file sessions.js
 * @description Routes REST pour les sessions collaboratives.
 */

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', sessionController.getSessions);
router.post('/', sessionController.createSession);
router.post('/:id/join', sessionController.joinSession);
router.post('/:id/rate', sessionController.rateSession);

module.exports = router;
