import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CandidateRegister from "./components/CandidateRegister";
import CandidateLogin from "./components/CandidateLogin";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CandidateRegister />} />
        <Route path="/register" element={<CandidateRegister />} />
        <Route path="/login" element={<CandidateLogin />} />
      </Routes>
    </Router>
  );
}

export default App;
