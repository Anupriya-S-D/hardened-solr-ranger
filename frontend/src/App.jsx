import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Collections from "./pages/Collections";
import Cluster from "./pages/Cluster";
import RangerPolicies from "./pages/RangerPolicies";
import AuditLogs from "./pages/AuditLogs";
import Users from "./pages/Users";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />

        <main className="main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/cluster" element={<Cluster />} />
            <Route path="/policies" element={<RangerPolicies />} />
            <Route path="/audits" element={<AuditLogs />} />
            <Route path="/users" element={<Users />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;