import { useEffect, useState } from "react";
import "../App.css";

type DashboardData = {
  totalPatients: number;
  totalProviders: number;
  totalAppointments: number;
  waitingPatients: number;
  completedAppointments: number;
  averageWaitTime: number;
};

const appointments = [
  { time: "09:30", name: "Sophia Brown", doctor: "Dr. Emily Carter", status: "Completed" },
  { time: "10:45", name: "Olivia Singh", doctor: "Dr. Noah Wilson", status: "Completed" },
  { time: "11:20", name: "Liam Martin", doctor: "Dr. Aarav Sharma", status: "Waiting" },
  { time: "13:00", name: "Ethan Lee", doctor: "Dr. Emily Carter", status: "Upcoming" }
];

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch("http://localhost:4000/api/dashboard");

        if (!response.ok) {
          throw new Error("Dashboard request failed");
        }

        const result = await response.json();
        setDashboard(result.data);
      } catch (error) {
        console.error("Unable to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-ring" />
        <span>Preparing clinical workspace</span>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      <main className="dashboard-content">
        <header className="header">
          <div>
            <div className="header-kicker">
              <span className="pulse-dot" />
              LIVE OPERATIONS
            </div>

            <h1>
              Good evening,
              <br />
              <span>here's your clinic pulse.</span>
            </h1>
          </div>

          <div className="header-actions">
            <button className="search-button">Search records</button>
            <button className="new-button">New appointment</button>
          </div>
        </header>

        <section className="command-grid">
          <article className="hero-card">
            <div className="hero-glow" />

            <div className="hero-top">
              <div>
                <span className="section-tag light">PATIENT FLOW</span>
                <h2>Clinic operating smoothly</h2>
              </div>

              <div className="live-pill">
                <span />
                Live
              </div>
            </div>

            <div className="hero-content">
              <div className="wait-orbit">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />

                <div className="wait-center">
                  <strong>{dashboard?.averageWaitTime ?? 0}</strong>
                  <span>MIN</span>
                </div>
              </div>

              <div className="hero-copy">
                <p>AVERAGE WAIT</p>
                <h3>
                  Patient movement is
                  <br />
                  within target.
                </h3>
                <span>
                  Live operational data is being calculated directly from
                  appointment activity.
                </span>
              </div>
            </div>

            <div className="hero-footer">
              <div>
                <span>WAITING NOW</span>
                <strong>{dashboard?.waitingPatients ?? 0}</strong>
              </div>

              <div>
                <span>COMPLETED</span>
                <strong>{dashboard?.completedAppointments ?? 0}</strong>
              </div>

              <div>
                <span>TOTAL VISITS</span>
                <strong>{dashboard?.totalAppointments ?? 0}</strong>
              </div>
            </div>
          </article>

          <article className="patients-card">
            <div className="card-heading">
              <div>
                <span className="section-tag">CARE NETWORK</span>
                <h2>Patient base</h2>
              </div>

              <button className="circle-button">↗</button>
            </div>

            <div className="huge-number">
              {String(dashboard?.totalPatients ?? 0).padStart(2, "0")}
            </div>

            <div className="patient-copy">
              <span>registered patients</span>
              <div className="mini-line" />
            </div>

            <div className="provider-stat">
              <div className="provider-avatars">
                <span>AS</span>
                <span>EC</span>
                <span>NW</span>
              </div>

              <p>
                <strong>{dashboard?.totalProviders ?? 0}</strong>
                <span> active providers</span>
              </p>
            </div>
          </article>
        </section>

        <section className="lower-grid">
          <article className="schedule-card">
            <div className="card-heading">
              <div>
                <span className="section-tag">TODAY</span>
                <h2>Care timeline</h2>
              </div>

              <button className="text-button">Full schedule</button>
            </div>

            <div className="timeline">
              {appointments.map((appointment, index) => (
                <div className="timeline-row" key={appointment.time}>
                  <div className="time">{appointment.time}</div>

                  <div className="timeline-marker">
                    <span className={`marker ${appointment.status.toLowerCase()}`} />
                    {index < appointments.length - 1 && <div className="timeline-line" />}
                  </div>

                  <div className="appointment-info">
                    <strong>{appointment.name}</strong>
                    <span>{appointment.doctor}</span>
                  </div>

                  <div className={`status ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="capacity-card">
            <div className="card-heading">
              <div>
                <span className="section-tag">CAPACITY</span>
                <h2>Provider load</h2>
              </div>
            </div>

            <ProviderLoad initials="EC" name="Dr. Carter" value={82} />
            <ProviderLoad initials="AS" name="Dr. Sharma" value={64} />
            <ProviderLoad initials="NW" name="Dr. Wilson" value={47} />

            <div className="capacity-note">
              <span className="spark">+</span>
              <div>
                <strong>Capacity available</strong>
                <p>Afternoon schedule has room for additional visits.</p>
              </div>
            </div>
          </article>

          <article className="insight-card">
            <div className="insight-orb" />

            <span className="section-tag light">OPERATIONAL INTELLIGENCE</span>

            <div className="insight-content">
              <div className="signal">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <h2>Clinic Pulse</h2>

              <p>
                Current patient traffic is stable. Provider capacity remains
                available while the active waiting queue stays low.
              </p>

              <button>
                Explore analytics
                <span>↗</span>
              </button>
            </div>
          </article>
        </section>

        <footer className="footer">
          <div>
            <span className="online-dot" />
            PostgreSQL connected
          </div>

          <span>Health Care Operations System</span>
        </footer>
      </main>
    </div>
  );
}

function ProviderLoad({
  initials,
  name,
  value
}: {
  initials: string;
  name: string;
  value: number;
}) {
  return (
    <div className="provider-row">
      <div className="provider-name">
        <div className="small-avatar">{initials}</div>
        <span>{name}</span>
      </div>

      <div className="load-area">
        <div className="load-track">
          <div className="load-fill" style={{ width: `${value}%` }} />
        </div>

        <strong>{value}%</strong>
      </div>
    </div>
  );
}

export default Dashboard;