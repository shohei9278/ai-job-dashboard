import { useEffect, useState,useContext } from "react";
import { JobsContext } from "../../pages/Skills";

export default function SkillTrendRank() {
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

return (
    <div className="p-4 w-[100%]">
      <table className="table-auto w-full">
        <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50">
          <tr className="border-b  border-gray-100 bg-gray-50">
            <th className="py-1 text-left w-10 text-gray-800">#</th>
            <th className="py-1 text-left  text-gray-800">スキル名</th>
            <th className="py-1 text-right  text-gray-800">需要指標</th>
            <th className="py-1 text-right  text-gray-800">新着求人数</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100">
          {skills.map((s:any, i) => (
            <tr key={s.skill} className="border-b  border-gray-100 hover:bg-gray-100">
              <td className="py-1 text-gray-500 font-medium">{i + 1}</td>
              <td className="py-1 text-gray-800 font-medium">{s.skill}</td>
              <td className={`font-semibold text-right ${
                  s.trend_score >= 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}>
                {s.trend_score <= 0 ? (""): ("+")}{s.trend_score}
              </td>
              <td className="py-1 text-right  text-gray-800">{s.latest_count}</td>
            </tr>
          ))}
        </tbody>
    </table>
    </div>
  );
}
