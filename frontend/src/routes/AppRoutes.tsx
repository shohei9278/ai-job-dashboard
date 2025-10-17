import { BrowserRouter, Routes, Route, Navigate,useLocation } from "react-router-dom";
import Layout from "../components/layout/Layout";

import Dashboard from "../pages/Dashboard";
import Skills from "../pages/Skills";
import Forecast from "../pages/Forecast";
import Prefectures from "../pages/Prefectures";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import JobsList from "../pages/JobsList";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import RequireLogin from "../pages/RequireLogin";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react/jsx-runtime";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p>認証確認中...</p>;

  // 未ログイン時はログイン画面へ。ただし元のURLを state に保存
  if (!user) {
    return <Navigate to="/require-login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

/**
 * アプリ全体のルーティング
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ログインページは認証不要 */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
         <Route element={ <Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/prefectures" element={<Prefectures />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/jobsList" element={<JobsList />} />
           <Route path="/require-login" element={<RequireLogin />} />
          
          {/* 以下はログイン必須 */}
          <Route path="/settings"  element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
          }/>
         
        </Route>

        {/* 未定義ルート → ダッシュボードへ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
