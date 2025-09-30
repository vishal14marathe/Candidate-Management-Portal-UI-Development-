import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CandidateRegister from "./components/candidates/CandidateRegister";
import CandidateLogin from "./components/candidates/CandidateLogin";
import CandidateProfile from "./components/candidates/CandidateProfile";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";


function App() {
  return (
    <Router>
      <Routes>
        {/* Default route - redirect to candidate login */}
        <Route path="/" element={<Navigate to="/candidate/login" replace />} />
        
        {/* Candidate routes */}
        <Route path="/candidate/register" element={<CandidateRegister />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/profile" element={<CandidateProfile />} />
        
        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
        {/* Catch all route - redirect to candidate login */}
        <Route path="*" element={<Navigate to="/candidate/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
