import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";

const TolovlarItogo = () => {
  const [paymentsData, setPaymentsData] = useState({
    total_so_m: 0,
    click: { count: 0, total_amount: 0 },
    payme: { count: 0, total_amount: 0 },
    monthly_data: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentsData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token yo'q!");
          setLoading(false);
          return;
        }

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
      } catch (error) {
        console.error("Payments ma'lumotlarini yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentsData();
  }, []);

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">To'lovlar</h3>
      {!loading && (
        <Chart options={pieChartOptions} series={pieChartData} type="donut" height={320} />
      )}
    </div>
  );
};

export default TolovlarItogo;