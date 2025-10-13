import { useEffect,useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
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


export default function RegionRanking() {
  const { jobs } = useContext(JobsContext) as { jobs: any[] };
  const [rankingData, setRnkingData] = useState<any[]>([]);


  useEffect(() => {
      
    if (!jobs || jobs.length === 0) return;
    
    const map: Record<string, number> = {};

    jobs.forEach((job: any) => {
      const pref = PREFECTURES.find((p) => job.location?.includes(p));
      if (pref) map[pref] = (map[pref] || 0) + 1;
    });
    const ranking = Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);
    
     setRnkingData(ranking)
  }, [jobs]);
  

  return (
    <div className="bg-white p-4">

      <ul className="space-y-1">
        {rankingData.map((p, i) => (
          <li
            key={p.name}
            className="flex justify-between items-center text-sm  border-b border-gray-100 last:border-none py-1 mb-2 last:mb-0"
          >
            <span className="flex items-center gap-2">
              <span className="text-gray-500 font-medium w-5 text-right">{i + 1}.</span>
              <span className="font-medium text-gray-800">{p.name}</span>
            </span>
            <span className="text-gray-600">{p.count.toLocaleString()} 件</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
