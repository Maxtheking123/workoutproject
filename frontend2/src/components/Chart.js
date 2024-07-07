import React, { useContext, useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { AuthContext } from "../context/AuthContext";

ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = () => {
    const { fetchCalendarEntries, fetchCategoryEntries } = useContext(AuthContext);
    const [chartData, setChartData] = useState(null);

    const getEntries = async () => {
        const fetchedEntries = await fetchCalendarEntries();
        const fetchedCategories = await fetchCategoryEntries();
        console.log('fetchedEntries:', fetchedEntries);
        console.log('fetchedCategories:', fetchedCategories);

        const usedCategoryIds = []
        for (const entry of fetchedEntries) {
            if (!usedCategoryIds.includes(entry.category)) {
                usedCategoryIds.push(entry.category);
            }
        }
        console.log('usedCategoryIds:', usedCategoryIds);

        const categoryLabels = []
        for (const category of fetchedCategories) {
            if (usedCategoryIds.includes(category._id)) {
                categoryLabels.push(category.title);
            }
        }
        console.log('categoryLabels:', categoryLabels);

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

        const categoryColors = []
        for (const category of usedCategoryIds) {
            for (const fetchedCategory of fetchedCategories) {
                if (category === fetchedCategory._id) {
                    categoryColors.push(fetchedCategory.color);
                }
            }
        }
        console.log('categoryColors:', categoryColors);

        const data = {
            labels: categoryLabels,
            datasets: [
                {
                    data: categoryCounts,
                    backgroundColor: categoryColors,
                }
            ]
        };

        setChartData(data);
    };

    useEffect(() => {
        getEntries();
    }, []);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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