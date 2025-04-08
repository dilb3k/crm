import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const TolovlarItogo = () => {
  const [advertisementData, setAdvertisementData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvertisementData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token yo'q!");
          setLoading(false);
          return;
        }

        // Fetch advertisement payments data
        const advertisementResponse = await fetch("https://fast.uysavdo.com/api/v1/adminka/payments/advertisements", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (!advertisementResponse.ok) {
          throw new Error(`Advertisement Payments API xatolik qaytardi: ${advertisementResponse.status}`);
        }

        const advertisementResult = await advertisementResponse.json();
        setAdvertisementData(advertisementResult);
      } catch (error) {
        console.error("Payments ma'lumotlarini yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisementData();
  }, []);

  // Calculate total Click and Payme values from advertisement data
  const calculateTotals = () => {
    if (!advertisementData || Object.keys(advertisementData).length === 0) {
      return { clickTotal: 0, paymeTotal: 0, total: 0 };
    }

    // Reduce all monthly values into totals
    const { clickTotal, paymeTotal } = Object.values(advertisementData).reduce(
      (acc, month) => {
        acc.clickTotal += month.Click || 0;
        acc.paymeTotal += month.Payme || 0;
        return acc;
      },
      { clickTotal: 0, paymeTotal: 0 }
    );

    const total = clickTotal + paymeTotal;
    return { clickTotal, paymeTotal, total };
  };

  // Format number with spaces for thousands and add 'som' suffix
  const formatNumberWithSpaces = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "som";
  };

  // Get chart data as two segments for CLICK and Payme
  const getChartData = () => {
    const { clickTotal, paymeTotal } = calculateTotals();
    // Return array of values for the pie chart segments
    return [paymeTotal, clickTotal];
  };

  // Get the current month name
  const getCurrentMonth = () => {
    const date = new Date();
    return date.toLocaleString('default', { month: 'short' }) + date.getFullYear().toString().substr(-2);
  };

  // Chart options with tooltips
  const chartOptions = {
    chart: {
      fontFamily: 'Inter, sans-serif',
      toolbar: {
        show: false
      },
      animations: {
        enabled: false
      },
      background: "#ffffff"
    },
    colors: ["#10b981", "#6366f1"], // Green for Payme, Blue for CLICK
    labels: ["Payme", "CLICK"],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 12
      },
      itemMargin: {
        horizontal: 20
      }
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        customScale: 1,
        donut: {
          size: '75%',
          background: 'transparent',
          labels: {
            show: false
          }
        }
      }
    },
    stroke: {
      width: 0
    },
    tooltip: {
      enabled: true,
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const { clickTotal, paymeTotal } = calculateTotals();
        const values = [paymeTotal, clickTotal];
        const labels = ["Payme", "CLICK"];
        const colors = ["#10b981", "#6366f1"];
        
        // Current month
        const currentMonth = getCurrentMonth();
        
        return `
          <div class="custom-tooltip" style="
            background: #f8f9fa; 
            padding: 8px 12px; 
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid ${colors[seriesIndex]};
            min-width: 150px;
            font-family: Inter, sans-serif;
          ">
            <div style="color: #6c757d; font-size: 12px; margin-bottom: 4px;">${currentMonth}</div>
            <div style="display: flex; align-items: center; margin-bottom: 2px;">
              <span style="
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background-color: ${colors[seriesIndex]};
                margin-right: 8px;
              "></span>
              <span style="font-weight: 500; color: #333;">${labels[seriesIndex]}:</span>
              <span style="font-weight: 600; margin-left: 5px; color: #333;">${values[seriesIndex].toLocaleString()}</span>
            </div>
          </div>
        `;
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 280
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">To'lovlar</h3>
      {!loading && (
        <div>
          <div style={{ 
            position: "relative", 
            height: "280px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {/* The chart */}
            <div style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              width: "100%", 
              height: "100%"
            }}>
              <Chart
                options={chartOptions}
                series={getChartData()}
                type="donut"
                height="100%"
                width="100%"
              />
            </div>
            
            {/* Centered text - positioned absolutely */}
            <div style={{
              position: "absolute",
              zIndex: 10,
              textAlign: "center"
            }}>
              <div style={{
                fontSize: "22px",
                fontWeight: "500",
                color: "#333333",
                whiteSpace: "nowrap"
              }}>
                {formatNumberWithSpaces(calculateTotals().total)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TolovlarItogo;