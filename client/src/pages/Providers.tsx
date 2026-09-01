import { useEffect, useMemo, useState } from "react";

type Provider = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  specialty: string;
  departmentId: number;
};

type Appointment = {
  id: number;
  patientId: number;
  providerId: number;
  scheduledAt: string;
  status: string;
};

function Providers() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [providerResponse, appointmentResponse] =
        await Promise.all([
          fetch("http://localhost:4000/api/providers"),
          fetch("http://localhost:4000/api/appointments")
        ]);

      if (!providerResponse.ok || !appointmentResponse.ok) {
        throw new Error("Unable to load provider workspace");
      }

      const providerResult = await providerResponse.json();
      const appointmentResult = await appointmentResponse.json();

      setProviders(providerResult.data ?? []);
      setAppointments(appointmentResult.data ?? []);
    } catch (error) {
      console.error("Provider workspace error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredProviders = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return providers;
    }

    return providers.filter((provider) =>
      `${provider.firstName} ${provider.lastName} ${provider.specialty}`
        .toLowerCase()
        .includes(query)
    );
  }, [providers, search]);

  function getProviderAppointments(providerId: number) {
    return appointments.filter(
      (appointment) => appointment.providerId === providerId
    );
  }

  function getActiveCount(providerId: number) {
    return getProviderAppointments(providerId).filter(
      (appointment) =>
        appointment.status === "CHECKED_IN" ||
        appointment.status === "WAITING" ||
        appointment.status === "IN_PROGRESS"
    ).length;
  }

  function getCompletedCount(providerId: number) {
    return getProviderAppointments(providerId).filter(
      (appointment) => appointment.status === "COMPLETED"
    ).length;
  }

  function getUpcomingCount(providerId: number) {
    return getProviderAppointments(providerId).filter(
      (appointment) => appointment.status === "SCHEDULED"
    ).length;
  }

  function getCapacity(providerId: number) {
    const active = getActiveCount(providerId);
    const upcoming = getUpcomingCount(providerId);

    return Math.min(100, active * 30 + upcoming * 15);
  }

  const activeProviders = providers.filter(
    (provider) => getActiveCount(provider.id) > 0
  ).length;

  const totalActiveVisits = appointments.filter(
    (appointment) =>
      appointment.status === "CHECKED_IN" ||
      appointment.status === "WAITING" ||
      appointment.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="providers-page">
      <header className="page-header provider-page-header">
        <div>
          <span className="section-tag">CLINICAL NETWORK</span>

          <h1>Provider intelligence.</h1>

          <p>
            Understand clinical capacity, active workload and provider
            performance from one operational view.
          </p>
        </div>

        <div className="provider-live-badge">
          <span />
          Live capacity
        </div>
      </header>

      <section className="provider-overview">
        <div className="provider-overview-lead">
          <span>CLINICAL CAPACITY</span>

          <div className="provider-overview-number">
            {String(providers.length).padStart(2, "0")}
          </div>

          <p>Healthcare providers across the network</p>
        </div>

        <div className="provider-overview-metric">
          <span>ACTIVE PROVIDERS</span>
          <strong>{activeProviders}</strong>
          <p>Currently managing patient flow</p>
        </div>

        <div className="provider-overview-metric">
          <span>ACTIVE VISITS</span>
          <strong>{totalActiveVisits}</strong>
          <p>Across all provider queues</p>
        </div>

        <div className="provider-overview-insight">
          <span>NETWORK STATUS</span>
          <strong>Operational</strong>
          <p>
            Provider capacity is being calculated from live appointment
            activity.
          </p>
        </div>
      </section>

      <section className="provider-directory-heading">
        <div>
          <span className="section-tag">PROVIDER DIRECTORY</span>
          <h2>Clinical team</h2>
        </div>

        <input
          type="search"
          className="provider-search"
          placeholder="Search provider or specialty"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      {loading ? (
        <div className="provider-loading">
          Loading provider intelligence...
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="provider-loading">
          No providers found.
        </div>
      ) : (
        <section className="provider-grid">
          {filteredProviders.map((provider, index) => {
            const active = getActiveCount(provider.id);
            const completed = getCompletedCount(provider.id);
            const upcoming = getUpcomingCount(provider.id);
            const capacity = getCapacity(provider.id);

            return (
              <article
                className="provider-card"
                key={provider.id}
              >
                <div className="provider-card-top">
                  <span className="provider-card-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div
                    className={
                      active > 0
                        ? "provider-state provider-state-active"
                        : "provider-state"
                    }
                  >
                    <span />

                    {active > 0 ? "In service" : "Available"}
                  </div>
                </div>

                <div className="provider-profile">
                  <div className="provider-monogram">
                    {provider.firstName.charAt(0)}
                    {provider.lastName.charAt(0)}
                  </div>

                  <div>
                    <span className="provider-specialty">
                      {provider.specialty}
                    </span>

                    <h3>
                      Dr. {provider.firstName} {provider.lastName}
                    </h3>

                    <p>{provider.email}</p>
                  </div>
                </div>

                <div className="provider-capacity">
                  <div className="capacity-heading">
                    <span>WORKLOAD</span>
                    <strong>{capacity}%</strong>
                  </div>

                  <div className="capacity-track">
                    <div
                      className="capacity-fill"
                      style={{
                        width: `${capacity}%`
                      }}
                    />
                  </div>
                </div>

                <div className="provider-card-metrics">
                  <div>
                    <span>ACTIVE</span>
                    <strong>{active}</strong>
                  </div>

                  <div>
                    <span>UPCOMING</span>
                    <strong>{upcoming}</strong>
                  </div>

                  <div>
                    <span>COMPLETED</span>
                    <strong>{completed}</strong>
                  </div>
                </div>

                <div className="provider-card-footer">
                  <div>
                    <span>DEPARTMENT</span>
                    <strong>
                      Department {provider.departmentId}
                    </strong>
                  </div>

                  <span className="provider-record-id">
                    ID {String(provider.id).padStart(4, "0")}
                  </span>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default Providers;