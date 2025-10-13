import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";

import Dashboard from "../pages/Dashboard";
import Skills from "../pages/Skills";
import Forecast from "../pages/Forecast";
import Prefectures from "../pages/Prefectures";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import JobsList from "../pages/JobsList";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout配下に各ページをネスト */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/prefectures" element={<Prefectures />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
           <Route path="/jobsList" element={<JobsList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
