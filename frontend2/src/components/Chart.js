import React, { useContext, useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AuthContext } from "../context/AuthContext";
import '../css/Chart.css';
import backIcon from "../images/backArrow.svg";

ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = () => {
    // använder functioner ifrån AuthContext för att hämta data
    const { fetchCalendarEntries, fetchCategoryEntries } = useContext(AuthContext);
    // har lärt mig att det är typ som en global variabel
    const [chartData, setChartData] = useState(null);
    const [chartPercentages, setChartPercentages] = useState(null);
    const [chartTitles, setChartTitles] = useState(null);
    const [timeSinceLast, setTimeSinceLast] = useState(null);

    const getEntries = async () => {
        // hämtar data ifrån fetchCalendarEntries och fetchCategoryEntries, du kan kolla i inspect console och se hur datan ser ut
        const fetchedEntries = await fetchCalendarEntries();
        const fetchedCategories = await fetchCategoryEntries();
        console.log('fetchedEntries:', fetchedEntries);
        console.log('fetchedCategories:', fetchedCategories);

        var timeFrame = 7;
        const timeElement = document.getElementsByClassName('timeButton selected')[0];
        if (timeElement.id === 'lastMonth') {
            timeFrame = 30;
        }
        if (timeElement.id === 'lastWeek') {
            timeFrame = 7;
        }
        if (timeElement.id === 'nextWeek') {
            timeFrame = -7;
        }
        // kollar vilka kategorier som används och sparar deras id
        const usedCategoryIds = []
        for (const entry of fetchedEntries) {
            if (!usedCategoryIds.includes(entry.category)) {
                usedCategoryIds.push(entry.category);
            }
        }
        console.log('usedCategoryIds:', usedCategoryIds);


        const usedCategoryIdsInTimeframe = []
        for (const entry of fetchedEntries) {
            if (new Date(entry.date) > new Date(new Date().getTime() + timeFrame * 24 * 60 * 60 * 1000)) {
                continue;
            }
            if (!usedCategoryIdsInTimeframe.includes(entry.category)) {
                usedCategoryIdsInTimeframe.push(entry.category);
            }
        }
        console.log('usedCategoryIdsInTimeframe:', usedCategoryIdsInTimeframe);

        const chartTitles = []
        for (const category of fetchedCategories) {
            if (usedCategoryIds.includes(category._id)) {
                chartTitles.push(category.title);
            }
        }
        console.log('chartTitles:', chartTitles);
        setChartTitles(chartTitles);

        // sparar kategorinamn utifrån id
        const categoryLabelsInTimeframe = []
        for (const category of fetchedCategories) {
            if (usedCategoryIdsInTimeframe.includes(category._id)) {
                categoryLabelsInTimeframe.push(category.title);
            }
        }
        console.log('categoryLabelsInTimeframe:', categoryLabelsInTimeframe);

        // räknar hur många gånger en kategori används
        const categoryCounts = []
        for (const category of usedCategoryIdsInTimeframe) {
            let count = 0;
            for (const entry of fetchedEntries) {
                if (entry.category === category) {
                    count++;
                }
            }
            categoryCounts.push(count);
        }
        console.log('categoryCounts:', categoryCounts);

        // sparar färgen på kategorin utifrån id
        const categoryColors = []
        for (const category of usedCategoryIdsInTimeframe) {
            for (const fetchedCategory of fetchedCategories) {
                if (category === fetchedCategory._id) {
                    categoryColors.push(fetchedCategory.color);
                }
            }
        }
        console.log('categoryColors:', categoryColors);



        // sätter ihop allt till data
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
            const percentagesContainer = document.getElementById('percentagesContainer');
            // mörda barnen med innerHTML "No sessions"
            Array.from(percentagesContainer.children).forEach(child => {
                console.log('child:', child);
                if (child.querySelector(".label").innerHTML === "No sessions") {
                    percentagesContainer.removeChild(child);
                }
            });
        setChartData(data);

        }
        else {
            const data = {
                labels: ['No data'],
                datasets: [
                    {
                        data: [1],
                        backgroundColor: ['#5C5C5C'],
                    }
                ]
            };
            // detta ändrar den där globala variabeln högst up så det sparas typ
            setChartData(data);

            const percentagesContainer = document.getElementById('percentagesContainer');

            // skapar en div som säger att det inte finns någon data
            const percentage = document.createElement('div');
            percentage.className = 'percentage';
            const color = document.createElement('div');
            color.className = 'color';
            color.style.backgroundColor = '#5C5C5C';
            percentage.appendChild(color);
            const percentageNumber = document.createElement('div');
            percentageNumber.className = 'percentageNumber';
            percentageNumber.innerHTML = '';
            percentage.appendChild(percentageNumber);
            const label = document.createElement('div');
            label.className = 'label';
            label.innerHTML = 'No sessions';
            percentage.appendChild(label);
            // mörda barnen

            percentagesContainer.appendChild(percentage);
        }

        // räknar ut procenten
        const total = categoryCounts.reduce((a, b) => a + b, 0);
        const procentages = []
        for (const count of categoryCounts) {
            procentages.push((count / total) * 100);
        }
        console.log('procentages:', procentages);
        setChartPercentages(procentages);

        // räknar ut hur länge sen varje kategori användes, omvandla till hela dagar, avrunda till hela dagar
        const timeSinceLast = []
        for (const category of usedCategoryIds) {
            let time = null;
            for (const entry of fetchedEntries) {
                if (entry.category === category) {
                    if (!time || entry.date > time) {
                        time = entry.date;
                    }
                }
            }
            if (time) {
                time = Math.round((new Date() - new Date(time)) / 1000 / 60 / 60 / 24, 0);
            }
            timeSinceLast.push(time);
        }
        console.log('timeSinceLast:', timeSinceLast);
        setTimeSinceLast(timeSinceLast);
    };

    const changeTimeFrame = (timeFrame) => {
        const timeElements = document.getElementsByClassName('timeButton');
        for (const timeElement of timeElements) {
            timeElement.classList.remove('selected');
        }
        document.getElementById(timeFrame).classList.add('selected');
        getEntries();
    }

    // det här fick jag chatgpt hjälp med, tror den kör functionen när typ sidan har laddat klart? eller något sånt
    useEffect(() => {
        getEntries();
    }, []);

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
                        chartPercentages.map((procentage, index) => (
                            <div key={index} className="percentage">
                                <div className="color"
                                     style={{backgroundColor: chartData.datasets[0].backgroundColor[index]}}></div>
                                <div className="percentageNumber">{procentage.toFixed(0)}%</div>
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