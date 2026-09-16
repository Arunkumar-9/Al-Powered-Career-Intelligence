import { Outlet } from "react-router-dom";

import DashboardNavbar from "./DashboardNavbar";
import Sidebar from "./Sidebar";

import "./DashboardLayout.css";

function DashboardLayout() {

  return (

    <div>

      <DashboardNavbar />

      <div className="dashboard-layout">

        <Sidebar />

        <main className="dashboard-content">

          <Outlet />

        </main>

      </div>

    </div>

  );

}

export default DashboardLayout;