"use client";

import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Generate sample data for last 24 hours
function generateTrendData() {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, "0") + ":00";
    // Simulate realistic AQI and Water Quality trends
    const aqi = 50 + Math.sin(i / 4) * 30 + Math.random() * 10;
    const waterQuality = 60 + Math.cos(i / 3) * 25 + Math.random() * 8;
    hours.push({
      time: hour,
      aqi: Math.round(aqi),
      waterQuality: Math.round(waterQuality),
    });
  }
  return hours;
}

export function EnvironmentalTrendsChart() {
  const data = generateTrendData();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900">Live Environmental Trends</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Real-time AQI and Water Quality Monitoring (Last 24h)
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: "#71717a" }}
              tickFormatter={(value) => {
                // Show only every 4th hour for readability
                const hour = parseInt(value.split(":")[0]);
                return hour % 4 === 0 ? value : "";
              }}
            />
            <YAxis tick={{ fontSize: 12, fill: "#71717a" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e4e4e7",
                borderRadius: "6px",
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-zinc-700">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="waterQuality"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              name="AQI"
            />
            <Line
              type="monotone"
              dataKey="waterQuality"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name="Water Quality"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

