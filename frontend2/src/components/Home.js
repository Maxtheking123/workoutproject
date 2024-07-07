import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from "../context/AuthContext";
import { parseISO, addDays, startOfDay, endOfDay, format } from 'date-fns';
import checkIcon from '../images/checkIcon.svg';
import calendarSvg from "../images/calender.svg";
import backIcon from "../images/backArrow.svg";

const Home = () => {
    const { fetchCalendarEntries, addCalendarEntry, updateCalendarEntry, deleteCalendarEntry, categories, addCategory } = useContext(AuthContext);
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({ title: '', description: '', date: '', category: '' });
    const [newCategory, setNewCategory] = useState({ title: '', color: '#F88D2B' });
    const [editingEntry, setEditingEntry] = useState(null);
    const [draggedEntry, setDraggedEntry] = useState(null);
    const entryRefs = useRef({});

    const daysForward = 6;

    useEffect(() => {
        const getEntries = async () => {
            const fetchedEntries = await fetchCalendarEntries();
            setEntries(fetchedEntries);
        };

        getEntries();
    }, [fetchCalendarEntries]);

    const updateSelectedCategory = (event) => {
        var checkbox = ""
        const checkboxIcons = document.querySelectorAll('.checkboxIcon');
        for (let i = 0; i < checkboxIcons.length; i++) {
            if (checkboxIcons[i].style.opacity === "1") {
                checkbox = checkboxIcons[i];
            }
        }
        const checkboxContainer = checkbox.closest('.subcontainer');


        selectCategory.querySelector(".categoryColor").style.backgroundColor = selectCategory.querySelector(".categoryColor").style.backgroundColor;
        selectCategory.querySelector(".categoryHeader").innerHTML = "Category";
        selectCategory.querySelector(".categoryTitle").innerHTML = selectCategory.querySelector(".categoryTitle").innerHTML;
    }

    useEffect(() => {
        const selectCategory = document.getElementById('selectCategory');
        const allCheckboxes = document.querySelectorAll('.checkboxIcon');
        if (allCheckboxes.length > 0) {
            allCheckboxes.forEach((checkbox, index) => {
                checkbox.style.opacity = index === 0 ? 1 : 0;
            });
            selectCategory.querySelector(".categoryColor").style.backgroundColor = categories[0].color;
            selectCategory.querySelector(".categoryHeader").innerHTML = "Category";
            selectCategory.querySelector(".categoryTitle").innerHTML = categories[0].title;
        }
        else {
            console.log('No checkboxes found');
            selectCategory.querySelector(".categoryColor").style.backgroundColor = "#373737";
            selectCategory.querySelector(".categoryHeader").innerHTML = "";
            selectCategory.querySelector(".categoryTitle").innerHTML = "No categories found";
        }
    }, [categories]);

    const handleAddEntry = async (e) => {
        e.preventDefault();
        const addedEntry = await addCalendarEntry(newEntry);
        setEntries([...entries, addedEntry]);
        setNewEntry({ title: '', description: '', date: '', category: '' });
        cancel();
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

    const handleAddCategory = async (e) => {
        e.preventDefault();
        closeCreateCategory();
        const addedCategory = await addCategory(newCategory);
        setNewCategory({ title: '', color: '#F88D2B' }); // Reset color to default after adding
    };

    const cancel = () => {
        const panel = document.querySelector('.background');
        if (panel) panel.classList.remove('show');
        const addSessionBackground = document.querySelector('.addSessionBackground');
        if (addSessionBackground) addSessionBackground.classList.remove('show');
        setNewEntry({ title: '', description: '', date: '', category: '' });
        setEditingEntry(null);
    };

    const onDragStart = (e, entry) => {
        setDraggedEntry(entry);
        const element = e.currentTarget;
        setTimeout(() => element.classList.add("dragging"), 0);
        e.dataTransfer.setData("entry", JSON.stringify(entry));
        console.log('Dragging entry:', entry);
    };

    const onDragEnd = (e) => {
        const element = e.currentTarget;
        element.classList.remove("dragging");
        const eventContainers = document.querySelectorAll('.eventContainer');

        eventContainers.forEach(container => container.classList.remove('dragging'));
        eventContainers.forEach(container => container.style.display = 'block');
        const dummyEvent = document.getElementById('dummyEvent');
        dummyEvent.style.display = 'none';
        setDraggedEntry(null);
    }

    const onDragOver = (e, entry) => {
        e.preventDefault();
        const dummyEvent = document.getElementById('dummyEvent');
        dummyEvent.style.display = 'block';
        const element = e.currentTarget;

        const siblings = element.parentElement.children;
        let opacityZero = false;
        for (let i = 0; i < siblings.length; i++) {
            if (siblings[i].classList.contains("dragging")) {
                siblings[i].style.display = 'none';
                opacityZero = true;
            }
        }
        if (!opacityZero) {
            element.style.display = 'block';
        }

        const rect = element.getBoundingClientRect();
        const y = e.clientY - rect.top;
        // check if its the header
        if (element.classList.contains('dayHeader')) {
            if (y > (rect.height / 2)) {
            element.insertAdjacentElement('afterend', dummyEvent);
            }
        }
        else {
            if (y > rect.height / 2) {
            element.insertAdjacentElement('afterend', dummyEvent);
        } else {
            element.insertAdjacentElement('beforebegin', dummyEvent);
        }
        }
    }

    const onDrop = async (e) => {
        e.preventDefault();
        const draggedEntry = JSON.parse(e.dataTransfer.getData("entry"));
        console.log('Dropped entry:', draggedEntry);
            const droppedDayContainer = e.currentTarget.closest('.dayContainer');
    console.log('Dropped day container:', droppedDayContainer);

    const draggingElement = document.querySelector('.dragging');
    const startingDayContainer = draggingElement ? draggingElement.closest('.dayContainer') : null;
    console.log('Starting day container:', startingDayContainer);

    if (droppedDayContainer && startingDayContainer) {
        draggingElement.classList.remove('dragging');
        const dummyEvent = document.getElementById('dummyEvent');
        dummyEvent.style.display = 'none';

        const siblings = droppedDayContainer.children;
        for (let i = 0; i < siblings.length; i++) {
            siblings[i].style.display = 'block';
        }

        const newDate = droppedDayContainer.getAttribute('data-date');
        console.log('New date:', newDate);

        const updatedEntry = { ...draggedEntry, date: newDate };
        console.log('Updated entry:', updatedEntry);

        await updateCalendarEntry(draggedEntry._id, updatedEntry);
        setEntries(entries.map(e => (e._id === draggedEntry._id ? updatedEntry : e)));
    }
};

const today = startOfDay(new Date());
const endDate = endOfDay(addDays(today, daysForward));

const filteredEntries = entries.filter(entry => {
    const entryDate = parseISO(entry.date);
    return entryDate >= today && entryDate <= endDate;
});

const generateWeekDays = () => {
    const weekDays = [];
    for (let i = 0; i <= daysForward; i++) {
        const day = addDays(today, i);
        weekDays.push({
            date: day,
            label: format(day, 'EEEE')
        });
    }
    return weekDays;
};

const weekDays = generateWeekDays();

const groupedEntries = weekDays.map(day => ({
    ...day,
    entries: filteredEntries.filter(entry => {
        const entryDate = parseISO(entry.date);
        return entryDate.toDateString() === day.date.toDateString();
    })
})).filter(day => day.entries.length > 0);

const openCategorySelection = () => {
    document.getElementById('selectCategoryPage').style.top = "0px"
}

const closeSelectCategory = () => {
    document.getElementById('selectCategoryPage').style.top = "100svh"
}

const setCategory = (event) => {
    //get the clicked categorys checkbox
    const allCheckboxes = document.querySelectorAll('.checkboxIcon');

    try {
        const subcontainer = event.target.closest('.subcontainer');

        const checkbox = subcontainer.querySelector('.checkboxIcon')

        console.log(checkbox);
        for (let i = 0; i < allCheckboxes.length; i++) {
            allCheckboxes[i].style.opacity = 0;
        }
        checkbox.style.opacity = 1;
    }
    catch (error) {
        console.log('No category clicked');
    }
}

const openCreateCategory = () => {
    document.getElementById('addCategoryForm').style.top = "0px";
}

const closeCreateCategory = () => {
    document.getElementById('addCategoryForm').style.top = "100vh";

}

const updateSelectedColor = (event) => {
    const selectedColor = event.target.getAttribute('data-color');
    setNewCategory(prevCategory => ({ ...prevCategory, color: selectedColor }));
    document.getElementById('selectedColor').value = selectedColor;
    const colorOptions = document.querySelectorAll('.color-option-container');
    colorOptions.forEach(option => option.classList.remove('selected'));
    // find nearest div with class color-option-container
    const parent = event.target.closest('.color-option-container');
    parent.classList.add('selected');
}


return (
    <div>
        <div
            id="dummyEvent"
            className="eventContainer"
            onDragOver={onDragOver}
            onDrop={onDrop}
        ></div>
        <div className="eventsContainer">
            {groupedEntries.length > 0 ? groupedEntries.map(day => (
                <div key={day.date.toISOString()} className="dayContainer hasEntries" data-date={day.date.toISOString()}>
                    <div className="dayHeader dayTitleClass"
                        onDragOver={(e) => onDragOver(e, draggedEntry)} // Use draggedEntry here
                        onDrop={(e) => onDrop(e)}
                    >{day.label}</div>
                    {day.entries.map(entry => (
                        <div
                            key={entry._id}
                            className="eventContainer"
                            draggable
                            ref={(el) => (entryRefs.current[entry._id] = el)}
                            onDragStart={(e) => onDragStart(e, entry)}
                            onDragEnd={onDragEnd}
                            onDragOver={(e) => onDragOver(e, entry)}
                            onDrop={(e) => onDrop(e)}
                            data-date={day.date.toISOString()}
                        >
                            <div className="eventHeaderTitle">{entry.title}</div>
                            <p className="eventDescription">{entry.description}</p>
                            <button className="deleteButton" onClick={() => handleDeleteEntry(entry._id)}>Delete</button>
                            <button className="editButton" onClick={() => handleEditEntry(entry)}>Edit</button>
                        </div>
                    ))}
                </div>
            )) : (
                <p>No events for the upcoming week.</p>
            )}
        </div>
        <div className="addSessionBackground">
            <form className="form" onSubmit={editingEntry ? handleUpdateEntry : handleAddEntry}>
                <div className="topButtons">
                    <button type="button" className="cancelButton" onClick={() => cancel()}>Cancel</button>
                    <p className="newSessionText">New Session</p>
                    <button className="submitButton" type="submit">{editingEntry ? 'Update' : 'Add'}</button>
                </div>
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
                <div className="date-input-container">
                    <input
                        type="date"
                        className="date-input"
                        value={editingEntry ? editingEntry.date : newEntry.date}
                        onChange={(e) => editingEntry
                            ? setEditingEntry({ ...editingEntry, date: e.target.value })
                            : setNewEntry({ ...newEntry, date: e.target.value })
                        }
                        required
                    />
                </div>
                <div id="selectCategory" onClick={openCategorySelection}>
                    <div className="categoryContainerColorHeader">
                        <div className="categoryColor"></div>
                        <div className="categoryHeader"></div>
                    </div>
                    <div className="categoryContainerTitleBack">
                        <p className="categoryTitle menyCategoryTitle"></p>
                        <div className="backIcon" style={{backgroundImage: `url(${backIcon})`}}></div>
                    </div>
                </div>
                {editingEntry && (
                    <button type="button" onClick={() => setEditingEntry(null)}>Cancel</button>
                )}
            </form>
            <div id="selectCategoryPage">
                <div id="selectCategoryContainer">
                    <div className="topButtons">
                        <div id="cancelContainer" onClick={closeSelectCategory}>
                            <div className="backIcon" style={{backgroundImage: `url(${backIcon})`}}></div>
                            <button type="button" className="cancelButton">Cancel</button>
                        </div>
                        <p className="newSessionText">Select Category</p>
                        <button className="submitButton" type="submit">{editingEntry ? 'Update' : 'Add'}</button>
                    </div>
                    <div id="categoryList" onClick={setCategory}>
                            {categories.map(category => (
                                <div key={category._id} className="categoryContainer">
                                    <div className="categoryColor" style={{backgroundColor: category.color}}></div>
                                    <div className="subcontainer">
                                        <p className="categoryTitle">{category.title}</p>
                                        <div className="checkboxIcon" style={{backgroundImage: `url(${checkIcon})`}}></div>
                                    </div>
                                </div>
                            ))}
                    </div>
                    <div className="bottomButtons">
                        <button type="button" className="newCategory" onClick={openCreateCategory}>New Category</button>
                    </div>
                </div>
            </div>
            <form className="form" id="addCategoryForm" onSubmit={handleAddCategory}>
                <div id="addCategoryFormContainer">
                    <div className="topButtons">
                        <button type="button" className="cancelButton" onClick={() => closeCreateCategory()}>Cancel
                        </button>
                        <p className="newSessionText">New Session</p>
                        <button className="submitButton" type="submit">Add</button>
                    </div>
                    <input
                        type="text"
                        id="categoryTitleInput"
                        placeholder="Category Title"
                        value={newCategory.title}
                        onChange={(e) => setNewCategory({...newCategory, title: e.target.value})}
                        required
                    />
                    <div id="color-picker-container">
                        <div className="color-picker">
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#F8E32B"}}
                                     data-color="#F8E32B"></div>
                            </div>
                            <div className="color-option-container selected" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#F88D2B"}}
                                     data-color="#F88D2B"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#F82B2B"}}
                                     data-color="#F82B2B"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#FF84BF"}}
                                     data-color="#FF84BF"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#E72BF8"}}
                                     data-color="#E72BF8"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#AA82FF"}}
                                     data-color="#AA82FF"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#CACACA"}}
                                     data-color="#CACACA"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#2B7DF8"}}
                                     data-color="#2B7DF8"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#73A8F6"}}
                                     data-color="#73A8F6"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#6FFFCB"}}
                                     data-color="#6FFFCB"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#2BF840"}}
                                     data-color="#2BF840"></div>
                            </div>
                            <div className="color-option-container" onClick={updateSelectedColor}>
                                <div className="color-option" style={{backgroundColor: "#1C890A"}}
                                     data-color="#1C890A"></div>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" name="selectedColor" id="selectedColor" value={newCategory.color}></input>
                </div>
            </form>
        </div>
    </div>
);
}

export default Home;