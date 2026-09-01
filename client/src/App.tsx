import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Providers from "./pages/Providers";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <div className="shell">
      <aside className="rail">
        <div className="logo">H</div>

        <nav>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rail-button ${isActive ? "active" : ""}`
            }
            title="Dashboard"
          >
            <span className="icon">H</span>
          </NavLink>

          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `rail-button ${isActive ? "active" : ""}`
            }
            title="Patients"
          >
            <span className="icon">P</span>
          </NavLink>

          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              `rail-button ${isActive ? "active" : ""}`
            }
            title="Appointments"
          >
            <span className="icon">A</span>
          </NavLink>

          <NavLink
            to="/providers"
            className={({ isActive }) =>
              `rail-button ${isActive ? "active" : ""}`
            }
            title="Providers"
          >
            <span className="icon">D</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `rail-button ${isActive ? "active" : ""}`
            }
            title="Analytics"
          >
            <span className="icon">↗</span>
          </NavLink>
        </nav>

        <div className="rail-bottom">
          <span className="online-dot" />
          <div className="avatar">RD</div>
        </div>
      </aside>

      <main className="workspace">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />

          <Route
            path="/appointments"
            element={<Appointments />}
          />

          <Route
            path="/providers"
            element={<Providers />}
          />

          <Route
            path="/analytics"
            element={<ComingSoon title="Analytics" />}
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="coming-soon">
      <span className="section-tag">HEALTH CARE SYSTEM</span>
      <h1>{title}</h1>
      <p>This workspace is being prepared.</p>
    </div>
  );
}

export default App;