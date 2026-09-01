import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "../utils/api";
type Appointment = {
  id: number;
  patientId: number;
  providerId: number;
  scheduledAt: string;
  status: string;
  checkedInAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

type Provider = {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
};

function Analytics() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const [appointmentResponse, providerResponse] =
        await Promise.all([
          apiFetch("/appointments"),
          apiFetch("/providers")
        ]);

      if (!appointmentResponse.ok || !providerResponse.ok) {
        throw new Error("Unable to load analytics");
      }

      const appointmentResult = await appointmentResponse.json();
      const providerResult = await providerResponse.json();

      setAppointments(appointmentResult.data ?? []);
      setProviders(providerResult.data ?? []);
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const analytics = useMemo(() => {
    const total = appointments.length;

    const completed = appointments.filter(
      (appointment) => appointment.status === "COMPLETED"
    ).length;

    const cancelled = appointments.filter(
      (appointment) => appointment.status === "CANCELLED"
    ).length;

    const active = appointments.filter((appointment) =>
      ["CHECKED_IN", "WAITING", "IN_PROGRESS"].includes(
        appointment.status
      )
    ).length;

    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    const cancellationRate =
      total > 0 ? Math.round((cancelled / total) * 100) : 0;

    const waitTimes = appointments
      .filter(
        (appointment) =>
          appointment.checkedInAt && appointment.startedAt
      )
      .map((appointment) => {
        const checkedIn = new Date(
          appointment.checkedInAt as string
        ).getTime();

        const started = new Date(
          appointment.startedAt as string
        ).getTime();

        return Math.max(
          0,
          Math.round((started - checkedIn) / 60000)
        );
      });

    const averageWait =
      waitTimes.length > 0
        ? Math.round(
            waitTimes.reduce((totalTime, value) => {
              return totalTime + value;
            }, 0) / waitTimes.length
          )
        : 0;

    return {
      total,
      completed,
      cancelled,
      active,
      completionRate,
      cancellationRate,
      averageWait
    };
  }, [appointments]);

  const providerPerformance = useMemo(() => {
    return providers
      .map((provider) => {
        const providerAppointments = appointments.filter(
          (appointment) =>
            appointment.providerId === provider.id
        );

        const completed = providerAppointments.filter(
          (appointment) =>
            appointment.status === "COMPLETED"
        ).length;

        const completionRate =
          providerAppointments.length > 0
            ? Math.round(
                (completed / providerAppointments.length) * 100
              )
            : 0;

        return {
          ...provider,
          total: providerAppointments.length,
          completed,
          completionRate
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [appointments, providers]);

  const dailyActivity = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();

      date.setDate(date.getDate() - (6 - index));

      return {
        date,
        label: date.toLocaleDateString([], {
          weekday: "short"
        }),
        count: 0
      };
    });

    appointments.forEach((appointment) => {
      const appointmentDate = new Date(
        appointment.scheduledAt
      );

      const matchingDay = days.find(
        (day) =>
          day.date.toDateString() ===
          appointmentDate.toDateString()
      );

      if (matchingDay) {
        matchingDay.count += 1;
      }
    });

    return days;
  }, [appointments]);

  const maxDailyActivity = Math.max(
    ...dailyActivity.map((day) => day.count),
    1
  );

  const busiestProvider = providerPerformance[0];

  const busiestHour = useMemo(() => {
    if (appointments.length === 0) {
      return "No data";
    }

    const hours: Record<number, number> = {};

    appointments.forEach((appointment) => {
      const hour = new Date(
        appointment.scheduledAt
      ).getHours();

      hours[hour] = (hours[hour] ?? 0) + 1;
    });

    const [hour] = Object.entries(hours).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return formatHour(Number(hour));
  }, [appointments]);

  if (loading) {
    return (
      <div className="analytics-loading">
        Loading operational intelligence...
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <header className="page-header analytics-header">
        <div>
          <span className="section-tag">
            OPERATIONAL INTELLIGENCE
          </span>

          <h1>Signals behind the care.</h1>

          <p>
            Transform clinical activity into measurable operational
            intelligence.
          </p>
        </div>

        <div className="analytics-live">
          <span />
          Live dataset
        </div>
      </header>

      <section className="analytics-hero">
        <div className="analytics-hero-main">
          <span className="analytics-label">
            NETWORK PERFORMANCE
          </span>

          <div className="completion-number">
            {analytics.completionRate}
            <small>%</small>
          </div>

          <p>Appointment completion rate</p>

          <div className="completion-track">
            <div
              style={{
                width: `${analytics.completionRate}%`
              }}
            />
          </div>
        </div>

        <div className="analytics-metric">
          <span>TOTAL VISITS</span>
          <strong>{analytics.total}</strong>
          <p>Appointments in current dataset</p>
        </div>

        <div className="analytics-metric">
          <span>ACTIVE FLOW</span>
          <strong>{analytics.active}</strong>
          <p>Patients moving through care</p>
        </div>

        <div className="analytics-metric">
          <span>AVG. WAIT</span>
          <strong>
            {analytics.averageWait}
            <small> min</small>
          </strong>
          <p>Check-in to visit start</p>
        </div>
      </section>

      <section className="analytics-layout">
        <article className="analytics-card activity-card">
          <div className="analytics-card-heading">
            <div>
              <span className="section-tag">
                7 DAY ACTIVITY
              </span>
              <h2>Appointment volume</h2>
            </div>

            <span className="analytics-total">
              {dailyActivity.reduce(
                (total, day) => total + day.count,
                0
              )}{" "}
              visits
            </span>
          </div>

          <div className="activity-chart">
            {dailyActivity.map((day) => {
              const height =
                day.count === 0
                  ? 4
                  : Math.max(
                      12,
                      (day.count / maxDailyActivity) * 100
                    );

              return (
                <div
                  className="activity-column"
                  key={day.date.toISOString()}
                >
                  <div className="activity-bar-area">
                    <span className="activity-value">
                      {day.count}
                    </span>

                    <div
                      className="activity-bar"
                      style={{
                        height: `${height}%`
                      }}
                    />
                  </div>

                  <span className="activity-day">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="analytics-card intelligence-card">
          <span className="section-tag">
            SYSTEM SIGNAL
          </span>

          <h2>Operational intelligence</h2>

          <div className="intelligence-highlight">
            <span>BUSIEST PERIOD</span>
            <strong>{busiestHour}</strong>
          </div>

          <p>
            Appointment demand is concentrated around this period
            based on the current scheduling dataset.
          </p>

          <div className="intelligence-footer">
            <span>Cancellation rate</span>
            <strong>
              {analytics.cancellationRate}%
            </strong>
          </div>
        </article>
      </section>

      <section className="analytics-layout lower-analytics">
        <article className="analytics-card performance-card">
          <div className="analytics-card-heading">
            <div>
              <span className="section-tag">
                PROVIDER PERFORMANCE
              </span>

              <h2>Clinical workload</h2>
            </div>
          </div>

          <div className="performance-list">
            {providerPerformance.map((provider, index) => (
              <div
                className="performance-row"
                key={provider.id}
              >
                <span className="performance-rank">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="performance-provider">
                  <strong>
                    Dr. {provider.firstName}{" "}
                    {provider.lastName}
                  </strong>

                  <span>{provider.specialty}</span>
                </div>

                <div className="performance-volume">
                  <span>VISITS</span>
                  <strong>{provider.total}</strong>
                </div>

                <div className="performance-rate">
                  <div>
                    <span>COMPLETION</span>
                    <strong>
                      {provider.completionRate}%
                    </strong>
                  </div>

                  <div className="mini-track">
                    <div
                      style={{
                        width: `${provider.completionRate}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="analytics-card insight-card">
          <span className="section-tag">
            MANAGEMENT INSIGHT
          </span>

          <h2>
            {busiestProvider
              ? `Dr. ${busiestProvider.lastName} carries the highest recorded workload.`
              : "More activity is needed for provider insights."}
          </h2>

          <p>
            Current insight is generated directly from provider and
            appointment activity stored by the system.
          </p>

          <div className="insight-stat">
            <span>RECORDED VISITS</span>

            <strong>
              {busiestProvider?.total ?? 0}
            </strong>
          </div>
        </article>
      </section>
    </div>
  );
}

function formatHour(hour: number) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric"
  });
}

export default Analytics;