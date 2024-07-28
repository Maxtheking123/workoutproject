import React, { useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AuthContext } from "../context/AuthContext";
import '../css/Chart.css';
import backIcon from "../images/backArrow.svg";
import { getAndSaveLocalData } from "../utils/getAndSaveLocalData";

ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = () => {
    const { updateEntriesFromDatabase, getLocalData, addCategoryGlobal, addTaskGlobal, addCalendarEntryGlobal, updateCalendarEntryGlobal, updateTaskGlobal, deleteCalendarEntryGlobal, deleteCategoryGlobal, deleteTaskGlobal } = getAndSaveLocalData();

    const [chartData, setChartData] = useState(null);
    const [chartPercentages, setChartPercentages] = useState(null);
    const [chartTitles, setChartTitles] = useState(null);
    const [timeSinceLast, setTimeSinceLast] = useState(null);
    const [timeFrame, setTimeFrame] = useState(-7);
    const [allEntries, setAllEntries] = useState([]);
    const [allCategories, setAllCategories] = useState([]);

    const memoizedGetLocalData = useMemo(() => getLocalData, []);

    const updateTimeFrame = useCallback(() => {
        let newTimeFrame = -7;
        const timeElement = document.querySelector('.timeButton.selected');
        if (timeElement) {
            if (timeElement.id === 'lastMonth') {
                newTimeFrame = -30;
            } else if (timeElement.id === 'lastWeek') {
                newTimeFrame = -7;
            } else if (timeElement.id === 'nextWeek') {
                newTimeFrame = 7;
            }
            setTimeFrame(newTimeFrame);
        }
    }, []);

    const calculateTimeSinceLast = useCallback((entries, categories) => {
        const timeSinceLast = categories.map(category => {
            const lastEntry = entries
                .filter(entry => entry.category === category._id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            return lastEntry ? Math.round((new Date() - new Date(lastEntry.date)) / 1000 / 60 / 60 / 24) : null;
        });

        setTimeSinceLast(timeSinceLast);
    }, []);

    const getEntries = useCallback((timeFrame) => {
        const currentDate = new Date();
        const targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + timeFrame);

        const filteredEntries = allEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return timeFrame > 0 ? entryDate <= targetDate && entryDate >= currentDate : entryDate >= targetDate && entryDate <= currentDate;
        });

        const usedCategoryIdsInTimeframe = [...new Set(filteredEntries.map(entry => entry.category))];

        const categoryLabelsInTimeframe = [];
        const categoryCounts = [];
        const categoryColors = [];

        usedCategoryIdsInTimeframe.forEach(categoryId => {
            const category = allCategories.find(cat => cat._id === categoryId);
            if (category) {
                categoryLabelsInTimeframe.push(category.title);
                categoryColors.push(category.color);
                const count = filteredEntries.filter(entry => entry.category === categoryId).length;
                categoryCounts.push(count);
            }
        });
        setChartTitles(categoryLabelsInTimeframe);

        if (categoryLabelsInTimeframe.length !== 0) {
            const data = {
                labels: categoryLabelsInTimeframe,
                datasets: [
                    {
                        data: categoryCounts,
                        backgroundColor: categoryColors,
                    }
                ]
            };
            setChartData(data);
        } else {
            const data = {
                labels: ['No data'],
                datasets: [
                    {
                        data: [1],
                        backgroundColor: ['#5C5C5C'],
                    }
                ]
            };
            setChartData(data);
        }

        const total = categoryCounts.reduce((a, b) => a + b, 0);
        const percentages = categoryCounts.map(count => (count / total) * 100);
        setChartPercentages(percentages);

    }, [allEntries, allCategories]);

    useEffect(() => {
        const fetchData = async () => {
            const localData = memoizedGetLocalData();
            const fetchedEntries = localData.calendarEntries;
            const fetchedCategories = localData.categoryEntries;
            setAllEntries(fetchedEntries);
            setAllCategories(fetchedCategories);
            calculateTimeSinceLast(fetchedEntries, fetchedCategories);
        };
        fetchData();
    }, [memoizedGetLocalData, calculateTimeSinceLast]);

    useEffect(() => {
        updateTimeFrame();
    }, [updateTimeFrame]);

    useEffect(() => {
        if (timeFrame !== null) {
            getEntries(timeFrame);
        }
    }, [timeFrame, getEntries]);

    const changeTimeFrame = (timeFrameId) => {
        const timeElements = document.getElementsByClassName('timeButton');
        for (const timeElement of timeElements) {
            timeElement.classList.remove('selected');
        }
        document.getElementById(timeFrameId).classList.add('selected');
        updateTimeFrame();
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        borderWidth: 0,
        plugins: {
            legend: {
                display: false,
            }
        },
    };

    return (
        <div id="chartPage">
            <div id="topContainer">
                <div id="homeButtonContainer">
                    <div className="backIcon" style={{backgroundImage: `url(${backIcon})`}}></div>
                    <div id="homeButton" onClick={() => document.location.href = '/'}>Home</div>
                </div>
                <div id="WorkoutsplitTitle">Workoutsplit</div>
                <div id="timeContainer">
                    <div id="lastMonth" className="timeButton" onClick={() => changeTimeFrame('lastMonth')}>Last month</div>
                    <div id="lastWeek" className="timeButton selected" onClick={() => changeTimeFrame('lastWeek')}>Last week</div>
                    <div id="nextWeek" className="timeButton" onClick={() => changeTimeFrame('nextWeek')}>Next week</div>
                </div>
            </div>
            <div id="chartContainer">
                {chartData ? (
                    <Pie data={chartData} options={options} />
                ) : (
                    <p>Loading...</p>
                )}
            </div>
            <div id="leftAlignedTextContainer">
                <div id="percentagesContainer">
                    {chartPercentages ? (
                        chartPercentages.map((percentage, index) => (
                            <div key={index} className="percentage">
                                <div className="color" style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}></div>
                                <div className="percentageNumber">{percentage.toFixed(0)}%</div>
                                <div className="label">{chartTitles[index]}</div>
                            </div>
                        ))
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
                <div id="timeSinceLastContainer">
                    <div id="timeSinceLastTitle">Time since last workout</div>
                    <div className="noEventsText" style={{display: timeSinceLast && Object.values(timeSinceLast).every(element => element === null) ? "block" : "none"}}>
                        There are no events
                    </div>
                    {timeSinceLast ? (
                        timeSinceLast.map((time, index) => (
                            <div key={index} className="timeSinceLast" style={{display: time < 0 || time === null ? 'none' : 'flex'}}>
                                <div className="label">{allCategories[index]?.title}</div>
                                <div className="time">{time > -1 ? (time + (time === 1 ? ' day' : ' days')) : 'Never'}</div>
                            </div>
                        ))
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chart;