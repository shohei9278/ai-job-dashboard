import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";



export default function SkillTrendRank() {
  const [skills, setSkills] = useState([]);
useEffect(() => {
  fetch("http://localhost:8080/api/trends/skill")
    .then(res => res.json())
    .then(data => setSkills(data))
    .catch(err => console.error("Trend fetch error:", err));
}, []);
  
  
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
            <th className="py-2 text-left">Skill</th>
            <th className="py-2 text-right">Trend Score</th>
            <th className="py-2 text-right">Jobs</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((s:any, i) => (
            <tr key={s.skill} className="border-b hover:bg-gray-100">
              <td className="py-1">{i + 1}</td>
              <td className="py-1 capitalize">{s.skill}</td>
              <td className="py-1 text-right text-green-600 font-semibold">
                +{s.trend_score.toFixed(2)}
              </td>
              <td className="py-1 text-right">{s.latest_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
