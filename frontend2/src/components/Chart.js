import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AuthContext } from "../context/AuthContext";
import '../css/Chart.css';
import backIcon from "../images/backArrow.svg";

ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = () => {
    const { fetchCalendarEntries, fetchCategoryEntries } = useContext(AuthContext);
    const [chartData, setChartData] = useState(null);
    const [chartPercentages, setChartPercentages] = useState(null);
    const [chartTitles, setChartTitles] = useState(null);
    const [timeSinceLast, setTimeSinceLast] = useState(null);
    const [timeFrame, setTimeFrame] = useState(-7);

    const updateTimeFrame = useCallback(() => {
        let newTimeFrame = -7;
        const timeElement = document.querySelector('.timeButton.selected');
        console.log('timeElement:', timeElement);
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

    const getEntries = useCallback(async (timeFrame) => {
        const fetchedEntries = await fetchCalendarEntries();
        const fetchedCategories = await fetchCategoryEntries();
        console.log('fetchedEntries:', fetchedEntries);
        console.log('fetchedCategories:', fetchedCategories);

        const currentDate = new Date();
        const targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() + timeFrame);
        console.log("current timeframe: ", timeFrame);

        const filteredEntries = fetchedEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return timeFrame > 0 ? entryDate <= targetDate && entryDate >= currentDate : entryDate >= targetDate && entryDate <= currentDate;
        });

        const usedCategoryIdsInTimeframe = [...new Set(filteredEntries.map(entry => entry.category))];
        console.log('usedCategoryIdsInTimeframe:', usedCategoryIdsInTimeframe);

        const categoryLabelsInTimeframe = [];
        const categoryCounts = [];
        const categoryColors = [];

        usedCategoryIdsInTimeframe.forEach(categoryId => {
            const category = fetchedCategories.find(cat => cat._id === categoryId);
            if (category) {
                categoryLabelsInTimeframe.push(category.title);
                categoryColors.push(category.color);
                const count = filteredEntries.filter(entry => entry.category === categoryId).length;
                categoryCounts.push(count);
            }
        });
        setChartTitles(categoryLabelsInTimeframe);

        console.log('categoryLabelsInTimeframe:', categoryLabelsInTimeframe);
        console.log('categoryCounts:', categoryCounts);
        console.log('categoryColors:', categoryColors);

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

        const timeSinceLast = usedCategoryIdsInTimeframe.map(categoryId => {
            const lastEntry = fetchedEntries
                .filter(entry => entry.category === categoryId)
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            return lastEntry ? Math.round((new Date() - new Date(lastEntry.date)) / 1000 / 60 / 60 / 24) : null;
        });

        console.log('timeSinceLast:', timeSinceLast);
        setTimeSinceLast(timeSinceLast);
    }, [fetchCalendarEntries, fetchCategoryEntries]);

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
                    <Pie data={chartData} options={options}/>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
            <div id="leftAlignedTextContainer">
                <div id="percentagesContainer">
                    {chartPercentages ? (
                        chartPercentages.map((percentage, index) => (
                            <div key={index} className="percentage">
                                <div className="color" style={{backgroundColor: chartData.datasets[0].backgroundColor[index]}}></div>
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
                    {timeSinceLast ? (
                        timeSinceLast.map((time, index) => (
                            <div key={index} className="timeSinceLast" style={{display: time < 0 ? 'none' : 'flex' }}>
                                <div className="label">{chartTitles[index]}</div>
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