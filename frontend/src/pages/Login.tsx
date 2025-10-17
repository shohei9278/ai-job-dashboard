import { useState } from "react";
import { useNavigate,useLocation } from "react-router-dom";
import { loginApi } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { getProfile } from "../api/profile";
export default function Login() {
  const navigate = useNavigate();
   const location = useLocation();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const from = location.state?.from || "/"; 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginApi(email, password);
      const profile = await getProfile();
       setUser(profile.user);
      
      navigate(from, { replace: true });
    } catch (err: any) {
     setError(err.message || "登録に失敗しました");
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-xl font-semibold text-center mb-4">ログイン</h2>

           <form
        onSubmit={handleLogin}
        className="space-y-3"
      >
       
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="メールアドレス"
          className="w-full border p-2 rounded mb-3"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="パスワード"
          className="w-full border p-2 rounded mb-4"
          required
          />
          
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          ログイン
        </button>
      </form>
        
         <p className="text-center text-sm mt-3">
          
          <a href="/signup" className="text-blue-500 underline">
            新規登録はこちら
          </a>
        </p>

      </div>
      </div>
   

      
  
  );
}
