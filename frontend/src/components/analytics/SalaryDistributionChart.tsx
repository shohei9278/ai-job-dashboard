import React, { useEffect, useState,useContext } from "react";
import { JobsContext } from "../../pages/Dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

export default function SalaryDistributionChart() {
  const [salaryData, setSalaryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const jobs = useContext(JobsContext);

  useEffect(() => {
    const salaries = jobs
          .filter((job: any) => typeof job.salary === "number" && job.salary > 0)
          .map((job: any) => Math.round(job.salary / 10000));

        // 年収区分（万円単位）
        const buckets = [0, 400, 600, 800, 1000, 1200, 1500, 2000];
        const salaryDist = buckets
          .map((b, i) => {
            const next = buckets[i + 1];
            if (!next) {
              const count = salaries.filter((s:any) => s >= b).length;
              return { range: `${b}万円以上`, count };
            }
            const count = salaries.filter((s:any) => s >= b && s < next).length;
            return { range: `${b}-${next}万円`, count };
          })
          .filter((b): b is { range: string; count: number } => b !== null);

        setSalaryData(salaryDist);
        setLoading(false);
  }, [jobs]);

  return (
    <div className="bg-white">

      {loading ? (
        <p className="text-gray-500 text-center">読み込み中...</p>
      ) : salaryData.length === 0 ? (
        <p className="text-gray-500 text-center">データがありません。</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salaryData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis
              dataKey="range"
              tick={{ fontSize: 12 }}
              angle={-20}
              textAnchor="end"
              interval={0}
            >
         
            </XAxis>
            <YAxis tick={{ fontSize: 10 }}>
              <Label angle={0} position="insideLeft" offset={-5} />
            </YAxis>
            <Tooltip
              formatter={(value: number) => [`${value}件`, "求人数"]}
              contentStyle={{ fontSize: "13px" }}
            />
            <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
