import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Doughnut } from 'react-chartjs-2';
import '../css/Calendar.css';
import 'chart.js/auto';

const Calendar = () => {
    const { fetchCalendarEntries, addCalendarEntry, updateCalendarEntry, deleteCalendarEntry } = useContext(AuthContext);
    const [daysInMonth, setDaysInMonth] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        populateCalendar(currentMonth, currentYear);
    }, [currentMonth, currentYear]);

    const populateCalendar = (month, year) => {
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // get the day of the week the month starts on
        const daysInCurrentMonth = new Date(year, month + 1, 0).getDate(); // get the number of days in the month

        let daysArray = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            daysArray.push(null); // fill in empty slots for days before the 1st of the month
        }
        for (let i = 1; i <= daysInCurrentMonth; i++) {
            daysArray.push(i);
        }

        setDaysInMonth(daysArray);
    }


    const renderDays = () => {
        return daysInMonth.map((day, index) => (
            <div key={index} className="dayContainer">
                <div className="dayNumber">{day}</div>
            </div>
        ));
    }

    return (
        <div>
            <h1>Calendar</h1>
            <div id="topButtons">
                <div id="homeButton"></div>
                <div id="secondTopRow">
                    <div id="monthTitleContainer">
                        <button onClick={() => setCurrentMonth(currentMonth - 1)}>Previous</button>
                        <span>{new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}</span>
                        <button onClick={() => setCurrentMonth(currentMonth + 1)}>Next</button>
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
        </div>
    );
};

export default Calendar;