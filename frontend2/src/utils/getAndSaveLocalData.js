import {useContext} from "react";
import {AuthContext} from "../context/AuthContext";
import { v4 as uuidv4 } from 'uuid';

export const getAndSaveLocalData =  () => {
    const { fetchCalendarEntries, fetchCategoryEntries, fetchTasks, addCategory, addTask, addCalendarEntry, updateCalendarEntry, updateTask, deleteCalendarEntry, deleteCategory, deleteTask } = useContext(AuthContext);
    const updateEntriesFromDatabase = async (userID) => {
        const calenderEntries = await fetchCalendarEntries();
        const categoryEntries = await fetchCategoryEntries();
        const Tasks = await fetchTasks();
        localStorage.setItem('calendarEntries', JSON.stringify(calenderEntries));
        localStorage.setItem('categoryEntries', JSON.stringify(categoryEntries));
        localStorage.setItem('Tasks', JSON.stringify(Tasks));
    };
    const getLocalData = () => {
        const calendarEntries = JSON.parse(localStorage.getItem('calendarEntries'));
        const categoryEntries = JSON.parse(localStorage.getItem('categoryEntries'));
        const Tasks = JSON.parse(localStorage.getItem('Tasks'));
        console.log('calendarEntries exported:', calendarEntries);
        console.log('categoryEntries exported:', categoryEntries);
        console.log('Tasks exported:', Tasks);
        console.log("got local data")
        return { calendarEntries, categoryEntries, Tasks };
    };
    const addCategoryGlobal = async (category) => {
        const categoryEntries = getLocalData().categoryEntries || [];
        console.log("pre", categoryEntries);

        // Generate a unique ID
        const preID = uuidv4();
        console.log(category, preID);

        // Append the _id to the category object
        const tempCategory = { ...category, _id: preID };

        // Add the new category to the category entries
        categoryEntries.push(tempCategory);

        // Update local storage with the new category entries
        localStorage.setItem('categoryEntries', JSON.stringify(categoryEntries));

        // Await the addCategory function with the new category
        await addCategory(tempCategory);
    };
    const addTaskGlobal = async (task) => {
        const addTaskResponse = await addTask(task);
        console.log('task:', task);
        const Tasks = getLocalData().Tasks;
        Tasks.push(task);
        localStorage.setItem('Tasks', JSON.stringify(Tasks));
        return addTaskResponse;
    };
    const addCalendarEntryGlobal = async (entry) => {
        await addCalendarEntry(entry);
        const calendarEntries = getLocalData().calendarEntries;
        calendarEntries.push(entry);
        localStorage.setItem('calendarEntries', JSON.stringify(calendarEntries));
    };
    const updateCalendarEntryGlobal = async (id, entry) => {
        await updateCalendarEntry(id, entry);
        const calendarEntries = getLocalData().calendarEntries;
        const index = calendarEntries.findIndex((e) => e._id === id);
        calendarEntries[index] = entry;
        localStorage.setItem('calendarEntries', JSON.stringify(calendarEntries));
    };
    const updateTaskGlobal = async (id, entry) => {
        console.log('id:', id);
        console.log('entry:', entry);
        const updateTaskData = await updateTask(id, entry);
        const Tasks = getLocalData().Tasks;
        const index = Tasks.findIndex((e) => e._id === id);
        Tasks[index] = entry;
        localStorage.setItem('Tasks', JSON.stringify(Tasks));
        return updateTaskData;
    };
    const deleteCalendarEntryGlobal = async (id) => {
        await deleteCalendarEntry(id);
        const calendarEntries = getLocalData().calendarEntries;
        const index = calendarEntries.findIndex((e) => e._id === id);
        calendarEntries.splice(index, 1);
        localStorage.setItem('calendarEntries', JSON.stringify(calendarEntries));
    };
    const deleteCategoryGlobal = async (id) => {
        await deleteCategory(id);
        const categoryEntries = getLocalData().categoryEntries;
        const index = categoryEntries.findIndex((e) => e._id === id);
        categoryEntries.splice(index, 1);
        localStorage.setItem('categoryEntries', JSON.stringify(categoryEntries));
    };
    const deleteTaskGlobal = async (id) => {
        const deleteResponse = await deleteTask(id);
        const Tasks = getLocalData().Tasks;
        const index = Tasks.findIndex((e) => e._id === id);
        Tasks.splice(index, 1);
        localStorage.setItem('Tasks', JSON.stringify(Tasks));
        return deleteResponse;
    };
    return { updateEntriesFromDatabase, getLocalData, addCategoryGlobal, addTaskGlobal, addCalendarEntryGlobal, updateCalendarEntryGlobal, updateTaskGlobal, deleteCalendarEntryGlobal, deleteCategoryGlobal, deleteTaskGlobal };
}