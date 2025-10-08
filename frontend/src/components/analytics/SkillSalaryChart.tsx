import React, { useEffect, useState, useContext } from "react";
import { JobsContext } from "../../pages/Dashboard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

export default function SkillSalaryChart() {
  const [data, setData] = useState<{ skill: string; avg: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const jobs = useContext(JobsContext);


  useEffect(() => {
    const skillSalaries: Record<string, number[]> = {};

        jobs.forEach((job: any) => {
          // スキル整形
          let skills: string[] = [];
          if (Array.isArray(job.skills)) {
            skills = job.skills.map((s: string) => s.replace(/^#/, "").trim());
          } else if (typeof job.skills === "string") {
            skills = job.skills
              .split(/\s+/)
              .map((s: string) => s.replace(/^#/, "").trim());
          }

          // 各スキルごとに年収格納
          skills.forEach((s) => {
            if (!skillSalaries[s]) skillSalaries[s] = [];
            if (typeof job.salary === "number" && job.salary > 0) {
              skillSalaries[s].push(job.salary / 10000); // 万円換算
            }
          });
        });

        // 平均計算
        const avgData = Object.entries(skillSalaries)
          .map(([skill, list]) => {
            if (!list.length) return null;
            const avg = Math.round(
              list.reduce((a, b) => a + b, 0) / list.length
            );
            return { skill, avg };
          })
          .filter(
            (item): item is { skill: string; avg: number } => item !== null
          )
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 10);

        setData(avgData);
        setLoading(false);

  }, [jobs]);

  // 🔹 カラースケール（上位ほど濃い）
  const colors = [
    "#2563eb",
    "#3b82f6",
    "#60a5fa",
    "#93c5fd",
    "#bfdbfe",
    "#93c5fd",
    "#60a5fa",
    "#3b82f6",
    "#2563eb",
    "#1e40af",
  ];

  return (
    <div className="bg-white  p-4">

      {loading ? (
        <p className="text-gray-500 text-center">読み込み中...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500 text-center">データがありません。</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 80, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis type="number" tick={{ fontSize: 12 }}>
              <text
                x={0}
                y={0}
                dx={250}
                dy={290}
                textAnchor="middle"
                fontSize={12}
                fill="#555"
              >
                平均年収（万円）
              </text>
            </XAxis>
            <YAxis
              dataKey="skill"
              type="category"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              formatter={(v: number) => [`${v}万円`, "平均年収"]}
              contentStyle={{ fontSize: "13px" }}
            />
            <Bar dataKey="avg" name="平均年収（万円）">
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
              <LabelList
                dataKey="avg"
                position="right"
                style={{ fontSize: 12, fill: "#333" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
