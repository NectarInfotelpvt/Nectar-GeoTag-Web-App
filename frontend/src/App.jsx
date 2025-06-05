import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";       // Login/Register page
import SuperAdmin from "./pages/SuperAdmin";     // Your super admin page
import AdminPanel from "./pages/AdminPanel";     // Your admin panel
import MainDashboard from "./pages/MainDashboard";     

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/user" element={<MainDashboard />} />
        {/* Optional fallback */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;