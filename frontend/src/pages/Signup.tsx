import { useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { signupApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const location = useLocation();
  const from = location.state?.from || "/"; 
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await signupApi(email, password, name);
      setUser(res.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "登録に失敗しました");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-xl font-semibold text-center mb-4">新規登録</h2>

        <form onSubmit={handleRegister} className="space-y-3">
          <input
            type="text"
            placeholder="お名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border w-full px-3 py-2 rounded"
            required
          />
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border w-full px-3 py-2 rounded"
            required
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border w-full px-3 py-2 rounded"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            登録
          </button>
        </form>

        <p className="text-center text-sm mt-3">
          すでにアカウントをお持ちですか？{" "}<br></br>
          <a href="/login" className="text-blue-500 underline">
            ログイン
          </a>
        </p>
      </div>
    </div>
  );
}
