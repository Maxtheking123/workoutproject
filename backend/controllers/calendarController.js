const CalendarEntry = require('../models/CalendarEntry');

// Create a new calendar entry
exports.createEntry = async (req, res) => {
    const { title, description, date } = req.body;
    try {
        const entry = new CalendarEntry({
            user: req.user.id,
            title,
            description,
            date
        });
        await entry.save();
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all calendar entries for the logged-in user
exports.getEntries = async (req, res) => {
    try {
        const entries = await CalendarEntry.find({ user: req.user.id });
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a calendar entry
exports.updateEntry = async (req, res) => {
    const { id } = req.params;
    const { title, description, date } = req.body;
    try {
        const entry = await CalendarEntry.findOneAndUpdate(
            { _id: id, user: req.user.id },
            { title, description, date },
            { new: true }
        );
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.json(entry);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a calendar entry
exports.deleteEntry = async (req, res) => {
    const { id } = req.params;
    try {
        const entry = await CalendarEntry.findOneAndDelete({ _id: id, user: req.user.id });
        if (!entry) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.json({ message: 'Entry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};