import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [likeTimeline, setLikeTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [statsRes, videosRes, likesTimeRes] = await Promise.all([
          axios.get("http://localhost:8000/api/v1/dashboard/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/v1/dashboard/videos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:8000/api/v1/dashboard/timeline", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats(statsRes.data.data);
        setVideos(videosRes.data.data);
        setLikeTimeline(
          likesTimeRes.data.data.map((entry) => ({
            time: new Date(entry.time).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            Likes: 1,
          }))
        );
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const barData = videos.map((video) => ({
    name: video.title,
    Views: video.view,
    Likes: video.likeCount || 0,
  }));

  if (loading || !stats) return <div className="text-white p-4">Please login to view dashboard</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white px-4 md:px-8 py-6">
      <h1 className="text-4xl font-extrabold mb-8 text-center">📊 Channel Insights</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
        <StatCard title="Total Videos" value={stats.totalVideos} color="bg-sky-600" />
        <StatCard title="Subscribers" value={stats.totalSubscribers} color="bg-emerald-600" />
        <StatCard title="Video Likes" value={stats.totalVideoLikes} color="bg-rose-600" />
        <StatCard title="Tweet Likes" value={stats.totalTweetLikes} color="bg-fuchsia-600" />
        <StatCard title="Total Views" value={stats.totalViews} color="bg-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ChartCard title="📈 Most Viewed & Liked Videos">
          <BarChart layout="vertical" data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Views" fill="#38bdf8">
              <LabelList dataKey="Views" position="right" />
            </Bar>
            <Bar dataKey="Likes" fill="#f43f5e">
              <LabelList dataKey="Likes" position="right" />
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="📅 Views by Publish Date">
          <LineChart
            data={videos.map((video) => ({
              date: new Date(video.createdAt).toLocaleDateString(),
              Views: video.view,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="Views" stroke="#34d399" strokeWidth={2} />
          </LineChart>
        </ChartCard>

        <ChartCard title="🧁 Views Distribution">
          <PieChart>
            <Pie
              data={barData}
              dataKey="Views"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={({ name, percent, x, y }) => (
                <text
                  x={x}
                  y={y}
                  fill="#ffffff"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                >
                  {`${name} ${(percent * 100).toFixed(0)}%`}
                </text>
              )}
            >
              {barData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1"][index % 5]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                color: "#ffffff",
              }}
              labelStyle={{ color: "#ffffff" }}
              itemStyle={{ color: "#ffffff" }}
            />
          </PieChart>
        </ChartCard>

        <ChartCard title="📊 Engagement Over Time">
          <AreaChart
            data={videos.map((video) => ({
              date: new Date(video.createdAt).toLocaleDateString(),
              Engagement: video.view + (video.likeCount || 0),
            }))}
          >
            <defs>
              <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="Engagement"
              stroke="#6366f1"
              fillOpacity={1}
              fill="url(#colorEngagement)"
            />
          </AreaChart>
        </ChartCard>

        <ChartCard title="⏱️ Likes by Time of Day">
          <LineChart data={aggregateLikesByTime(likeTimeline)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="Likes" stroke="#f97316" strokeWidth={2} />
          </LineChart>
        </ChartCard>
        {/* ⬇️ Paste your histogram and table below this */}



{/* Table - Video Summary */}
<div className="bg-[#1e293b] text-white rounded-xl shadow p-6 mt-10 overflow-x-auto">
  <h2 className="text-2xl font-semibold mb-4">📋 Video Summary Table</h2>
  <table className="min-w-full text-sm text-left">
    <thead>
      <tr className="bg-[#334155] text-white">
        <th className="py-2 px-4">Title</th>
        <th className="py-2 px-4">Likes</th>
        <th className="py-2 px-4">Views</th>
      </tr>
    </thead>
    <tbody>
      {videos.map((video) => (
        <tr key={video._id} className="border-t border-gray-700 hover:bg-[#475569]">
          <td className="py-2 px-4">{video.title}</td>
          <td className="py-2 px-4">{video.likeCount || 0}</td>
          <td className="py-2 px-4">{video.view}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color }) => (
  <div className={`p-4 rounded-xl shadow-md text-white ${color}`}>
    <p className="text-sm font-medium opacity-90">{title}</p>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-4 shadow-lg dark:bg-slate-800 h-[400px] w-full">
    <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{title}</h2>
    <ResponsiveContainer width="100%" height="85%">{children}</ResponsiveContainer>
  </div>
);

const aggregateLikesByTime = (data) => {
  const map = new Map();
  for (const item of data) {
    map.set(item.time, (map.get(item.time) || 0) + 1);
  }
  return Array.from(map, ([time, Likes]) => ({ time, Likes }));
};
const ChartSection = ({ title, children, height }) => (
  <div className="mt-12">
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <div className={`w-full h-[${height}px] bg-white rounded-xl p-4`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);
export default Dashboard;