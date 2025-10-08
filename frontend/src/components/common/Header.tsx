import { useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
export default function Header() {

  const [showPopup, setShowPopup] = useState(false);

  return (
    <header className="flex justify-between items-center px-8 py-4 bg-indigo-600 text-white shadow">
      <h1 className="text-2xl font-bold">AI求人ダッシュボード</h1>
      <div className="flex gap-3">

              <button
  onClick={() => setShowPopup(true)}
  className="cursor-pointer bg-gray-400 hover:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
>
  エクスポート
        </button>
        
        <button
  onClick={() => setShowPopup(true)}
  className="cursor-pointer bg-gray-400 hover:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
>
  期間指定
</button>
        <Link to="/jobs" className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded-md text-sm font-medium">
          求人一覧
        </Link>
        <Link to="/" className="bg-purple-500 hover:bg-purple-400 px-4 py-2 rounded-md text-sm font-medium">
          HOME
        </Link>
      </div>


       {/* ポップアップ */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-30 flex justify-center items-center z-50">
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