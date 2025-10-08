import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import JobsList from "./pages/JobsList";
import Header from "./components/common/Header";

export default function App() {
  return (
   
    <Router>
        <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<JobsList />} />
      </Routes>
    </Router>
  );
}