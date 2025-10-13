
import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState,useContext } from "react";
import { JobsContext } from "../../pages/Dashboard";

export default function SkillTop3() {

   const { integration } = useContext(JobsContext);
  const [skills, setSkills] = useState<any[]>([]);

  useEffect(() => {
    if (!integration.skills || integration.skills.length === 0) return;
    setSkills(integration.skills)
}, [integration]);
  
  
   if (skills.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border">
        データ不足により予測データが作成できませんでした。
        <br />
        求人データがあと数日分収集されるとここに表示されます。
      </div>
    );
   }  
  // 上位3件だけ抽出
  const topSkills = integration.skills
    ?.sort((a, b) => b.trend_score - a.trend_score)
    .slice(0, 5);

  return (
    <div className="bg-white p-4">
      {topSkills && topSkills.length > 0 ? (
        <ul className="space-y-2">
          {topSkills.map((item) => (
            <li
              key={item.skill}
              className="flex items-center justify-between border-b border-gray-100  last:border-none pb-1"
            >
              <div className="flex items-center gap-2">
                {item.trend_score >= 0 ? (
                  <TrendingUp className="text-green-500" size={16} />
                ) : (
                  <TrendingDown className="text-red-500" size={16} />
                )}
                <span className="text-gray-700 font-medium">{item.skill}</span>
              </div>
              <span
                className={`font-semibold ${
                  item.trend_score >= 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {item.trend_score >= 0 ? "+" : ""}
                {item.trend_score}%
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">データがありません</p>
      )}
    </div>
  );
}
