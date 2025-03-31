import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const ElonlarChart = () => {
    const [adsStatsData, setAdsStatsData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdsStatistics = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("Token yo'q!");
                    setLoading(false);
                    return;
                }

                // Fetch ads statistics data
                const response = await fetch("https://fast.uysavdo.com/api/v1/adminka/ads/statistics", {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`Ads statistics API xatolik qaytardi: ${response.status}`);
                }

                const result = await response.json();
                setAdsStatsData(result);
            } catch (error) {
                console.error("E'lonlar statistikasini yuklashda xatolik:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdsStatistics();
    }, []);

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Prepare bar chart data from API
    const prepareBarChartData = () => {
        if (!adsStatsData || Object.keys(adsStatsData).length === 0) {
            return [
                { name: "Oddiy e'lonlar", data: Array(12).fill(0) },
                { name: "Gold e'lonlar", data: Array(12).fill(0) }
            ];
        }

        // Sort months chronologically
        const sortedMonths = Object.keys(adsStatsData).sort();
        
        // Extract data for each series
        const oddiyData = sortedMonths.map(month => adsStatsData[month]?.Oddiy || 0);
        const goldData = sortedMonths.map(month => adsStatsData[month]?.Gold || 0);

        return [
            { name: "Oddiy e'lonlar", data: oddiyData },
            { name: "Gold e'lonlar", data: goldData }
        ];
    };

    // Get formatted month labels
    const getMonthLabels = () => {
        if (!adsStatsData || Object.keys(adsStatsData).length === 0) {
            return months;
        }
        
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        
        return Object.keys(adsStatsData).sort().map(monthKey => {
            const parts = monthKey.split('-');
            const year = parts[0].substring(2); // Get last 2 digits of year
            const monthIndex = parseInt(parts[1], 10) - 1; // Convert to 0-based index
            return `${monthNames[monthIndex]}/${year}`; // Format as "Jan/25" from "2025-01"
        });
    };

    const barChartOptions = {
        chart: {
            type: "bar",
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif',
        },
        colors: ["#6366f1", "#f97316"],
        xaxis: {
            categories: getMonthLabels(),
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

    return (
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Kelib tushayotgan e'lonlar</h3>
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-80">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
            ) : (
                <Chart options={barChartOptions} series={barChartData} type="bar" height={320} />
            )}
        </div>
    );
};

export default ElonlarChart;