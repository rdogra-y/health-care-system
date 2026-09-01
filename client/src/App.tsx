import {
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes
} from "react-router-dom";

import "./App.css";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Appointments from "./pages/Appointments";
import Providers from "./pages/Providers";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<Login />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<ApplicationLayout />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/patients"
            element={<Patients />}
          />

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
            element={<Analytics />}
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

function ApplicationLayout() {
  const {
    user,
    logout
  } = useAuth();

  return (
    <div className="shell">
      <aside className="rail">
        <div className="logo">H</div>

        <nav>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rail-button ${
                isActive ? "active" : ""
              }`
            }
            title="Dashboard"
          >
            H
          </NavLink>

          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `rail-button ${
                isActive ? "active" : ""
              }`
            }
            title="Patients"
          >
            P
          </NavLink>

          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              `rail-button ${
                isActive ? "active" : ""
              }`
            }
            title="Appointments"
          >
            A
          </NavLink>

          <NavLink
            to="/providers"
            className={({ isActive }) =>
              `rail-button ${
                isActive ? "active" : ""
              }`
            }
            title="Providers"
          >
            D
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `rail-button ${
                isActive ? "active" : ""
              }`
            }
            title="Analytics"
          >
            I
          </NavLink>
        </nav>

        <div className="rail-bottom">
          <span className="online-dot" />

          <button
            className="avatar avatar-button"
            onClick={logout}
            title={`Sign out ${user?.firstName ?? ""}`}
          >
            {user
              ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
              : "U"}
          </button>
        </div>
      </aside>

      <main className="workspace">
        <Outlet />
      </main>
    </div>
  );
}

export default App;