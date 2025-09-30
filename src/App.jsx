import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CandidateRegister from "./components/candidates/CandidateRegister";
import CandidateLogin from "./components/candidates/CandidateLogin";
import CandidateProfile from "./components/candidates/CandidateProfile";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/cadidate/register" element={<CandidateRegister />} />
        <Route path="/candidate/login" element={<CandidateLogin />} />
        <Route path="/candidate/profile" element={<CandidateProfile />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
