import { useEffect, useState,useContext } from "react";
import { JobsContext } from "../../pages/Forecast";
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


export default function JobTrendForecastChart() {
  const { integration } = useContext(JobsContext);
  const [forecastData, setForecastData] = useState<any[]>([]);



  useEffect(() => {

    if (!integration?.forecast) return;
  
    const forecast = integration.forecast.map((d: any) => ({
          date: dayjs(d.date).utc(d.date).format('YYYY/MM/DD'),
          forecast: d.predicted_count,
          lower: d.lower_bound,
          upper: d.upper_bound,
        }));

        setForecastData(forecast);

 
  }, [integration]);

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

     

    </div>
  );
}
