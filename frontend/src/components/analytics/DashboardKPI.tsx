import { useContext, useState, useEffect  } from "react";
import { JobsContext } from "../../pages/Dashboard";

  const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"
  ];


export default function DashboardKPI()
{
  const [countData, setCountData] = useState<Record<string, number>>({});
  const [avgSalary, setAvgSalary] = useState(0);
  const [ranking, setRanking] = useState<{ name: string; count: number }[]>([]);
  const [topSkill, setTopSkill] = useState("データなし");

  const { jobs } = useContext(JobsContext) as { jobs: any[] };


  
 const map: Record<string, number> = {};
  const skillCount: Record<string, number> = {};
  let totalSalary = 0;
  let salaryCount = 0;



  useEffect(() => {

    if (!jobs || jobs.length === 0) return;

      jobs.forEach((job: any) => {
          // 都道府県カウント
          const pref = PREFECTURES.find((p) => job.location?.includes(p));
          if (pref) map[pref] = (map[pref] || 0) + 1;

          // 年収平均
          if (job.salary) {
            totalSalary += job.salary;
            salaryCount++;
          }

          // スキル出現数
          if (job.skills) {
            const skills = Array.isArray(job.skills)
              ? job.skills
              : job.skills.split(/\s+/).map((s: string) => s.replace(/^#/, ""));
            skills.forEach((s: string) => {
              if (s) skillCount[s] = (skillCount[s] || 0) + 1;
            });
          }
  });
    
        setCountData(map);
        setAvgSalary(Math.round(totalSalary / salaryCount / 10000));

        const sorted = Object.entries(map)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);
        setRanking(sorted);

        // 人気スキルTop1
        const top = Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0];
        setTopSkill(top ? top[0] : "データなし");
        
  

    }, [jobs]);


        const totalJobs = Object.values(countData).reduce((a, b) => a + b, 0);
       const topPref = ranking[0]?.name || "データなし";
  

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* 総求人数 */}
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <p className="text-sm text-gray-500">総求人数</p>
        <h2 className="text-2xl font-bold text-blue-600">
          {totalJobs.toLocaleString()} 件
        </h2>
      </div>

      {/* 平均年収 */}
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <p className="text-sm text-gray-500">平均年収</p>
        <h2 className="text-2xl font-bold text-green-600">
          {avgSalary} 万円
        </h2>
      </div>

      {/* 人気スキル */}
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <p className="text-sm text-gray-500">人気スキル</p>
        <h2 className="text-2xl font-bold text-orange-600">
          {topSkill || "データなし"}
        </h2>
      </div>

      {/* 求人数最多エリア */}
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <p className="text-sm text-gray-500">求人数最多エリア</p>
        <h2 className="text-2xl font-bold text-purple-600">
          {topPref || "データなし"}
        </h2>
      </div>
    </div>
  );
}
