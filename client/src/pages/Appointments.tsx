import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "../utils/api";
type Appointment = {
  id: number;
  patientId: number;
  providerId: number;
  scheduledAt: string;
  status: string;
  reason: string | null;
  notes: string | null;
  checkedInAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
};

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
};

type Provider = {
  id: number;
  firstName: string;
  lastName: string;
  specialty: string;
};

function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    patientId: "",
    providerId: "",
    scheduledAt: "",
    reason: ""
  });

  async function loadData() {
    try {
      const [
        appointmentsResponse,
        patientsResponse,
        providersResponse
      ] = await Promise.all([
        apiFetch("/appointments"),
        apiFetch("/patients"),
        apiFetch("/providers")
      ]);

      if (
        !appointmentsResponse.ok ||
        !patientsResponse.ok ||
        !providersResponse.ok
      ) {
        throw new Error("Unable to load appointment workspace");
      }

      const appointmentsResult = await appointmentsResponse.json();
      const patientsResult = await patientsResponse.json();
      const providersResult = await providersResponse.json();

      setAppointments(appointmentsResult.data ?? []);
      setPatients(patientsResult.data ?? []);
      setProviders(providersResult.data ?? []);
    } catch (error) {
      console.error("Unable to load appointment workspace:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (filter === "ALL") {
      return appointments;
    }

    return appointments.filter(
      (appointment) => appointment.status === filter
    );
  }, [appointments, filter]);

  function getPatient(patientId: number) {
    return patients.find(
      (patient) => patient.id === patientId
    );
  }

  function getProvider(providerId: number) {
    return providers.find(
      (provider) => provider.id === providerId
    );
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await apiFetch("/appointments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            patientId: Number(form.patientId),
            providerId: Number(form.providerId),
            scheduledAt: new Date(
              form.scheduledAt
            ).toISOString(),
            reason: form.reason
          })
        }
      );

      if (!response.ok) {
        throw new Error("Unable to schedule appointment");
      }

      setForm({
        patientId: "",
        providerId: "",
        scheduledAt: "",
        reason: ""
      });

      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error(
        "Appointment creation error:",
        error
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateAppointmentStatus(
    appointmentId: number,
    status: string
  ) {
    setUpdatingId(appointmentId);

    try {
      const response = await apiFetch(`/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to update appointment status"
        );
      }

      await loadData();
    } catch (error) {
      console.error(
        "Appointment status update error:",
        error
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function getNextStatus(status: string) {
    const workflow: Record<string, string> = {
      SCHEDULED: "CHECKED_IN",
      CHECKED_IN: "WAITING",
      WAITING: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED"
    };

    return workflow[status];
  }

  const scheduledCount = appointments.filter(
    (appointment) =>
      appointment.status === "SCHEDULED"
  ).length;

  const checkedInCount = appointments.filter(
    (appointment) =>
      appointment.status === "CHECKED_IN"
  ).length;

  const waitingCount = appointments.filter(
    (appointment) =>
      appointment.status === "WAITING"
  ).length;

  const inProgressCount = appointments.filter(
    (appointment) =>
      appointment.status === "IN_PROGRESS"
  ).length;

  const completedCount = appointments.filter(
    (appointment) =>
      appointment.status === "COMPLETED"
  ).length;

  return (
    <div className="appointments-page">
      <header className="page-header appointment-header">
        <div>
          <span className="section-tag">
            CARE COORDINATION
          </span>

          <h1>The day's clinical rhythm.</h1>

          <p>
            Coordinate visits, monitor patient flow and
            manage provider schedules.
          </p>
        </div>

        <button
          className="new-button"
          onClick={() => setShowForm(true)}
        >
          Schedule appointment
        </button>
      </header>

      <section className="appointment-summary">
        <div className="appointment-summary-main">
          <span>ACTIVE WORKSPACE</span>

          <strong>
            {String(appointments.length).padStart(2, "0")}
          </strong>

          <p>Total appointments</p>
        </div>

        <div className="appointment-stat">
          <div className="stat-marker scheduled-marker" />

          <div>
            <span>Scheduled</span>
            <strong>{scheduledCount}</strong>
          </div>
        </div>

        <div className="appointment-stat">
          <div className="stat-marker waiting-marker" />

          <div>
            <span>Active queue</span>
            <strong>
              {checkedInCount +
                waitingCount +
                inProgressCount}
            </strong>
          </div>
        </div>

        <div className="appointment-stat">
          <div className="stat-marker completed-marker" />

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>
        </div>
      </section>

      <section className="appointment-workspace">
        <div className="appointment-controls">
          <div>
            <span className="section-tag">
              APPOINTMENT QUEUE
            </span>

            <h2>Schedule</h2>
          </div>

          <div className="appointment-filters">
            {[
              "ALL",
              "SCHEDULED",
              "CHECKED_IN",
              "WAITING",
              "IN_PROGRESS",
              "COMPLETED"
            ].map((status) => (
              <button
                key={status}
                className={
                  filter === status ? "selected" : ""
                }
                onClick={() => setFilter(status)}
              >
                {status === "ALL"
                  ? "All"
                  : formatStatus(status)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="empty-state">
            No appointments in this view.
          </div>
        ) : (
          <div className="appointment-list">
            {filteredAppointments.map(
              (appointment, index) => {
                const patient = getPatient(
                  appointment.patientId
                );

                const provider = getProvider(
                  appointment.providerId
                );

                const nextStatus = getNextStatus(
                  appointment.status
                );

                return (
                  <article
                    className="appointment-record"
                    key={appointment.id}
                  >
                    <div className="appointment-index">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="appointment-time-block">
                      <strong>
                        {formatTime(
                          appointment.scheduledAt
                        )}
                      </strong>

                      <span>
                        {formatDate(
                          appointment.scheduledAt
                        )}
                      </span>
                    </div>

                    <div className="appointment-person">
                      <div className="patient-initials">
                        {patient?.firstName.charAt(0) ??
                          "P"}

                        {patient?.lastName.charAt(0) ??
                          ""}
                      </div>

                      <div>
                        <strong>
                          {patient
                            ? `${patient.firstName} ${patient.lastName}`
                            : `Patient #${appointment.patientId}`}
                        </strong>

                        <span>
                          {appointment.reason ||
                            "General appointment"}
                        </span>
                      </div>
                    </div>

                    <div className="appointment-provider">
                      <span>PROVIDER</span>

                      <strong>
                        {provider
                          ? `Dr. ${provider.firstName} ${provider.lastName}`
                          : `Provider #${appointment.providerId}`}
                      </strong>

                      <small>
                        {provider?.specialty ??
                          "Clinical provider"}
                      </small>
                    </div>

                    <div
                      className={`appointment-status ${appointment.status.toLowerCase()}`}
                    >
                      <span />

                      {formatStatus(
                        appointment.status
                      )}
                    </div>

                    <div className="appointment-actions">
                      {nextStatus && (
                        <button
                          className="workflow-button"
                          disabled={
                            updatingId ===
                            appointment.id
                          }
                          onClick={() =>
                            updateAppointmentStatus(
                              appointment.id,
                              nextStatus
                            )
                          }
                        >
                          {updatingId ===
                          appointment.id
                            ? "Updating..."
                            : getActionLabel(
                                appointment.status
                              )}

                          {updatingId !==
                            appointment.id && (
                            <span>→</span>
                          )}
                        </button>
                      )}

                      {appointment.status ===
                        "COMPLETED" && (
                        <span className="workflow-complete">
                          Closed
                        </span>
                      )}

                      {appointment.status ===
                        "CANCELLED" && (
                        <span className="workflow-cancelled">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={() =>
            setShowForm(false)
          }
        >
          <form
            className="patient-modal appointment-modal"
            onSubmit={handleSubmit}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-heading">
              <div>
                <span className="section-tag">
                  CARE COORDINATION
                </span>

                <h2>Schedule appointment</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>
            </div>

            <div className="appointment-form-intro">
              <span>NEW VISIT</span>

              <p>
                Connect a patient with an available
                healthcare provider.
              </p>
            </div>

            <div className="form-grid">
              <label>
                Patient

                <select
                  required
                  value={form.patientId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      patientId:
                        event.target.value
                    })
                  }
                >
                  <option value="">
                    Select patient
                  </option>

                  {patients.map((patient) => (
                    <option
                      key={patient.id}
                      value={patient.id}
                    >
                      {patient.firstName}{" "}
                      {patient.lastName}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Provider

                <select
                  required
                  value={form.providerId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      providerId:
                        event.target.value
                    })
                  }
                >
                  <option value="">
                    Select provider
                  </option>

                  {providers.map((provider) => (
                    <option
                      key={provider.id}
                      value={provider.id}
                    >
                      Dr. {provider.firstName}{" "}
                      {provider.lastName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="full-field">
                Appointment date and time

                <input
                  required
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      scheduledAt:
                        event.target.value
                    })
                  }
                />
              </label>

              <label className="full-field">
                Reason for visit

                <textarea
                  value={form.reason}
                  placeholder="Brief appointment purpose"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      reason:
                        event.target.value
                    })
                  }
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  setShowForm(false)
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="new-button"
                disabled={submitting}
              >
                {submitting
                  ? "Scheduling..."
                  : "Schedule appointment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function getActionLabel(status: string) {
  const labels: Record<string, string> = {
    SCHEDULED: "Check in",
    CHECKED_IN: "Send to waiting",
    WAITING: "Begin visit",
    IN_PROGRESS: "Complete"
  };

  return labels[status] ?? "";
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );
}

export default Appointments;