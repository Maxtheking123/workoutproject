const express = require('express');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/entries', auth, createTask);
router.get('/entries', auth, getTasks);
router.put('/entries/:id', auth, updateTask);
router.delete('/entries/:id', auth, deleteTask);

module.exports = router;