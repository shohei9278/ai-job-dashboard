import { useEffect, useState, useContext } from "react";
import { IntegrationContext } from "../../pages/Match";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { TrendingUp } from "lucide-react";

type SkillOverview = {
  matchRate: number;
  totalSkills: number;
  detail: { skill: string; jobCount: number }[];
};

export default function SkillMatchOverview() {
  const { user } = useAuth();
  const { integration } = useContext(IntegrationContext);
  const [data, setData] = useState<SkillOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (integration.skillOverview) {
      setData(integration.skillOverview);
      setLoading(false);
    }
  }, [integration]);

  if (loading)
    return <p className="text-center mt-20 text-gray-500">分析中...</p>;
  if (!user)
    return <p className="text-center mt-20 text-gray-500">ログインしてください</p>;
  if (!data)
    return <p className="text-center mt-20 text-gray-500">データが見つかりません</p>;

  // マッチ率に応じた色を自動判定
  const matchColor =
    data.matchRate >= 80
      ? "text-green-600"
      : data.matchRate >= 50
      ? "text-blue-600"
      : "text-orange-500";

  return (
    <div className="max-w-5xl mx-auto bg-white">
     

      {/* 全体スコア */}
      <div className="text-center mt-4 mb-4">
        <div className="inline-flex flex-col items-center justify-center bg-blue-50 rounded-full w-40 h-40 mx-auto border border-blue-100 shadow-inner">
          <p className={`text-5xl font-extrabold ${matchColor}`}>
            {data.matchRate}%
          </p>
          <p className="text-gray-600 text-sm font-medium mt-1">市場マッチ率</p>
        </div>
        <p className="text-gray-600 text-sm mt-4">
          登録スキルのうち{" "}
          <span className="font-semibold text-gray-800">
            {data.matchRate}%
          </span>{" "}
          が現在の求人データに含まれています。
        </p>
      </div>

      {/* スキル別出現数グラフ */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={20} className="text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-800">
            スキル別求人出現数
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.detail}
            margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
          >
            <XAxis
              dataKey="skill"
              angle={-15}
              textAnchor="end"
              tick={{ fontSize: 12, fill: "#4B5563" }}
            />
            <YAxis tick={{ fontSize: 12, fill: "#4B5563" }} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}
            />
            <Bar dataKey="jobCount" fill="#3b82f6" radius={[6, 6, 0, 0]}>
              <LabelList dataKey="jobCount" position="top" fill="#374151" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 補足情報 */}
      <div className="text-sm text-gray-500 text-center mt-4">
        総スキル数: {data.totalSkills} ｜ 分析日時: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
