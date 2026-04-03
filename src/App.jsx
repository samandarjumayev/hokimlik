import { Outlet } from "react-router-dom";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

export default function App(){
  return <div className="w-full h-screen flex items-center justify-between">
    <Sidebar />
    
    <div className="relative flex-1 overflow-y-auto overflow-x-hidden flex flex-col h-full">
      <Header />
      
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  </div>
}