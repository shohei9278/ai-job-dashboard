import  { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function JobTrendForecastChart() {
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [aiComment, setAiComment] = useState<string>("");

  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchData = async () => {
      try {
        
        const forecastRes = await fetch(`${API_URL}/api/trends/forecast`);
        const forecastJson = await forecastRes.json();

        const forecast = forecastJson.map((d: any) => ({
          date: d.date,
          forecast: d.predicted_count,
          lower: d.lower_bound,
          upper: d.upper_bound,
        }));

        setForecastData(forecast);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    const fetchComment = async () => {
      try {
        
        const res = await fetch(`${API_URL}/api/trends/insight`);
        const json = await res.json();
        setAiComment(json.data[0].summary || "コメント生成中...");
      } catch {
        setAiComment("コメントの取得に失敗しました。");
      }
    };

    fetchData();
    fetchComment();
  }, []);

  return (
    <div className="bg-white overflow-visible">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={forecastData}
          margin={{ top: 20, right: 10, left: 0, bottom: 50 }} 
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickMargin={10} 
            angle={-30} 
            textAnchor="end"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickMargin={10} 
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />

          {/* 予測値（オレンジ点線） */}
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#f97316"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={{ r: 3 }}
            name="予測値"
          />

          {/* 信頼区間（上下）を少しグレーで可視化 */}
          <Line
            type="monotone"
            dataKey="upper"
            stroke="#fcd34d"
            strokeWidth={1}
            dot={false}
            name="上限"
          />
          <Line
            type="monotone"
            dataKey="lower"
            stroke="#94a3b8"
            strokeWidth={1}
            dot={false}
            name="下限"
          />
        </LineChart>
      </ResponsiveContainer>

      {aiComment && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-gray-800 text-sm leading-relaxed">
            💬 <strong>AIコメント：</strong> {aiComment}
          </p>
        </div>
      )}
    </div>
  );
}
