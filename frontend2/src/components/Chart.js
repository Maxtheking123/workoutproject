import React, { useContext, useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AuthContext } from "../context/AuthContext";
import '../css/Chart.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = () => {
    // använder functioner ifrån AuthContext för att hämta data
    const { fetchCalendarEntries, fetchCategoryEntries } = useContext(AuthContext);
    // har lärt mig att det är typ som en global variabel
    const [chartData, setChartData] = useState(null);

    const getEntries = async () => {
        // hämtar data ifrån fetchCalendarEntries och fetchCategoryEntries, du kan kolla i inspect console och se hur datan ser ut
        const fetchedEntries = await fetchCalendarEntries();
        const fetchedCategories = await fetchCategoryEntries();
        console.log('fetchedEntries:', fetchedEntries);
        console.log('fetchedCategories:', fetchedCategories);

        // kollar vilka kategorier som används och sparar deras id
        const usedCategoryIds = []
        for (const entry of fetchedEntries) {
            if (!usedCategoryIds.includes(entry.category)) {
                usedCategoryIds.push(entry.category);
            }
        }
        console.log('usedCategoryIds:', usedCategoryIds);

        // sparar kategorinamn utifrån id
        const categoryLabels = []
        for (const category of fetchedCategories) {
            if (usedCategoryIds.includes(category._id)) {
                categoryLabels.push(category.title);
            }
        }
        console.log('categoryLabels:', categoryLabels);

        // räknar hur många gånger en kategori används
        const categoryCounts = []
        for (const category of usedCategoryIds) {
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
        for (const category of usedCategoryIds) {
            for (const fetchedCategory of fetchedCategories) {
                if (category === fetchedCategory._id) {
                    categoryColors.push(fetchedCategory.color);
                }
            }
        }
        console.log('categoryColors:', categoryColors);

        // sätter ihop allt till data
        const data = {
            labels: categoryLabels,
            datasets: [
                {
                    data: categoryCounts,
                    backgroundColor: categoryColors,
                }
            ]
        };
        // detta ändrar den där globala variabeln högst up så det sparas typ
        setChartData(data);
    };

    // det här fick jag chatgpt hjälp med, tror den kör functionen när typ sidan har laddat klart? eller något sånt
    useEffect(() => {
        getEntries();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        borderWidth: 0,
    };

    return (
        <div style={{ width: '400px', height: '400px' }}>
            {chartData ? (
                <Pie data={chartData} options={options} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Chart;