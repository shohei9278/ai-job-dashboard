import { useEffect, useState,useContext } from "react";
import { JobsContext } from "../../pages/Dashboard";
import Comment from "../common/Comment";

export default function SkillTrendRank() {
  const { integration } = useContext(JobsContext);
  const [skills, setSkills] = useState<any[]>([]);


  
  useEffect(() => {
    if (!integration.skills || integration.skills.length === 0) return;
    console.log(integration.ai.trend_score_summary);
    
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
    <div className="p-6 max-w-3xl mx-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="py-2 text-left w-10">#</th>
            <th className="py-2 text-left">スキル名</th>
            <th className="py-2 text-right">需要指標</th>
            <th className="py-2 text-right">新着求人数</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s:any, i) => (
            <tr key={s.skill} className="border-b hover:bg-gray-100">
              <td className="py-1">{i + 1}</td>
              <td className="py-1 capitalize">{s.skill}</td>
              <td className="py-1 text-right text-green-600 font-semibold">
                {s.trend_score <= 0 ? (""): ("+")}{s.trend_score.toFixed(2)}
              </td>
              <td className="py-1 text-right">{s.latest_count}</td>
            </tr>
          ))}
        </tbody>
    </table>
    <Comment comment={integration.ai.trend_score_summary} />
    </div>
  );
}
