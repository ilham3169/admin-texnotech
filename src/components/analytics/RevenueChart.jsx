import { useEffect, useState } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const RevenueChart = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/google-api/search-console/impressions-by-date")
      .then((res) => {
        setChartData(res.data); // Assuming your API returns array of { date: '2025-04-01', impressions: 123 }
      })
      .catch((err) => {
        console.error("Failed to fetch Search Console data", err);
      });
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <h2 className="text-xl text-white mb-4">Search Console Impressions</h2>
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Area type="monotone" dataKey="impressions" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
