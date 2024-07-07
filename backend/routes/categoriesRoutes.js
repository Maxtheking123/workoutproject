const express = require('express');
const { createEntry, getEntries, updateEntry, deleteEntry } = require('../controllers/categoriesController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/entries', auth, createEntry);
router.get('/entries', auth, getEntries);
router.put('/entries/:id', auth, updateEntry);
router.delete('/entries/:id', auth, deleteEntry);

module.exports = router;