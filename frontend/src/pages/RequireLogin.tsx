import { LogIn } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RequireLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-600">
      <div className="flex items-center gap-2 mb-4 text-gray-500">
        <LogIn size={28} />
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        ログインが必要です
      </h2>
      <p className="max-w-md text-sm leading-relaxed mb-6">
        このページを閲覧するにはログインが必要です。
        
      </p>

      <div className="flex items-start gap-2 p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded mb-8 text-left">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 4.5l7.5 13h-15L12 4.5z" />
        </svg>
        <p className="text-sm text-yellow-800">
            新規登録したくない場合は<br></br>以下のアカウントをお使いください。<br></br>
            メールアドレス:test@example.com<br></br>
            パスワード:pass123
          </p>
        </div>

      <button
        onClick={() => navigate("/login", { state: { from } })}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition mb-4 cursor-pointer"
      >
        ログイン
      </button>

      <button
          onClick={() => navigate("/signup", { state: { from } })}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition cursor-pointer"
        >
          新規登録
        </button>
    </div>
  );
}
