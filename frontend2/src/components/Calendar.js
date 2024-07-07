import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Calendar = () => {
    const { fetchCalendarEntries, addCalendarEntry, updateCalendarEntry, deleteCalendarEntry } = useContext(AuthContext);
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({ title: '', description: '', date: '' });
    const [editingEntry, setEditingEntry] = useState(null);

    useEffect(() => {
        const getEntries = async () => {
            const fetchedEntries = await fetchCalendarEntries();
            setEntries(fetchedEntries);
        };

        getEntries();
    }, [fetchCalendarEntries]);

    const handleAddEntry = async (e) => {
        e.preventDefault();
        const addedEntry = await addCalendarEntry(newEntry);
        setEntries([...entries, addedEntry]);
        setNewEntry({ title: '', description: '', date: '' });
    };

    const handleUpdateEntry = async (e) => {
        e.preventDefault();
        const updated = await updateCalendarEntry(editingEntry._id, editingEntry);
        setEntries(entries.map(entry => (entry._id === editingEntry._id ? updated : entry)));
        setEditingEntry(null);
    };

    const handleDeleteEntry = async (id) => {
        await deleteCalendarEntry(id);
        setEntries(entries.filter(entry => entry._id !== id));
    };

    const handleEditEntry = (entry) => {
        setEditingEntry(entry);
    };

    return (
        <div>
            <h1>Calendar</h1>
            <form onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}>
                <input
                    type="text"
                    placeholder="Title"
                    value={editingEntry ? editingEntry.title : newEntry.title}
                    onChange={(e) => editingEntry
                        ? setEditingEntry({ ...editingEntry, title: e.target.value })
                        : setNewEntry({ ...newEntry, title: e.target.value })
                    }
                    required
                />
                <input
                    type="text"
                    placeholder="Description"
                    value={editingEntry ? editingEntry.description : newEntry.description}
                    onChange={(e) => editingEntry
                        ? setEditingEntry({ ...editingEntry, description: e.target.value })
                        : setNewEntry({ ...newEntry, description: e.target.value })
                    }
                />
                <input
                    type="date"
                    value={editingEntry ? editingEntry.date : newEntry.date}
                    onChange={(e) => editingEntry
                        ? setEditingEntry({ ...editingEntry, date: e.target.value })
                        : setNewEntry({ ...newEntry, date: e.target.value })
                    }
                    required
                />
                <button type="submit">{editingEntry ? 'Update Entry' : 'Add Entry'}</button>
                {editingEntry && (
                    <button type="button" onClick={() => setEditingEntry(null)}>Cancel</button>
                )}
            </form>

            <div>
                {entries.map(entry => (
                    <div key={entry._id} style={{ border: '1px solid black', margin: '10px', padding: '10px' }}>
                        <h2>{entry.title}</h2>
                        <p>{entry.description}</p>
                        <p>{new Date(entry.date).toLocaleDateString()}</p>
                        <button onClick={() => handleEditEntry(entry)}>Edit</button>
                        <button onClick={() => handleDeleteEntry(entry._id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;