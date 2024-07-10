import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../css/Calendar.css';
import backIcon from '../images/backArrow.svg';

const Calendar = () => {
    const { fetchCalendarEntries, fetchCategoryEntries } = useContext(AuthContext);
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        populateCalendar(currentMonth, currentYear);
        updateConicGradients(currentMonth, currentYear);
    }, [currentMonth, currentYear]);

    const populateCalendar = (month, year) => {
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // get the day of the week the month starts on
        const daysInCurrentMonth = new Date(year, month + 1, 0).getDate(); // get the number of days in the month

        let daysArray = [];
        for (let i = 0; i < firstDayOfMonth-1; i++) {
            daysArray.push(null); // fill in empty slots for days before the 1st of the month
        }
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            daysArray.push(i);
        }

        setDaysInMonth(daysArray);
    };

    const updateConicGradients = async (month, year) => {
        try {
            const calendarEntries = await fetchCalendarEntries();

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

            const categoryEntries = await fetchCategoryEntries();
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

        //update the circle colors
        updateConicGradients(newMonth, newYear);
    }

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
                dateTitle.innerHTML = date.toLocaleDateString('default', {month: 'long', day: 'numeric'});
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

    }

    const updateEntries = async () => {
        const entriesContainer = document.querySelector('#entriesContainer');
        entriesContainer.innerHTML = '';

        try {
            const allEntries = await fetchCalendarEntries();
            const categoryEntries = await fetchCategoryEntries();

            // Create a mapping of category _id to its title and color
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
                // onclick redirect to the tasks page
                eventsContainer.onclick = () => {
                    window.location.href = `/tasks/${entry._id}`;
                };

                // Get the category details from the mapping
                const category = categoryMap[entry.category] || { title: 'Unknown Category', color: '#ffffff' };

                // Set the background color of the eventsContainer
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
                // make sure if day is null it has class dayNumberSelected also has class empty
                className="dayNumberSelected"
                onClick={changeSelected}
                style={{visibility: day === null ? 'hidden' : 'visible'}}
            >
                <div className={`dayNumberContainer ${day === null ? 'empty' : ''}`}>
                    <div className="dayNumber">{day}</div>
                </div>
            </div>
        ));
    };

    return (
        <div>
            <h1>Calendar</h1>
            <div id="topButtons">
                <div id="homeButton"></div>
                <div id="secondTopRow">
                    <div id="monthTitleContainer">
                        <button onClick={() => changeMonth("back")} className="backButton" style={{backgroundImage: `url(${backIcon})`}}></button>
                        <span className="monthTitle">
                            {new Date(currentYear, currentMonth).toLocaleString('default', {month: 'long'})}
                            {currentYear !== new Date().getFullYear() && ` ${currentYear}`}
                        </span>
                        <button onClick={() => changeMonth("next")} className="nextButton" style={{backgroundImage: `url(${backIcon})`}}></button>
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