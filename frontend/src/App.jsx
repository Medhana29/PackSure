import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SearchProduct from "./pages/SearchProduct";
import NewInspection from "./pages/NewInspection";
import ImageQuality from "./pages/ImageQuality";
import Scanning from "./pages/Scanning";
import RequestReview from "./pages/RequestReview";

// Person B's pages
import Results from "./pages/Results";
import Report from "./pages/Report";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Person A - Consumer Flow */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<SearchProduct />} />
        <Route path="/inspection" element={<NewInspection />} />
        <Route path="/quality" element={<ImageQuality />} />
        <Route path="/scanning" element={<Scanning />} />
        <Route path="/review" element={<RequestReview />} />

        {/* Person B */}
        <Route path="/results" element={<Results />} />
        <Route path="/report" element={<Report />} />
        <Route path="/history" element={<History />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;