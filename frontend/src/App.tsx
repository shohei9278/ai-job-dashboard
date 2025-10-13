import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import JobsList from "./pages/JobsList";
import Header from "./components/common/Header";
import Layout from "./components/layout/Layout";

export default function App() {
  return (
   
    <Router>

      <Routes>
        <Route path="/" element={<Layout />} />
        <Route path="/jobs" element={<JobsList />} />
      </Routes>
    </Router>
  );
}