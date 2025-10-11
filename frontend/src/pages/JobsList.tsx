import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface JobsListProps {
  selectedSkill?: string | null;
  onSkillSelect?: (skill: string) => void;
}

export default function JobsList({
  selectedSkill = "",
  onSkillSelect,
}: JobsListProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState(selectedSkill ?? "");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (selectedSkill) setSkill(selectedSkill);
  }, [selectedSkill]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.append("keyword", query);
      if (skill) params.append("skills", skill);
      if (location) params.append("location", location);
      params.append("mode", "any");

      const res = await fetch(`${API_URL}/jobs?${params.toString()}`);
      const data = await res.json();

      const normalized = data.map((job: any) => ({
        ...job,
        skills: Array.isArray(job.skills)
          ? job.skills.join(" ")
          : job.skills || "",
        via:
          job.via ||
          (job.url ? new URL(job.url).hostname.replace("www.", "") : "不明"),
        ai_summary:
          job.ai_summary ||
          job.summary ||
          "AI要約データがまだ生成されていません。",
      }));

      setJobs(normalized);
      setCurrentPage(1);
    } catch (err) {
      console.error("fetchJobs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [query, skill, location]);

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

  const handleSkillClick = (tag: string) => {
    const clean = tag.replace("#", "");
    setSkill(clean);
    onSkillSelect?.(clean);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">求人一覧</h1>

      {/* 検索フォーム */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <input
          type="text"
          placeholder="キーワード検索 (例: Python)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded-lg px-3 py-2 w-64"
        />
        <input
          type="text"
          placeholder="勤務地 (例: 東京)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="border rounded-lg px-3 py-2 w-48"
        />
        <input
          type="text"
          placeholder="スキル (例: AWS)"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="border rounded-lg px-3 py-2 w-48"
        />
        <button
          onClick={fetchJobs}
          className="cursor-pointer bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700"
        >
          検索
        </button>
      </div>

      {loading ? (
        <p>読み込み中...</p>
      ) : jobs.length === 0 ? (
        <p>該当する求人はありません。</p>
      ) : (
        <>
          <div className="grid gap-4">
            {currentJobs.map((job, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition bg-white"
              >
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

                {/* AI要約 */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-gray-800 leading-relaxed mb-3">
                  <strong className="text-blue-600">AI要約：</strong>
                  {job.ai_summary.length > 180
                    ? job.ai_summary.slice(0, 180) + "..."
                    : job.ai_summary}
                </div>

                {/* スキルタグ */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {job.skills
                    .split(" ")
                    .filter(Boolean)
                    .map((tag: string, i: number) => (
                      <span
                        key={i}
                        onClick={() => handleSkillClick(tag)}
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
              </div>
            ))}
          </div>

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
        </>
      )}
    </div>
  );
}
