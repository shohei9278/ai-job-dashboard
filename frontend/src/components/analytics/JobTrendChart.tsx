import { useEffect, useState } from "react";

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

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);


type TrendPoint = { collected_date: string; total_jobs: number };

export default function JobTrendChart() {
  const [data, setData] = useState<TrendPoint[]>([]);

  const [aiComment, setAiComment] = useState<string>("");
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    fetch(`${API_URL}/trends/actual`)
      .then((res) => res.json())
      .then((data) => {

        const normalized = data.map((actual: any) => ({
                ...actual,
                collected_date: actual.collected_date
            ? dayjs(actual.collected_date).tz('Asia/Tokyo').format('YYYY/MM/DD')
            : null,
        }));
        
        setData(normalized)
      }
    )
      .catch((err) => console.error("Trend fetch error:", err));
    
    const fetchComment = async () => {
      try {
        const res = await fetch(`${API_URL}/trends/summary`);
        const json = await res.json();
        setAiComment(json[0].summary || "コメント生成中...");
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
    <div className="bg-white  overflow-visible">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
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
