import { useEffect, useState, useContext } from "react";
import { JobsContext } from "../../pages/Skills";
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

export default function SkillRankingChart() {
  const [data, setData] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

const { jobs } = useContext(JobsContext) as { jobs: any[] };

  useEffect(() => {

     if (!jobs || jobs.length === 0) return;
    const skillCount: Record<string, number> = {};

        jobs.forEach((job: any) => {
          if (job.skills) {
            const skills = Array.isArray(job.skills)
              ? job.skills
              : job.skills
              ? job.skills.split(/\s+/).map((s: string) => s.replace(/^#/, "").trim())
              : [];

            skills.forEach((s: string) => {
              if (s) skillCount[s] = (skillCount[s] || 0) + 1;
            });
          }
        });

        // Top10抽出
        const formatted = Object.entries(skillCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name, count }));

        setData(formatted);
        setLoading(false);
  }, [jobs]);

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
    <div className="bg-white">


      {loading ? (
        <p className="text-gray-500 text-center">読み込み中...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500 text-center">データがありません。</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 20, left: 50, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              label={{
                value: "出現数（件）",
                position: "insideBottomRight",
                offset: -5,
                fontSize: 12,
              }}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              formatter={(v: number) => [`${v} 件`, "出現数"]}
              contentStyle={{ fontSize: "13px" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
              <LabelList
                dataKey="count"
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
