import {
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from "react";
import { apiFetch } from "../utils/api";

type AppointmentStatus =
  | "SCHEDULED"
  | "CHECKED_IN"
  | "WAITING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

type Appointment = {
  id: number;
  patientId: number;
  providerId: number;
  scheduledAt: string;
  status: AppointmentStatus;
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

type AppointmentForm = {
  patientId: string;
  providerId: string;
  scheduledAt: string;
  reason: string;
};

const emptyForm: AppointmentForm = {
  patientId: "",
  providerId: "",
  scheduledAt: "",
  reason: ""
};

const filters: Array<"ALL" | AppointmentStatus> = [
  "ALL",
  "SCHEDULED",
  "CHECKED_IN",
  "WAITING",
  "IN_PROGRESS",
  "COMPLETED"
];

function Appointments() {
  const [appointments, setAppointments] =
    useState<Appointment[]>([]);

  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [providers, setProviders] =
    useState<Provider[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showForm, setShowForm] =
    useState(false);

  const [filter, setFilter] =
    useState<"ALL" | AppointmentStatus>("ALL");

  const [submitting, setSubmitting] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<number | null>(null);

  const [
    dateTimeConfirmed,
    setDateTimeConfirmed
  ] = useState(false);

  const [formError, setFormError] =
    useState("");

  const [form, setForm] =
    useState<AppointmentForm>(emptyForm);

  async function loadData() {
    try {
      setLoading(true);

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
        throw new Error(
          "Unable to load appointment workspace"
        );
      }

      const appointmentsResult =
        await appointmentsResponse.json();

      const patientsResult =
        await patientsResponse.json();

      const providersResult =
        await providersResponse.json();

      setAppointments(
        appointmentsResult.data ?? []
      );

      setPatients(
        patientsResult.data ?? []
      );

      setProviders(
        providersResult.data ?? []
      );
    } catch (error) {
      console.error(
        "Unable to load appointment workspace:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredAppointments =
    useMemo(() => {
      if (filter === "ALL") {
        return appointments;
      }

      return appointments.filter(
        (appointment) =>
          appointment.status === filter
      );
    }, [appointments, filter]);

  function getPatient(patientId: number) {
    return patients.find(
      (patient) =>
        patient.id === patientId
    );
  }

  function getProvider(providerId: number) {
    return providers.find(
      (provider) =>
        provider.id === providerId
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setFormError("");

    if (
      !form.patientId ||
      !form.providerId
    ) {
      setFormError(
        "Select both a patient and a provider."
      );
      return;
    }

    if (!form.scheduledAt) {
      setFormError(
        "Select an appointment date and time."
      );
      return;
    }

    if (!dateTimeConfirmed) {
      setFormError(
        "Confirm the appointment date and time before scheduling."
      );
      return;
    }

    const selectedDate =
      new Date(form.scheduledAt);

    if (
      Number.isNaN(
        selectedDate.getTime()
      ) ||
      selectedDate <= new Date()
    ) {
      setDateTimeConfirmed(false);

      setFormError(
        "Appointment must be scheduled for a future date and time."
      );

      return;
    }

    try {
      setSubmitting(true);

      const response =
        await apiFetch(
          "/appointments",
          {
            method: "POST",
            body: JSON.stringify({
              patientId: Number(
                form.patientId
              ),
              providerId: Number(
                form.providerId
              ),
              scheduledAt:
                selectedDate.toISOString(),
              reason:
                form.reason.trim()
            })
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        setFormError(
          result.message ||
            "Unable to schedule appointment."
        );
        return;
      }

      setForm(emptyForm);
      setDateTimeConfirmed(false);
      setFormError("");
      setShowForm(false);

      await loadData();
    } catch (error) {
      console.error(
        "Appointment creation error:",
        error
      );

      setFormError(
        "Unable to schedule appointment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateAppointmentStatus(
    id: number,
    status: AppointmentStatus
  ) {
    try {
      setUpdatingId(id);

      const response =
        await apiFetch(
          `/appointments/${id}/status`,
          {
            method: "PATCH",
            body: JSON.stringify({
              status
            })
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to update appointment"
        );
      }

      setAppointments(
        (current) =>
          current.map(
            (appointment) =>
              appointment.id === id
                ? {
                    ...appointment,
                    ...result.data
                  }
                : appointment
          )
      );
    } catch (error) {
      console.error(
        "Appointment status update error:",
        error
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function getNextStatus(
    status: AppointmentStatus
  ): AppointmentStatus | null {
    switch (status) {
      case "SCHEDULED":
        return "CHECKED_IN";

      case "CHECKED_IN":
        return "WAITING";

      case "WAITING":
        return "IN_PROGRESS";

      case "IN_PROGRESS":
        return "COMPLETED";

      default:
        return null;
    }
  }

  function getActionLabel(
    status: AppointmentStatus
  ) {
    switch (status) {
      case "SCHEDULED":
        return "Check in";

      case "CHECKED_IN":
        return "Send to waiting";

      case "WAITING":
        return "Begin visit";

      case "IN_PROGRESS":
        return "Complete";

      default:
        return null;
    }
  }

  function confirmDateTime() {
    setFormError("");

    if (!form.scheduledAt) {
      setFormError(
        "Select an appointment date and time first."
      );
      return;
    }

    const selected =
      new Date(form.scheduledAt);

    if (
      Number.isNaN(
        selected.getTime()
      ) ||
      selected <= new Date()
    ) {
      setDateTimeConfirmed(false);

      setFormError(
        "Please select a future appointment date and time."
      );

      return;
    }

    setDateTimeConfirmed(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setDateTimeConfirmed(false);
    setFormError("");
  }

  const scheduledCount =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "SCHEDULED"
    ).length;

  const activeCount =
    appointments.filter(
      (appointment) =>
        appointment.status ===
          "CHECKED_IN" ||
        appointment.status ===
          "WAITING" ||
        appointment.status ===
          "IN_PROGRESS"
    ).length;

  const completedCount =
    appointments.filter(
      (appointment) =>
        appointment.status ===
        "COMPLETED"
    ).length;

  return (
    <div className="appointments-page">
      <header className="page-header appointment-header">
        <div>
          <span className="section-tag">
            CARE COORDINATION
          </span>

          <h1>
            The day's clinical rhythm.
          </h1>

          <p>
            Coordinate visits, monitor patient
            flow and manage provider schedules.
          </p>
        </div>

        <button
          type="button"
          className="new-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          Schedule appointment
        </button>
      </header>

      <section className="appointment-summary">
        <div className="appointment-summary-main">
          <span>
            ACTIVE WORKSPACE
          </span>

          <strong>
            {String(
              appointments.length
            ).padStart(2, "0")}
          </strong>

          <p>Total appointments</p>
        </div>

        <div className="appointment-stat">
          <div className="stat-marker scheduled-marker" />

          <div>
            <span>Scheduled</span>

            <strong>
              {scheduledCount}
            </strong>
          </div>
        </div>

        <div className="appointment-stat">
          <div className="stat-marker waiting-marker" />

          <div>
            <span>Active queue</span>

            <strong>
              {activeCount}
            </strong>
          </div>
        </div>

        <div className="appointment-stat">
          <div className="stat-marker completed-marker" />

          <div>
            <span>Completed</span>

            <strong>
              {completedCount}
            </strong>
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
            {filters.map(
              (status) => (
                <button
                  type="button"
                  key={status}
                  className={
                    filter === status
                      ? "selected"
                      : ""
                  }
                  onClick={() =>
                    setFilter(status)
                  }
                >
                  {status === "ALL"
                    ? "All"
                    : formatStatus(
                        status
                      )}
                </button>
              )
            )}
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Loading appointments...
          </div>
        ) : filteredAppointments.length ===
          0 ? (
          <div className="empty-state">
            No appointments in this view.
          </div>
        ) : (
          <div className="appointment-list">
            {filteredAppointments.map(
              (
                appointment,
                index
              ) => {
                const patient =
                  getPatient(
                    appointment.patientId
                  );

                const provider =
                  getProvider(
                    appointment.providerId
                  );

                const nextStatus =
                  getNextStatus(
                    appointment.status
                  );

                const actionLabel =
                  getActionLabel(
                    appointment.status
                  );

                return (
                  <article
                    className="appointment-record"
                    key={
                      appointment.id
                    }
                  >
                    <div className="appointment-index">
                      {String(
                        index + 1
                      ).padStart(
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
                        {patient?.firstName.charAt(
                          0
                        ) ?? "P"}

                        {patient?.lastName.charAt(
                          0
                        ) ?? ""}
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
                      <span>
                        PROVIDER
                      </span>

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
                      {nextStatus &&
                      actionLabel ? (
                        <button
                          type="button"
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
                            : actionLabel}

                          <span>
                            →
                          </span>
                        </button>
                      ) : appointment.status ===
                        "COMPLETED" ? (
                        <span className="workflow-complete">
                          Complete
                        </span>
                      ) : (
                        <span />
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
          onMouseDown={closeForm}
        >
          <form
            className="patient-modal appointment-modal"
            onSubmit={handleSubmit}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            noValidate
          >
            <div className="modal-heading">
              <div>
                <span className="section-tag">
                  CARE COORDINATION
                </span>

                <h2>
                  Schedule appointment
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
              >
                ×
              </button>
            </div>

            <div className="appointment-form-intro">
              <span>
                NEW VISIT
              </span>

              <p>
                Connect a patient with an
                available healthcare provider.
              </p>
            </div>

            {formError && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  background:
                    "#f7e8e5",
                  color: "#913f36",
                  fontSize: "11px",
                  fontWeight: 700
                }}
              >
                {formError}
              </div>
            )}

            <div className="form-grid">
              <label>
                Patient

                <select
                  required
                  value={
                    form.patientId
                  }
                  onChange={(
                    event
                  ) =>
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

                  {patients.map(
                    (patient) => (
                      <option
                        key={
                          patient.id
                        }
                        value={
                          patient.id
                        }
                      >
                        {
                          patient.firstName
                        }{" "}
                        {
                          patient.lastName
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                Provider

                <select
                  required
                  value={
                    form.providerId
                  }
                  onChange={(
                    event
                  ) =>
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

                  {providers.map(
                    (provider) => (
                      <option
                        key={
                          provider.id
                        }
                        value={
                          provider.id
                        }
                      >
                        Dr.{" "}
                        {
                          provider.firstName
                        }{" "}
                        {
                          provider.lastName
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <div className="full-field">
                <label>
                  Appointment date and time

                  <input
                    required
                    type="datetime-local"
                    min={
                      getMinimumDateTime()
                    }
                    value={
                      form.scheduledAt
                    }
                    onChange={(
                      event
                    ) => {
                      setForm({
                        ...form,
                        scheduledAt:
                          event.target.value
                      });

                      setDateTimeConfirmed(
                        false
                      );

                      setFormError("");
                    }}
                  />
                </label>

                <button
                  type="button"
                  className="cancel-button"
                  style={{
                    marginTop: "10px"
                  }}
                  disabled={
                    !form.scheduledAt
                  }
                  onClick={
                    confirmDateTime
                  }
                >
                  Confirm date & time
                </button>

                {dateTimeConfirmed && (
                  <p
                    style={{
                      margin:
                        "8px 0 0",
                      color:
                        "#386153",
                      fontSize:
                        "11px",
                      fontWeight:
                        700
                    }}
                  >
                    Confirmed:{" "}
                    {new Date(
                      form.scheduledAt
                    ).toLocaleString()}
                  </p>
                )}
              </div>

              <label className="full-field">
                Reason for visit

                <textarea
                  value={
                    form.reason
                  }
                  placeholder="Brief appointment purpose"
                  onChange={(
                    event
                  ) =>
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
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="new-button"
                disabled={
                  submitting ||
                  !dateTimeConfirmed
                }
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

function getMinimumDateTime() {
  const now =
    new Date();

  const local =
    new Date(
      now.getTime() -
        now.getTimezoneOffset() *
          60_000
    );

  return local
    .toISOString()
    .slice(0, 16);
}

function formatStatus(
  status: string
) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}

function formatTime(
  value: string
) {
  return new Date(
    value
  ).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDate(
  value: string
) {
  return new Date(
    value
  ).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

export default Appointments;