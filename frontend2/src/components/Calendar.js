import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../css/Calendar.css';
import backIcon from '../images/backArrow.svg';
import { getAndSaveLocalData } from "../utils/getAndSaveLocalData";

const Calendar = () => {
    const { updateEntriesFromDatabase, getLocalData, addCategoryGlobal, addTaskGlobal, addCalendarEntryGlobal, updateCalendarEntryGlobal, updateTaskGlobal, deleteCalendarEntryGlobal, deleteCategoryGlobal, deleteTaskGlobal } = getAndSaveLocalData();
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        populateCalendar(currentMonth, currentYear);
    }, [currentMonth, currentYear]);

    useEffect(() => {
        updateConicGradients(currentMonth, currentYear);
    }, [daysInMonth]);

    const populateCalendar = (month, year) => {
    const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Adjust to make Monday the first day of the week
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

    let daysArray = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        daysArray.push(null);
    }
    for (let i = 1; i <= daysInCurrentMonth; i++) {
        daysArray.push(i);
    }

    setDaysInMonth(daysArray);
};

    const updateConicGradients = async (month, year) => {
        try {
            const calendarEntries = await getLocalData().calendarEntries;

            if (!Array.isArray(calendarEntries)) {
                console.error('calendarEntries is not an array:', calendarEntries);
                return;
            }

            const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
            const categorysThatDay = [];

            for (let i = 0; i < daysInCurrentMonth; i++) {
                const date = new Date(year, month, i + 1);
                const entriesThatDay = calendarEntries.filter(entry => {
                    const entryDate = new Date(entry.date);
                    return entryDate.getDate() === date.getDate() &&
                           entryDate.getMonth() === date.getMonth() &&
                           entryDate.getFullYear() === date.getFullYear();
                });
                const categoriesForDay = entriesThatDay.map(entry => entry.category);
                categorysThatDay.push(categoriesForDay);
            }

            const categoryEntries = getLocalData().categoryEntries;
            const categoryColors = categoryEntries.reduce((acc, category) => {
                acc[category._id] = category.color;
                return acc;
            }, {});

            const conicGradients = categorysThatDay.map(categories => {
                const uniqueCategories = [...new Set(categories)];
                const segmentSize = 360 / uniqueCategories.length;
                const gradientSteps = uniqueCategories.map((category, i) => {
                    const color = categoryColors[category];
                    const startAngle = i * segmentSize;
                    const endAngle = (i + 1) * segmentSize;
                    return `${color} ${startAngle}deg ${endAngle}deg`;
                });
                return `conic-gradient(${gradientSteps.join(', ')})`;
            });

            const dayNumberContainers = document.querySelectorAll('.dayNumberContainer:not(.empty)');

            dayNumberContainers.forEach((container, i) => {
                container.style.backgroundImage = conicGradients[i];
            });
        } catch (error) {
            console.error('Error fetching calendar entries:', error);
        }
    };

    const changeMonth = (direction) => {
        let newMonth = currentMonth;
        let newYear = currentYear;

        if (direction === 'back') {
            newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        } else if (direction === 'next') {
            newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        }

        setCurrentMonth(newMonth);
        setCurrentYear(newYear);

        //clear all circle colors
        const dayNumberContainers = document.querySelectorAll('.dayNumberContainer');
        dayNumberContainers.forEach(container => {
            container.style.backgroundImage = 'none';
        });

        //clear all selected days
        const dayNumberSelected = document.querySelectorAll('.dayNumberSelected');
        dayNumberSelected.forEach(day => {
            day.classList.remove('selected');
        });
    };

    const changeSelected = (event) => {
        console.log('event:', event.currentTarget)
        const dayNumberSelected = document.querySelectorAll('.dayNumberSelected');
        const image = event.currentTarget.querySelector('.dayNumberContainer').style.backgroundImage;
        if (image !== '' && image !== 'none') {
            dayNumberSelected.forEach(day => {
                day.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');

            const dateTitle = document.querySelector('#dateTitle');

            const day = event.currentTarget.querySelector('.dayNumber').textContent;
            const date = new Date(currentYear, currentMonth, day);
            if (currentYear === new Date().getFullYear()) {
                dateTitle.innerHTML = date.toLocaleDateString('default', { month: 'long', day: 'numeric' });
            }
            else {
                dateTitle.innerHTML = date.toLocaleDateString('default', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            updateEntries();
        }

    };

    const updateEntries = async () => {
        const entriesContainer = document.querySelector('#entriesContainer');
        entriesContainer.innerHTML = '';

        try {
            const localData = getLocalData();
            const allEntries = localData.calendarEntries;
            const categoryEntries = localData.categoryEntries;

            const categoryMap = categoryEntries.reduce((acc, category) => {
                acc[category._id] = { title: category.title, color: category.color };
                return acc;
            }, {});

            const month = currentMonth;
            const year = currentYear;
            const day = document.querySelector('.selected .dayNumber').textContent;

            const date = new Date(year, month, day);

            const entriesThatDay = allEntries.filter(entry => {
                const entryDate = new Date(entry.date);
                return entryDate.getDate() === date.getDate() &&
                       entryDate.getMonth() === date.getMonth() &&
                       entryDate.getFullYear() === date.getFullYear();
            });

            entriesThatDay.forEach(entry => {
                const eventsContainer = document.createElement('div');
                eventsContainer.className = 'eventContainer';
                eventsContainer.dataset.id = entry._id;
                eventsContainer.onclick = () => {
                    window.location.href = `/tasks/${entry._id}`;
                };

                const category = categoryMap[entry.category] || { title: 'Unknown Category', color: '#ffffff' };

                eventsContainer.style.backgroundColor = category.color;

                const eventHeaderTitle = document.createElement('p');
                eventHeaderTitle.className = 'eventHeaderTitle';
                eventHeaderTitle.textContent = entry.title;
                eventsContainer.appendChild(eventHeaderTitle);

                const eventDescription = document.createElement('p');
                eventDescription.className = 'eventDescription';
                eventDescription.textContent = entry.description;
                eventsContainer.appendChild(eventDescription);

                const eventCategory = document.createElement('p');
                eventCategory.className = 'eventCategory';

                eventCategory.textContent = category.title;
                eventsContainer.appendChild(eventCategory);

                entriesContainer.appendChild(eventsContainer);
            });

        } catch (error) {
            console.error('Error fetching calendar entries:', error);
        }
    };

    const renderDays = () => {
        return daysInMonth.map((day, index) => (
            <div
                key={index}
                className="dayNumberSelected"
                onClick={changeSelected}
                style={{ visibility: day === null ? 'hidden' : 'visible' }}
            >
                <div className={`dayNumberContainer ${day === null ? 'empty' : ''}`}>
                    <div className="dayNumber">{day}</div>
                </div>
            </div>
        ));
    };

    return (
        <div id = "calenderPage">
            <div id="topContainer" style={{margin: "0px"}}>
                <div id="homeButtonContainer" onClick={() => document.location.href = '/'}>
                    <div className="backIcon" style={{backgroundImage: `url(${backIcon})`, marginLeft: "-5px"}}></div>
                    <div id="homeButton">Start</div>
                </div>
            </div>
            <div id="topButtons" style={{width: "100%"}}>
                <div id="secondTopRow">
                    <div id="monthTitleContainer">
                        <button onClick={() => changeMonth("back")} className="backButton"
                                style={{backgroundImage: `url(${backIcon})`}}></button>
                        <span className="monthTitle">
                            {new Date(currentYear, currentMonth).toLocaleString('default', {month: 'long'})}
                            {currentYear !== new Date().getFullYear() && ` ${currentYear}`}
                        </span>
                        <button onClick={() => changeMonth("next")} className="nextButton"
                                style={{backgroundImage: `url(${backIcon})`}}></button>
                    </div>
                </div>
            </div>
            <div id="calendarContainer">
                <div id="daysOfWeekContainer">
                    <div className="dayOfWeek">Mon</div>
                    <div className="dayOfWeek">Tue</div>
                    <div className="dayOfWeek">Wed</div>
                    <div className="dayOfWeek">Thu</div>
                    <div className="dayOfWeek">Fri</div>
                    <div className="dayOfWeek">Sat</div>
                    <div className="dayOfWeek">Sun</div>
                </div>
                <div id="calendarMonthContainer">
                    {renderDays()}
                </div>
            </div>
            <div id="calendarEntries">
                <div id="dateTitle"></div>
                <div id="entriesContainer"></div>
            </div>

        </div>
    );
};

export default Calendar;