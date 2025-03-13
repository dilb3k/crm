import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Click from '../../public/assets/icons/click.png';
import Payme from '../../public/assets/icons/payme.png';

const Dashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState("Jan");
    const [selectedBarType, setSelectedBarType] = useState("monthly");
    const [dashboardData, setDashboardData] = useState({
        server_time: "",
        Elonlar: { count: 0, change: "0 bugun" },
        Sotuvlar: { count: 0, growth_percent: "0%", change: "0 today" },
        Foyda: { count: "0 so'm", change: "0 so'm bugun" },
        Foydalanuvchilar: { count: 0, growth_percent: "0%", change: "0 bugun" }
    });
    const [paymentsData, setPaymentsData] = useState({
        total_so_m: 0,
        click: { count: 0, total_amount: 0 },
        payme: { count: 0, total_amount: 0 },
        monthly_data: []
    });
    const [monthlyAdsData, setMonthlyAdsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("Token yo'q!");
                    setLoading(false);
                    return;
                }

                // Fetch dashboard data
                const dashboardResponse = await fetch("https://fast.uysavdo.com/api/v1/adminka/dashboard", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!dashboardResponse.ok) {
                    throw new Error(`Dashboard API xatolik qaytardi: ${dashboardResponse.status}`);
                }

                const dashboardResult = await dashboardResponse.json();
                setDashboardData(dashboardResult);

                // Fetch payments data
                const paymentsResponse = await fetch("https://fast.uysavdo.com/api/v1/adminka/payments", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!paymentsResponse.ok) {
                    throw new Error(`Payments API xatolik qaytardi: ${paymentsResponse.status}`);
                }

                const paymentsResult = await paymentsResponse.json();
                setPaymentsData(paymentsResult);

                // Fetch monthly ads data
                const monthlyAdsResponse = await fetch("https://fast.uysavdo.com/api/v1/adminka/monthly-ads", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!monthlyAdsResponse.ok) {
                    throw new Error(`Monthly ads API xatolik qaytardi: ${monthlyAdsResponse.status}`);
                }

                const monthlyAdsResult = await monthlyAdsResponse.json();
                if (monthlyAdsResult.status && monthlyAdsResult.data) {
                    setMonthlyAdsData(monthlyAdsResult.data);
                }
            } catch (error) {
                console.error("Ma'lumotlarni yuklashda xatolik:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Prepare line chart data from API
    const prepareLineChartData = () => {
        if (!paymentsData.monthly_data || paymentsData.monthly_data.length === 0) {
            return [
                { name: "CLICK", data: Array(12).fill(0) },
                { name: "Payme", data: Array(12).fill(0) }
            ];
        }

        const clickData = paymentsData.monthly_data.map(item => item.click || 0);
        const paymeData = paymentsData.monthly_data.map(item => item.payme || 0);

        return [
            { name: "CLICK", data: clickData },
            { name: "Payme", data: paymeData }
        ];
    };

    const lineChartOptions = {
        chart: { 
            type: "area", 
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
        },
        colors: ["#6366f1", "#10b981"], // Improved colors to match the design
        dataLabels: { enabled: false },
        stroke: { 
            curve: "smooth",
            width: 2,
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.3,
                opacityTo: 0.1,
                stops: [0, 100]
            }
        },
        xaxis: { 
            categories: paymentsData.monthly_data?.map(item => item.month) || months,
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                }
            }
        },
        grid: {
            borderColor: '#f3f4f6',
            strokeDashArray: 4,
            xaxis: {
                lines: { show: false }
            }
        },
        legend: {
            position: "top",
            horizontalAlign: "right",
            markers: { width: 8, height: 8, radius: 12 },
            itemMargin: { horizontal: 10, vertical: 5 },
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            labels: {
                colors: '#4b5563'
            }
        },
        tooltip: {
            y: {
                formatter: function(value) {
                    return value.toLocaleString() + " so'm";
                }
            },
            style: {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
            }
        },
        annotations: {
            xaxis: [{
                x: 'Apr', // The month where we want to show the annotation marker (based on the screenshot)
                borderColor: '#6366f1',
                label: {
                    orientation: 'vertical',
                    borderColor: '#6366f1',
                    style: {
                        color: '#fff',
                        background: '#6366f1'
                    },
                    text: ''
                }
            }]
        }
    };
    
    const lineChartData = prepareLineChartData();

    // Prepare bar chart data from API
    const prepareBarChartData = () => {
        if (selectedBarType === "daily") {
            // For daily view, we'll still use random data as API doesn't provide daily data
            return [
                { name: "Oddiy e'lonlar", data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 70)) },
                { name: "Gold e'lonlar", data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50)) }
            ];
        } else {
            // For monthly view, use the API data
            if (!monthlyAdsData || monthlyAdsData.length === 0) {
                return [
                    { name: "Oddiy e'lonlar", data: Array(12).fill(0) },
                    { name: "Gold e'lonlar", data: Array(12).fill(0) }
                ];
            }

            const oddiyData = monthlyAdsData.map(item => item.oddiy_elonlar || 0);
            const goldData = monthlyAdsData.map(item => item.gold_elonlar || 0);

            return [
                { name: "Oddiy e'lonlar", data: oddiyData },
                { name: "Gold e'lonlar", data: goldData }
            ];
        }
    };
    
    const barChartOptions = {
        chart: { 
            type: "bar", 
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
        },
        colors: ["#6366f1", "#f97316"],
        xaxis: { 
            categories: selectedBarType === "daily" 
                ? Array.from({ length: 30 }, (_, i) => i + 1) 
                : (monthlyAdsData.length > 0 ? monthlyAdsData.map(item => item.month) : months),
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif',
                }
            }
        },
        legend: { 
            position: "top", 
            horizontalAlign: "right",
            markers: { width: 8, height: 8, radius: 12 },
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            labels: {
                colors: '#4b5563'
            }
        },
        dataLabels: { enabled: false },
        grid: {
            borderColor: '#f3f4f6',
            strokeDashArray: 4,
            xaxis: {
                lines: { show: false }
            }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                borderRadiusApplication: "end",
                columnWidth: "60%",
                distributed: false,
            }
        },
        tooltip: {
            style: {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
            }
        }
    };

    const barChartData = prepareBarChartData();

    // Calculate percentages for pie chart
    const calculatePieChartData = () => {
        const clickTotal = paymentsData.click?.total_amount || 0;
        const paymeTotal = paymentsData.payme?.total_amount || 0;
        const total = clickTotal + paymeTotal;

        if (total === 0) return [50, 50]; // Default if no data

        const clickPercentage = Math.round((clickTotal / total) * 100);
        const paymePercentage = 100 - clickPercentage;

        return [clickPercentage, paymePercentage];
    };

    const pieChartOptions = {
        chart: {
            fontFamily: 'Inter, sans-serif',
        },
        labels: ["CLICK", "Payme"],
        colors: ["#6366f1", "#10b981"],
        legend: { 
            position: "bottom",
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            markers: { width: 8, height: 8, radius: 12 },
            itemMargin: { horizontal: 10, vertical: 5 }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val.toFixed(1) + "%";
            },
            style: {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                colors: ['#fff']
            },
            dropShadow: {
                enabled: false
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: paymentsData.total_so_m?.toLocaleString() + " so'm",
                            formatter: function() {
                                return "8%";
                            },
                            fontSize: '22px',
                            fontFamily: 'Inter, sans-serif',
                            fontWeight: 600,
                            color: '#1f2937'
                        }
                    }
                }
            }
        },
        stroke: {
            width: 0
        },
        tooltip: {
            style: {
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
            }
        }
    };
    
    const pieChartData = calculatePieChartData();

    // Stats card data
    const statsCards = [
        { 
            title: "E'lonlar", 
            value: dashboardData.Elonlar?.count.toLocaleString() || "0", 
            change: dashboardData.Elonlar?.change || "+0 bugun",
            borderColor: "border-l-indigo-500"
        },
        { 
            title: "Sotuvlar", 
            value: dashboardData.Sotuvlar?.count.toLocaleString() || "0", 
            change: dashboardData.Sotuvlar?.change || "+0 today",
            percent: dashboardData.Sotuvlar?.growth_percent || "0%",
            borderColor: "border-l-orange-500"
        },
        { 
            title: "Foyda", 
            value: dashboardData.Foyda?.count || "0 so'm", 
            change: dashboardData.Foyda?.change || "+0 so'm bugun",
            borderColor: "border-l-emerald-500" 
        },
        { 
            title: "Foydalanuvchilar", 
            value: dashboardData.Foydalanuvchilar?.count.toLocaleString() || "0", 
            change: dashboardData.Foydalanuvchilar?.change || "+0 bugun",
            percent: dashboardData.Foydalanuvchilar?.growth_percent || "0%",
            borderColor: "border-l-indigo-500"
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {statsCards.map((card, idx) => (
                    <div key={idx} className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${card.borderColor}`}>
                        <div className="text-sm font-medium text-gray-500 mb-1">{card.title}</div>
                        <div className="text-2xl font-semibold text-gray-900 mb-1">{card.value}</div>
                        <div className="flex items-center">
                            {card.percent && card.percent !== "0%" && (
                                <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${idx === 3 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} mr-2`}>
                                    {card.percent}
                                </span>
                            )}
                            <span className="text-sm text-gray-500">{card.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Line Chart - Payments */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">To'lovlar</h3>
                        {!loading && (
                            <div className="mt-2 inline-flex items-center space-x-4">
                                <div className="bg-gray-100 rounded-lg p-2 inline-flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                                    <span className="text-sm font-medium">Click:</span>
                                    <span className="text-sm font-medium ml-1">{(paymentsData.click?.total_amount || 0).toLocaleString()} so'm</span>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-2 inline-flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                                    <span className="text-sm font-medium">Payme:</span>
                                    <span className="text-sm font-medium ml-1">{(paymentsData.payme?.total_amount || 0).toLocaleString()} so'm</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <Chart options={lineChartOptions} series={lineChartData} type="area" height={320} />
            </div>

            {/* Bottom Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart - Monthly Ads */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Kelib tushayotgan e'lonlar</h3>
                        <select
                            value={selectedBarType}
                            onChange={(e) => setSelectedBarType(e.target.value)}
                            className="p-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="monthly">Oylik</option>
                            <option value="daily">Kunlik</option>
                        </select>
                    </div>
                    <Chart options={barChartOptions} series={barChartData} type="bar" height={320} />
                </div>

                {/* Pie Chart - Payment Distribution */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">To'lovlar</h3>
                    <Chart options={pieChartOptions} series={pieChartData} type="donut" height={320} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;