import React, { useState } from "react";
import Chart from "react-apexcharts";

const Dashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState("Jan");
    const [selectedBarType, setSelectedBarType] = useState("monthly");

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const dailyData = {
        CLICK: Array.from({ length: 30 }, () => Math.floor(Math.random() * 1000)),
        Payme: Array.from({ length: 30 }, () => Math.floor(Math.random() * 700)),
    };

    const lineChartOptions = {
        chart: { type: "area", toolbar: { show: false } },
        colors: ["#6B46C1", "#38A169"],
        dataLabels: { enabled: false },
        stroke: { curve: "smooth" },
        xaxis: { categories: Array.from({ length: 30 }, (_, i) => i + 1) },
        legend: { position: "top", markers: { width: 10, height: 10 } }
    };
    const lineChartData = [
        { name: "CLICK", data: dailyData.CLICK },
        { name: "Payme", data: dailyData.Payme }
    ];

    const barChartOptions = {
        chart: { type: "bar", toolbar: { show: false } },
        colors: ["#4338CA", "#F97316"],
        xaxis: { categories: selectedBarType === "daily" ? Array.from({ length: 30 }, (_, i) => i + 1) : months },
        legend: { position: "top", markers: { width: 10, height: 10 } },
        dataLabels: { enabled: false },
        plotOptions: {
            bar: {
                borderRadius: 3,
                borderRadiusApplication: "end", // Faqat tepa tomoniga radius berish
                columnWidth: "50%"
            }
        }
    };


    const barChartData = [
        { name: "Oddiy e'lonlar", data: selectedBarType === "daily" ? Array.from({ length: 30 }, () => Math.floor(Math.random() * 70)) : [40, 45, 35, 50, 65, 55, 45, 50, 55, 60, 65, 70] },
        { name: "Gold e'lonlar", data: selectedBarType === "daily" ? Array.from({ length: 30 }, () => Math.floor(Math.random() * 50)) : [30, 35, 30, 40, 55, 45, 35, 30, 28, 35, 40, 45] }
    ];

    const pieChartOptions = {
        labels: ["CLICK", "Payme"],
        colors: ["#6B46C1", "#38A169"],
        legend: { position: "bottom" }
    };
    const pieChartData = [68, 32];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="grid grid-cols-4 gap-4 mb-6">
                {[{ title: "E'lonlar", value: "40,091", change: "+35 bugun" },
                { title: "Sotuvlar", value: "401", change: "+5 today" },
                { title: "Foyda", value: "100.083.000 so'm", change: "+45 000 so'm" },
                { title: "Foydalanuvchilar", value: "21,980", change: "-31 bugun" }
                ].map((card, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-lg shadow">
                        <h3 className="text-sm text-gray-500">{card.title}</h3>
                        <p className="text-xl font-semibold">{card.value}</p>
                        <span className="text-green-500 text-sm">{card.change}</span>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-white rounded-lg shadow mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold">To'lovlar</h3>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 border rounded"
                    >
                        {months.map((month) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>
                <Chart options={lineChartOptions} series={lineChartData} type="area" height={250} />
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-lg shadow">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Kelib tushayotgan e'lonlar</h3>
                        <select
                            value={selectedBarType}
                            onChange={(e) => setSelectedBarType(e.target.value)}
                            className="p-2 border rounded"
                        >
                            <option value="monthly">Oylik</option>
                            <option value="daily">Kunlik</option>
                        </select>
                    </div>
                    <Chart options={barChartOptions} series={barChartData} type="bar" height={250} />
                </div>

                <div className="p-6 bg-white rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">To'lovlar</h3>
                    <Chart options={pieChartOptions} series={pieChartData} type="donut" height={250} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
