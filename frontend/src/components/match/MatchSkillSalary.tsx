import { useEffect, useState, useContext } from "react";
import { IntegrationContext } from "../../pages/Match";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, TrendingUp } from "lucide-react";

type SalarySim = {
  averageSalary: number;
  matchedJobs: number;
  salaryRange: { max: number; min: number };
};

export default function SalarySimulation() {
  const { user } = useAuth();
  const { integration } = useContext(IntegrationContext);
  const [data, setData] = useState<SalarySim | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (integration.salarySim) {
      setData(integration.salarySim);
      setLoading(false);
    }
  }, [integration]);

  if (loading)
    return <p className="text-center mt-20 text-gray-500">分析中...</p>;
  if (!user)
    return <p className="text-center mt-20 text-gray-500">ログインしてください</p>;
  if (!data)
    return <p className="text-center mt-20 text-gray-500">データが見つかりません</p>;

  // 年収レンジをゲージ的に見せる
  const salaryMid = (data.salaryRange.min + data.salaryRange.max) / 2;
  const salaryPercent = Math.min(
    100,
    Math.round((data.averageSalary / data.salaryRange.max) * 100)
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 ">


      {/* 統計データ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <Briefcase className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-gray-600 text-sm">関連求人数</p>
          <p className="text-2xl font-bold text-blue-700">
            {data.matchedJobs.toLocaleString()} 件
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-xl border border-green-100">
          <TrendingUp className="mx-auto mb-2 text-green-600" size={24} />
          <p className="text-gray-600 text-sm">平均年収推定</p>
          <p className="text-2xl font-bold text-green-700">
            {data.averageSalary.toLocaleString()} 円
          </p>
        </div>
      </div>

      {/* ゲージ風レンジバー */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-1">
          想定年収レンジ：
          <span className="font-semibold text-gray-800">
            {data.salaryRange.min.toLocaleString()}円
          </span>{" "}
          〜{" "}
          <span className="font-semibold text-gray-800">
            {data.salaryRange.max.toLocaleString()}円
          </span>
        </p>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-green-500 transition-all duration-500"
            style={{ width: `${salaryPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">
          平均値付近：{salaryMid.toLocaleString()}円
        </p>
      </div>

      {/* 補足情報 */}
      <p className="mt-6 text-sm text-gray-500 text-center border-t pt-4">
        ※あなたの登録スキルと求人データの一致率に基づいた概算シミュレーションです。
      </p>
    </div>
  );
}
