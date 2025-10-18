import { useEffect, useState,useContext } from "react";
import { IntegrationContext } from "../../pages/Match";
import { useAuth } from "../../context/AuthContext";



export default function SkillGap() {
  const [data, setData] = useState<any[]>([]);
  const { integration } = useContext(IntegrationContext);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(integration.skillGap);
    setLoading(false);
  }, [integration]);

  if (loading)
    return <p className="text-center mt-20 text-gray-500">分析中...</p>;

  if (!user)
     return <p className="text-center mt-10 text-gray-500">ログインしてください。</p>;
  
  if (!data.length)
    return <p className="text-center mt-20 text-gray-500">
      スキルギャップはありません
    </p>;

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-gray-600 mb-4 text-sm">
        求人で需要が高いのにスキルレベルが低い技術を表示します。
      </p>

      <table className="table-auto w-full">
        <thead className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 bg-gray-50">
          <tr>
            <th className="p-2 text-left">スキル</th>
            <th className="p-2 text-right">求人需要</th>
            <th className="p-2 text-center">あなたのレベル</th>
            <th className="p-2 text-right text-red-500">ギャップスコア</th>
          </tr>
        </thead>
        <tbody className="text-sm divide-y divide-gray-100">
          {data.map((item: any) => (
            <tr key={item.skill} className="border-t">
              <td className="p-2">{item.skill}</td>
              <td className="p-2 text-right">{item.demand}</td>
              <td className="p-2 text-center">{item.level}</td>
              <td className="p-2 text-right font-semibold text-red-600">
                {item.gapScore}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
