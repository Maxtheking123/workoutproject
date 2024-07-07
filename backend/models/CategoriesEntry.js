const mongoose = require('mongoose');

const CategoriesEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
console.log("fwd");
module.exports = mongoose.model('CategoriesEntry', CategoriesEntrySchema);