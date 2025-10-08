import React, { useEffect, useState,useContext } from "react";
import { JobsContext } from "../../pages/Dashboard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function SkillTrendChart() {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Python", "React"]);
  const jobs = useContext(JobsContext);
  
  useEffect(() => {
     const trendMap: Record<string, Record<string, number[]>> = {};

        jobs.forEach((job: any) => {
          if (!job.salary || !job.skills || !job.created_at) return;
          const month = job.created_at.slice(0, 7);
          const skills = Array.isArray(job.skills)
            ? job.skills
            : job.skills.split(/\s+/).map((s: string) => s.replace(/^#/, ""));

          skills.forEach((s:any) => {
            if (!selectedSkills.includes(s)) return; // 選択スキルのみ対象
            if (!trendMap[s]) trendMap[s] = {};
            if (!trendMap[s][month]) trendMap[s][month] = [];
            trendMap[s][month].push(job.salary / 10000);
          });
        });

    
        const months = Array.from(
          new Set(Object.values(trendMap).flatMap((m) => Object.keys(m)))
        ).sort();

        const trendArray = months.map((m) => {
          const entry: any = { month: m };
          selectedSkills.forEach((skill) => {
            const list = trendMap[skill]?.[m];
            entry[skill] = list ? Math.round(list.reduce((a, b) => a + b, 0) / list.length) : null;
          });
          return entry;
        });

        setTrendData(trendArray);
  }, [selectedSkills,jobs]);

  return (
    <div className="bg-white  p-4">
 

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(v) => `${v} 万円`} />
          <Legend />

          {selectedSkills.map((skill, idx) => (
            <Line
              key={skill}
              type="monotone"
              dataKey={skill}
              stroke={["#2563eb", "#f97316", "#16a34a", "#9333ea"][idx % 4]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* スキル選択チェックボックス */}
      <div className="flex gap-4 mt-4">
        {["Python", "React", "AWS", "TypeScript", "AI"].map((s) => (
          <label key={s} className="cursor-pointer flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={selectedSkills.includes(s)}
              onChange={(e) =>
                setSelectedSkills((prev) =>
                  e.target.checked
                    ? [...prev, s]
                    : prev.filter((x) => x !== s)
                )
              }
            />
            {s}
          </label>
        ))}
      </div>
    </div>
  );
}
