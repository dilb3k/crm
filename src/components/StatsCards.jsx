import React, { useState, useEffect } from "react";

const StatsCards = () => {
  const [dashboardData, setDashboardData] = useState({
    server_time: "",
    Elonlar: { count: 0, change: "0 bugun" },
    Sotuvlar: { count: 0, growth_percent: "0%", change: "0 today" },
    Foyda: { count: "0 so'm", change: "0 so'm bugun" },
    Foydalanuvchilar: { count: 0, growth_percent: "0%", change: "0 bugun" }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
      } catch (error) {
        console.error("Dashboard ma'lumotlarini yuklashda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
  );
};

export default StatsCards;