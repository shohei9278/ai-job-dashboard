import { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [showPopup, setShowPopup] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-indigo-600 text-white shadow">
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-xl md:text-2xl font-bold">AI求人ダッシュボード</h1>

        {/* PCナビ */}
        <nav className="hidden md:flex gap-3">
          <button
            onClick={() => setShowPopup(true)}
            className="bg-gray-400 hover:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            エクスポート
          </button>

          <button
            onClick={() => setShowPopup(true)}
            className="bg-gray-400 hover:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
          >
            期間指定
          </button>

          <Link
            to="/jobs"
            className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-md text-sm font-medium"
          >
            求人一覧
          </Link>
          <Link
            to="/"
            className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-md text-sm font-medium"
          >
            HOME
          </Link>
        </nav>

        {/* ハンバーガーメニュー（モバイル） */}
        <button
          className="md:hidden flex items-center focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* モバイル用ドロップダウン */}
      {isMenuOpen && (
        <div className="cursor-pointer md:hidden bg-indigo-500 px-4 pt-2 pb-3 space-y-2">
          <button
            onClick={() => {
              setShowPopup(true);
              setIsMenuOpen(false);
            }}
            className="block w-full text-left bg-gray-400 hover:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
          >
            エクスポート
          </button>

          <button
            onClick={() => {
              setShowPopup(true);
              setIsMenuOpen(false);
            }}
            className="block w-full text-left bg-gray-400 hover:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
          >
            期間指定
          </button>

          <Link
            to="/jobs"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full text-left bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-md text-sm font-medium"
          >
            求人一覧
          </Link>

          <Link
            to="/"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full text-left bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-md text-sm font-medium"
          >
            HOME
          </Link>
        </div>
      )}

      {/* ポップアップ */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white text-gray-800 p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-3">今後アップデート予定</h2>
            <p className="text-sm text-gray-600 mb-4">
              現在、この機能は開発中です。近日中に追加予定です。
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
