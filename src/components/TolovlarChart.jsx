import React, { useState, useEffect, useRef } from "react";
import Chart from "react-apexcharts";

const TolovlarChart = () => {
  const [adPaymentsData, setAdPaymentsData] = useState({});
  const [dailyPaymentsData, setDailyPaymentsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const chartRef = useRef(null);

  // Fetch monthly data
  useEffect(() => {
    const fetchAdvertisementPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token yo'q!");
          setLoading(false);
          return;
        }

        // Fetch advertisement payments data
        const response = await fetch("https://fast.uysavdo.com/api/v1/adminka/payments/advertisements", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Advertisement Payments API xatolik qaytardi: ${response.status}`);
        }

        const result = await response.json();
        setAdPaymentsData(result);
      } catch (error) {
        console.error("Advertisement Payments ma'lumotlarini yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisementPayments();
  }, []);

  // Fetch daily data when a month is selected
  useEffect(() => {
    if (!selectedMonth) return;

    const fetchDailyData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token yo'q!");
          setLoading(false);
          return;
        }

        const [year, month] = selectedMonth.split('-');
        
        const response = await fetch(`https://fast.uysavdo.com/api/v1/adminka/payments/advertisements/daily?year=${year}&month=${month}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Daily Payments API xatolik qaytardi: ${response.status}`);
        }

        const result = await response.json();
        
        // Start transition animation
        setIsTransitioning(true);
        
        // Set data after a brief delay to allow transition effect
        setTimeout(() => {
          setDailyPaymentsData(result);
          setIsTransitioning(false);
        }, 300);
        
      } catch (error) {
        console.error("Kunlik to'lovlar ma'lumotlarini yuklashda xatolik:", error);
        setIsTransitioning(false);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyData();
  }, [selectedMonth]);

  // Handle month click
  const handleMonthClick = (monthKey) => {
    // Add transition class
    setIsTransitioning(true);
    
    // Change month with slight delay for animation
    setTimeout(() => {
      setSelectedMonth(monthKey);
    }, 300);
  };

  // Get months for categories
  const getMonths = () => {
    if (!adPaymentsData || Object.keys(adPaymentsData).length === 0) {
      return [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
    }
    
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    
    return Object.keys(adPaymentsData).sort().map(monthKey => {
      const parts = monthKey.split('-');
      const year = parts[0].substring(2); // Get last 2 digits of year
      const monthIndex = parseInt(parts[1], 10) - 1; // Convert to 0-based index
      return `${monthNames[monthIndex]}/${year}`; // Format as "Jan/25" from "2025-01"
    });
  };

  // Prepare monthly chart data
  const prepareMonthlyChartData = () => {
    if (!adPaymentsData || Object.keys(adPaymentsData).length === 0) {
      return [
        { name: "CLICK", data: [] },
        { name: "Payme", data: [] }
      ];
    }

    // Sort months chronologically
    const sortedMonths = Object.keys(adPaymentsData).sort();
    
    // Extract data for each series
    const clickData = sortedMonths.map(month => adPaymentsData[month]?.Click || 0);
    const paymeData = sortedMonths.map(month => adPaymentsData[month]?.Payme || 0);

    return [
      { name: "CLICK", data: clickData },
      { name: "Payme", data: paymeData }
    ];
  };

  // Prepare daily chart data
  const prepareDailyChartData = () => {
    if (!dailyPaymentsData || Object.keys(dailyPaymentsData).length === 0) {
      return [
        { name: "CLICK", data: [] },
        { name: "Payme", data: [] }
      ];
    }

    // Sort days chronologically
    const sortedDays = Object.keys(dailyPaymentsData).sort();
    
    // Extract data for each series
    const clickData = sortedDays.map(day => dailyPaymentsData[day]?.Click || 0);
    const paymeData = sortedDays.map(day => dailyPaymentsData[day]?.Payme || 0);

    return [
      { name: "CLICK", data: clickData },
      { name: "Payme", data: paymeData }
    ];
  };

  // Get day numbers for daily chart
  const getDayLabels = () => {
    if (!dailyPaymentsData || Object.keys(dailyPaymentsData).length === 0) {
      return [];
    }
    
    return Object.keys(dailyPaymentsData)
      .sort()
      .map(dayKey => {
        // Extract day from "2025-03-15" format
        return dayKey.split('-')[2];
      });
  };

  // Chart options for monthly view
  const getMonthlyChartOptions = () => {
    return {
      chart: { 
        type: "area", 
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        events: {
          click: function(event, chartContext, config) {
            // Ensure we have data and the click was on a data point
            if (config.dataPointIndex >= 0 && config.seriesIndex >= 0) {
              const months = Object.keys(adPaymentsData).sort();
              const clickedMonth = months[config.dataPointIndex];
              handleMonthClick(clickedMonth);
            }
          }
        }
      },
      colors: ["#6366f1", "#10b981"], 
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
        categories: getMonths(),
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
          },
          formatter: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K';
            }
            return value;
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
      // Make chart clickable
      markers: {
        size: 0,
        hover: {
          size: 6
        }
      },
      states: {
        hover: {
          filter: {
            type: 'none',
          }
        }
      },
      annotations: {
        xaxis: [{
          x: 'Apr',
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
  };

  // Chart options for daily view
  const getDailyChartOptions = () => {
    return {
      chart: { 
        type: "area", 
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      colors: ["#6366f1", "#10b981"], 
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
        categories: getDayLabels(),
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
          },
          formatter: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K';
            }
            return value;
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
      }
    };
  };
  
  // Format month name for display
  const formatSelectedMonth = () => {
    if (!selectedMonth) return '';
    
    const monthNames = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", 
      "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ];
    
    const parts = selectedMonth.split('-');
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    
    return `${monthNames[monthIndex]} ${year}`;
  };

  // Calculate totals for current view
  const calculateTotals = () => {
    if (selectedMonth && Object.keys(dailyPaymentsData).length > 0) {
      // Daily view totals
      const clickTotal = Object.values(dailyPaymentsData).reduce((sum, item) => sum + (item.Click || 0), 0);
      const paymeTotal = Object.values(dailyPaymentsData).reduce((sum, item) => sum + (item.Payme || 0), 0);
      return { click: clickTotal, payme: paymeTotal };
    } else {
      // Monthly view totals
      const clickTotal = Object.values(adPaymentsData).reduce((sum, item) => sum + (item.Click || 0), 0);
      const paymeTotal = Object.values(adPaymentsData).reduce((sum, item) => sum + (item.Payme || 0), 0);
      return { click: clickTotal, payme: paymeTotal };
    }
  };

  // Handle return to monthly view with animation
  const handleReturnToMonthly = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setSelectedMonth(null);
      setIsTransitioning(false);
    }, 300);
  };

  const totals = calculateTotals();
  const chartOptions = selectedMonth ? getDailyChartOptions() : getMonthlyChartOptions();
  const chartData = selectedMonth ? prepareDailyChartData() : prepareMonthlyChartData();

  // Custom CSS for cursor
  const chartContainerStyle = {
    cursor: selectedMonth ? 'default' : 'pointer',
    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
    opacity: isTransitioning ? 0.5 : 1,
    transform: isTransitioning ? 'scale(0.98)' : 'scale(1)'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedMonth ? `E'lon to'lovlari: ${formatSelectedMonth()}` : "E'lon to'lovlari"}
            </h3>
            {selectedMonth && (
              <button
                onClick={handleReturnToMonthly}
                className="ml-3 text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded px-2 py-1 transition-colors"
              >
                ← Oylik ko'rinishga qaytish
              </button>
            )}
          </div>
          {!loading && (
            <div className="mt-2 inline-flex items-center space-x-4">
              <div className="bg-gray-100 rounded-lg p-2 inline-flex items-center">
                <span className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                <span className="text-sm font-medium">Click:</span>
                <span className="text-sm font-medium ml-1">
                  {totals.click.toLocaleString()} so'm
                </span>
              </div>
              <div className="bg-gray-100 rounded-lg p-2 inline-flex items-center">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                <span className="text-sm font-medium">Payme:</span>
                <span className="text-sm font-medium ml-1">
                  {totals.payme.toLocaleString()} so'm
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-80">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div style={chartContainerStyle} ref={chartRef}>
          {!selectedMonth && (
            <div className="text-center text-sm text-gray-500 mb-2">
              Kunlik ma'lumotlarni ko'rish uchun grafik ustiga bosing
            </div>
          )}
          <Chart options={chartOptions} series={chartData} type="area" height={320} />
        </div>
      )}
    </div>
  );
};

export default TolovlarChart;