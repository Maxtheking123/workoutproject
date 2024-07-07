const CategoriesEntry = require('../models/CategoriesEntry');

// Create a new category entry
exports.createEntry = async (req, res) => {
    const { title, color } = req.body;
    try {
        const entry = new CategoriesEntry({
            user: req.user.id,
            title,
            color
        });
        console.log(entry)
        await entry.save();
        res.status(201).json(entry);
    } catch (error) {
        console.error("Error saving category entry:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all category entries for the logged-in user
exports.getEntries = async (req, res) => {
    try {
        const entries = await CategoriesEntry.find({ user: req.user.id });
        res.json(entries);
    } catch (error) {
        console.error("Error retrieving category entries:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a category entry
exports.updateEntry = async (req, res) => {
    const { id } = req.params;
    const { title, color } = req.body;
    try {
        const entry = await CategoriesEntry.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { title, color },
            { new: true }
        );
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.json(entry);
    } catch (error) {
        console.error("Error updating category entry:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a category entry
exports.deleteEntry = async (req, res) => {
    const { id } = req.params;
    try {
        const entry = await CategoriesEntry.findOneAndDelete({ _id: id, user: req.user.id });
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        console.error("Error deleting category entry:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};