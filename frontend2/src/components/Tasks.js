import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../css/Tasks.css';
import { useParams } from 'react-router-dom';
import { getAndSaveLocalData } from "../utils/getAndSaveLocalData";

const Tasks = () => {
    const { id } = useParams();
    const { updateEntriesFromDatabase, getLocalData, addCategoryGlobal, addTaskGlobal, addCalendarEntryGlobal, updateCalendarEntryGlobal, updateTaskGlobal, deleteCalendarEntryGlobal, deleteCategoryGlobal, deleteTaskGlobal } = getAndSaveLocalData();
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [checked, setChecked] = useState(false);
    const [categoryTitle, setCategoryTitle] = useState('');
    const [completedTasks, setCompletedTasks] = useState(0);
    const [categoryColor, setCategoryColor] = useState('');
    const [totalTasks, setTotalTasks] = useState(0);
    const [showNewTaskInput, setShowNewTaskInput] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState('');
    const newTaskInputRef = useRef(null);
    const editingTaskInputRef = useRef(null);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                const localData = getLocalData();
                const userEntries = localData.calendarEntries;
                const userCategories = localData.categoryEntries;
                const userTasks = localData.Tasks;
                console.log('userEntries:', userEntries);
                console.log('userCategories:', userCategories);
                console.log('userTasks:', userTasks);
                const entry = userEntries.find((entry) => entry._id === id);
                const category = userCategories.find((category) => category._id === entry.category);

                const filteredTasks = userTasks.filter((task) => task.entry === id);
                setCompletedTasks(filteredTasks.filter((task) => task.checked).length);
                setTotalTasks(filteredTasks.length);

                setCategoryTitle(category.title);
                setCategoryColor(category.color);

                const barHeader = document.querySelector("#barHeader");
                barHeader.textContent = category.title;
                barHeader.style.color = category.color;

                updateBar(category.color, filteredTasks.filter((task) => task.checked).length, filteredTasks.length, category.title);

                if (Array.isArray(filteredTasks)) {
                    setTasks(filteredTasks);
                } else {
                    console.error('Expected an array of tasks, received:', filteredTasks);
                }
            } catch (error) {
                console.error('Error loading tasks:', error);
            }
        };
        loadTasks();
    }, [id]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (title) {
            try {
                const newTask = await addTaskGlobal({ title, entry: id, checked });
                console.log("New task added: ", newTask);
                const updatedTasks = [...tasks, newTask];
                setTasks(updatedTasks);
                setTitle('');
                setChecked(false);
                setTotalTasks(updatedTasks.length);
                updateBar(categoryColor, completedTasks, updatedTasks.length, categoryTitle);
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    };

    const handleUpdateTask = async (taskId, title, entry, checked) => {
        try {
            console.log('taskId:', taskId);
            // Optimistically update UI
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? { ...task, title, entry, checked } : task
                )
            );
            // Update the progress bar
            const checkboxElements = document.querySelectorAll('input[type="checkbox"]');
            const completed = Array.from(checkboxElements).filter((checkbox) => checkbox.checked).length;
            setCompletedTasks(completed);

            updateBar(categoryColor, completed, totalTasks, categoryTitle);
            // Await the async update operation
            const updatedTask = await updateTaskGlobal(taskId, { title, entry, checked });
            console.log("Task updated: ", taskId, { title, entry, checked });

            // Ensure UI matches the final updated task from the server
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? updatedTask : task
                )
            );
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert optimistic update in case of error
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === taskId ? { ...task, title, entry, checked: !checked } : task
                )
            );
        }
    };

    const updateBar = (color, completed, total, categoryTitle) => {
        const barFill = document.querySelector("#barFill");
        barFill.style.background = color || categoryColor;
        barFill.style.width = `calc(100% * (${completed} / ${total || totalTasks}))`;
    };

    const handleClickOutside = (e) => {
        if (newTaskInputRef.current && !newTaskInputRef.current.contains(e.target)) {
            if (title.trim() === '') {
                setTitle('');
                setShowNewTaskInput(false);
            } else {
                handleAddTask(e);
                setShowNewTaskInput(false);
            }
        }
        if (editingTaskInputRef.current && !editingTaskInputRef.current.contains(e.target)) {
            if (editingTaskTitle.trim() === '') {
                handleDeleteTask(editingTaskId);
            } else {
                handleUpdateTask(editingTaskId, editingTaskTitle, id, tasks.find(task => task._id === editingTaskId).checked);
            }
            setEditingTaskId(null);
            setEditingTaskTitle('');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTaskGlobal(taskId);
            const updatedTasks = tasks.filter(task => task._id !== taskId);
            setTasks(updatedTasks);
            setTotalTasks(updatedTasks.length);
            updateBar(categoryColor, completedTasks, updatedTasks.length, categoryTitle);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [title, editingTaskTitle]);

    return (
        <div className="PageContainer">
            <div id="topContainer">
                <div id="backButtonContainer" onClick={() => document.location.href = '/'}>
                    <div id="backIcon"></div>
                    <p>Start</p>
                </div>
                <div id="barContainer">
                    <div id="barTextContainer">
                        <div id="barHeader">{categoryTitle}</div>
                        <div id="barNumbers">{completedTasks}/{totalTasks}</div>
                    </div>
                    <div id="barBackground">
                        <div id="barFill"></div>
                    </div>
                </div>
            </div>
            <div>
                {tasks.length > 0 ? (
                    tasks.map((task) => (
                        <div className="taskContainer" key={task._id}>
                            <label className="control control-checkbox">
                                <input
                                    type="checkbox"
                                    checked={task.checked}
                                    onChange={(e) => handleUpdateTask(task._id, task.title, task.entry, e.target.checked)}
                                />
                                <div className="control_indicator"></div>
                            </label>
                            {editingTaskId === task._id ? (
                                <input
                                    type="text"
                                    value={editingTaskTitle}
                                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                                    ref={editingTaskInputRef}
                                    autoFocus
                                    className="taskTitleInput"
                                />
                            ) : (
                                <p
                                    className="taskTitle"
                                    onClick={() => {
                                        setEditingTaskId(task._id);
                                        setEditingTaskTitle(task.title);
                                    }}
                                >
                                    {task.title}
                                </p>
                            )}
                        </div>
                    ))
                ) : (
                    <div>No tasks available</div>
                )}
                {showNewTaskInput && (
                    <div className="taskContainer" ref={newTaskInputRef}>
                        <label className="control control-checkbox">
                            <input
                                type="checkbox"
                                disabled
                            />
                            <div className="control_indicator"></div>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Task Title"
                            autoFocus
                            className="taskTitleInput"
                        />
                    </div>
                )}
            </div>
            <div id="footer">
                <div id="addTaskContainer" onClick={() => setShowNewTaskInput(true)}>
                    <p>New Task</p>
                </div>
            </div>
        </div>
    );
}

export default Tasks;