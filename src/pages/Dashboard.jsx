import React from "react";
import StatsCards from "../components/StatsCards";
import TolovlarChart from "../components/TolovlarChart";
import ElonlarChart from "../components/ElonlarChart";
import TolovlarItogo from "../components/TolovlarItogo";

const Dashboard = () => {
    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            {/* Stats Cards */}
            <StatsCards />

            {/* Line Chart - Payments */}
            <TolovlarChart />

            {/* Bottom Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart - Monthly Ads */}
                <ElonlarChart />

                {/* Pie Chart - Payment Distribution */}
                <TolovlarItogo />
            </div>
        </div>
    );
};

export default Dashboard;