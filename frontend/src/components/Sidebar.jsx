import {
  Database,
  FileText,
  LayoutDashboard,
  Server,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <ShieldCheck size={30} />

        <div>
          <h2>SecureSolr</h2>
          <span>Ranger Console</span>
        </div>
      </div>

      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink
          to="/collections"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Database size={19} />
          Collections
        </NavLink>

        <NavLink
          to="/cluster"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Server size={19} />
          Cluster
        </NavLink>

        <NavLink
          to="/policies"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Shield size={19} />
          Ranger Policies
        </NavLink>

        <NavLink
          to="/audits"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <FileText size={19} />
          Audit Logs
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <Users size={19} />
          Users
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot"></span>
        Solr services online
      </div>
    </aside>
  );
}

export default Sidebar;