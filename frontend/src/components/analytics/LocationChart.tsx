import React, { useState, useMemo, useContext } from "react";
import { JobsContext } from "../../pages/Dashboard";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleSequential } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";


const JAPAN_TOPO_URL =
  "https://raw.githubusercontent.com/dataofjapan/land/master/japan.topojson";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#9ca3af"];

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

// 地図コンポーネント 
const JobMap = React.memo(({ countData }: { countData: Record<string, number> }) => {
  const [tooltip, setTooltip] = useState<{ name: string; count: number } | null>(null);
  const maxCount = Math.max(...Object.values(countData), 0);
  const colorScale = scaleSequential(interpolateYlOrRd).domain([0, maxCount || 50]);

  return (
    <div className="relative bg-[#eef3f7] rounded-lg p-2 flex justify-center items-center">
      <ComposableMap
        projection="geoMercator"
        width={700}
        height={400}
        projectionConfig={{ scale: 800, center: [137, 38] }}
      >
        <ZoomableGroup center={[137, 38]} zoom={1}>
          <Geographies geography={JAPAN_TOPO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                const name = geo.properties.nam_ja;
                const count = countData[name] || 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={count > 0 ? colorScale(count) : "#EEE"}
                    stroke="#555"
                    strokeWidth={0.3}
                    onMouseEnter={() => setTooltip({ name, count })}
                    onMouseLeave={() => setTooltip(null)}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#3b82f6", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div className="absolute top-3 right-3 bg-white border rounded-lg p-2 text-sm shadow-md">
          <strong>{tooltip.name}</strong>
          <br />
          求人数：{tooltip.count} 件
        </div>
      )}
    </div>
  );
});

// 円グラフコンポーネント 
const JobPieChart = React.memo(({ data }: { data: { name: string; value: number }[] }) => {
  const displayData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const top5 = sorted.slice(0, 5);
    const others = sorted.slice(5);
    const otherSum = others.reduce((sum, d) => sum + d.value, 0);
    return others.length > 0 ? [...top5, { name: "その他", value: otherSum }] : top5;
  }, [data]);

  return (
    <>
      <h3 className="font-semibold text-gray-800 mb-3">上位地域シェア</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={displayData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(Number(percent) * 100).toFixed(1)}%`
            }
          >
            {displayData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => `${v.toLocaleString()}件`} />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
});

// ランキングリスト（ページネーション独立） 
const RankingList = React.memo(({ ranking }: { ranking: { name: string; count: number }[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(ranking.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentRanking = ranking.slice(startIdx, startIdx + itemsPerPage);

  const getRankNumber = (i: number) => (currentPage - 1) * itemsPerPage + i;

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <>
      <h3 className="font-semibold text-gray-800 mb-2">地域別求人数</h3>
      <ul className="divide-y divide-gray-200 text-sm min-h-[400px]">
        {currentRanking.map(({ name, count }, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center py-2 px-2 hover:bg-gray-50 transition"
          >
            <span className="flex items-center gap-2">
              <span className="text-gray-400 w-5 text-right">{getRankNumber(idx + 1)}</span>
              {name}
            </span>
            <span className="text-gray-700 font-medium">{count} 件</span>
          </li>
        ))}
      </ul>

      {/* ページネーション */}
      <div className="flex flex-wrap justify-center items-center gap-2 mt-4">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="cursor-pointer px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ←
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`cursor-pointer px-3 py-1 border rounded transition ${
              page === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="cursor-pointer px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          →
        </button>
      </div>
    </>
  );
});

// メイン 
export default function LocationPieChart() {
const { jobs } = useContext(JobsContext) as { jobs: any[] };


  const { countData, ranking, pieData } = useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach((job: any) => {
      const pref = PREFECTURES.find((p) => job.location?.includes(p));
      if (pref) map[pref] = (map[pref] || 0) + 1;
    });
    const ranking = Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const pieData = ranking.map(({ name, count }) => ({
      name: name.replace(/[都府県道]/g, ""),
      value: count,
    }));
    return { countData: map, ranking, pieData };
  }, [jobs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 p-6">
      <div className="col-span-1 md:col-span-2 lg:col-span-6">
        <JobMap countData={countData} />
      </div>

      <div className="col-span-1 md:col-span-2 lg:col-span-6 space-y-6">
        <JobPieChart data={pieData} />
        <RankingList ranking={ranking} />
      </div>
    </div>
  );
}
