import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewInspection from "./pages/NewInspection";
import Results from "./pages/Results";
import Report from "./pages/Report";
import History from "./pages/History";
import SearchProduct from "./pages/SearchProduct";
import ManufacturerDashboard from "./pages/manufacturer/ManufacturerDashboard";
import GovernmentDashboard from "./pages/government/GovernmentDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inspection" element={<NewInspection />} />
      <Route path="/results" element={<Results />} />
      <Route path="/report" element={<Report />} />
      <Route path="/history" element={<History />} />
      <Route path="/search" element={<SearchProduct />} />

      <Route path="/manufacturer" element={<ManufacturerDashboard />} />
      <Route path="/government" element={<GovernmentDashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
