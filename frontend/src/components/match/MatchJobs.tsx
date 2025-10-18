import { useEffect, useState, useContext } from "react";
import { IntegrationContext } from "../../pages/Match";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, Target } from "lucide-react";



export default function MatchJobs() {
  const { integration } = useContext(IntegrationContext);
  const { user } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    setJobs(integration.matchedJobs);
    setLoading(false);
  }, [integration]);

  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentJobs = jobs.slice(startIdx, startIdx + itemsPerPage);

  const getPageNumbers = () => {
    const pages = [];
    const maxButtons = 7;
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">読み込み中...</p>;

  if (!user)
    return <p className="text-center mt-10 text-gray-500">ログインしてください。</p>;

  return (
    <div className="max-w-6xl mx-auto">

      {jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <Briefcase className="mx-auto mb-3 text-gray-400" size={40} />
          現在マッチする求人はありません。
        </div>
      ) : (
          <div>
        <ul className="grid gap-4">
          {currentJobs.map((job) => (
            <li
              key={job.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition bg-white"
            >

                <div className="mb-4 flex justify-between items-center">
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <Target size={14} /> マッチスコア: {job.matchScore}
                  </span>
                </div>

                {/* タイトル・会社情報 */}
                <div className="flex flex-col gap-1 mb-2">
                  <h2 className="text-lg font-semibold text-blue-700">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {job.title}
                    </a>
                  </h2>
                  <p className="text-gray-700">{job.company}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                </div>

              
                {/* スキルタグ */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skills
                    .map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="bg-gray-200 hover:bg-blue-200 text-gray-800 px-2 py-1 text-xs rounded cursor-pointer transition"
                      >
                        {tag.startsWith("#") ? tag : `#${tag}`}
                      </span>
                    ))}
                </div>

                {/* 出典情報 */}
                <div className="flex justify-between items-center text-xs text-gray-500 border-t pt-2">
                  <span>出典：{job.via}</span>
                  {job.collected_date && (
                    <span>収集日：{job.collected_date.slice(0, 10)}</span>
                  )}
              </div>
              
             
            </li>
          ))}
          </ul>
          
           {/* ページネーション */}
          <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
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
             </div>
      )}

     
      
    </div>
  );
}
