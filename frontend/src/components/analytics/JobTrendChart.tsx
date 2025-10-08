import React, { useEffect, useState } from "react";
import { JobsContext } from "../../pages/Dashboard";
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

type TrendPoint = { collected_date: string; total_jobs: number };

export default function JobTrendChart() {
  const [data, setData] = useState<TrendPoint[]>([]);

  const [aiComment, setAiComment] = useState<string>("");
  
  useEffect(() => {
    fetch("http://localhost:8080/api/trends/actual")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error("Trend fetch error:", err));
    
    const fetchComment = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/trends/summary");
        const json = await res.json();
        setAiComment(json.data[0].summary || "コメント生成中...");
      } catch {
        setAiComment("コメントの取得に失敗しました。");
      }
    };


    fetchComment();

  }, []);

  const prev = data[data.length - 2];
const latest = data[data.length - 1];
const diff = latest && prev ? latest.total_jobs - prev.total_jobs : 0;

  return (
    <div className="bg-white p-4  overflow-visible">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 40, left: 50, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="collected_date"
            tick={{ fontSize: 12 }}
            tickMargin={10}
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(v) => v.toLocaleString()} 
          />
          <Tooltip formatter={(v: number) => `${v.toLocaleString()} 件`} />
          <Legend verticalAlign="top" height={36} />

          <Line
            type="monotone"
            dataKey="total_jobs"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="実測値"
          />
        </LineChart>
      </ResponsiveContainer>

{latest && (
  <div className="mt-2 text-sm text-gray-700 text-right">
    最新日：<strong>{latest.collected_date}</strong> ／
    求人数：<strong className="text-blue-600">{latest.total_jobs}</strong> 件
    （前日比 {diff > 0 ? "+" + diff : diff} 件）
  </div>
      )}
      
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
