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
        このページを閲覧するにはログインが必要です。<br />
        ログインすると元のページに戻ります。
      </p>

      <button
        onClick={() => navigate("/login", { state: { from } })}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        ログインする
      </button>

      <button
          onClick={() => navigate("/signup", { state: { from } })}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300 transition"
        >
          新規登録
        </button>
    </div>
  );
}
