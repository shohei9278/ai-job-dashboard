import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";


export default function Layout() {
const [isSidebarOpen, setSidebarOpen] = useState(false);  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)}  />
      <div className="flex flex-col flex-1">
        <Header onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}  />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}