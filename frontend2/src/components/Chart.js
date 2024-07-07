// src/components/Chart.js
import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Chart = () => {
    const data = {
        labels: ['basket', 'rehab', 'gym'],
        datasets: [
            {
                data: [2, 1, 1],
                backgroundColor: ['#F88D2B', '#AA82FF', '#73A8F6'],
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <div style={{ width: '400px', height: '400px' }}>
            <Pie data={data} options={options} />
        </div>
    );
};

export default Chart;
