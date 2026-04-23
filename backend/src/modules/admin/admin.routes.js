const express = require('express');
const router = express.Router();
const { getMedecins, valider, suspendre, getStats } = require('./admin.controller');
const { verifierToken } = require('../../middlewares/auth.middleware');
const { verifierRole } = require('../../middlewares/role.middleware');

router.use(verifierToken);
router.use(verifierRole('ADMIN'));

router.get('/medecins', getMedecins);
router.put('/medecins/:id/valider', valider);
router.put('/medecins/:id/suspendre', suspendre);
router.get('/stats', getStats);

module.exports = router;