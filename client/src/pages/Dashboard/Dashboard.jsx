import HeroSection from "../../components/dashboard/HeroSection";
import StatsCards from "../../components/dashboard/StatsCards";
import QuickActions from "../../components/dashboard/QuickActions";
import AIInsights from "../../components/dashboard/AIInsights";
import RecentActivity from "../../components/dashboard/RecentActivity";

// Milestone 3: Module 7 - Career Dashboard aggregation
import CareerIntelligenceSummary from "../../components/dashboard/CareerIntelligenceSummary";

import "./Dashboard.css";

function Dashboard() {

  return (

    <div className="dashboard-container">

      <HeroSection />

      <StatsCards />

      <QuickActions />

      <AIInsights />

      <RecentActivity />

      <CareerIntelligenceSummary />

    </div>

  );

}

export default Dashboard;