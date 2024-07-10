const Task = require('../models/TasksEntry');

// Create a new task
exports.createTask = async (req, res) => {
    const { title, entry, checked } = req.body;
    try {
        const task = new Task({
            user: req.user.id,
            title,
            entry,
            checked: checked || false
        });
        console.log(task);
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error("Error saving task:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all tasks for the logged-in user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id });
        console.log("Tasks retrieved: ", tasks); // Log the tasks retrieved
        res.json(tasks);
    } catch (error) {
        console.error("Error retrieving tasks:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a task
exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, entry, checked } = req.body;
    try {
        const task = await Task.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { title, entry, checked },
            { new: true }
        );
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    try {
        const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted' });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};