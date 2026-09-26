import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import TopNavbar from "./TopNavbar";
import Sidebar from "./Sidebar";

const MainLayout = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const toggleSidebar = () => setShowMobileSidebar((prev) => !prev);
  const closeSidebar = () => setShowMobileSidebar(false);

  return (
    <div className="app-container">
      <div className="content-wrapper w-100">
        <TopNavbar toggleSidebar={toggleSidebar} />
        <div className="d-flex flex-grow-1">
          <Sidebar
            showMobileSidebar={showMobileSidebar}
            closeMobileSidebar={closeSidebar}
          />
          <main className="main-content flex-grow-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
