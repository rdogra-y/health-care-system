import {
  useEffect,
  useMemo,
  useState,
  type FormEvent
} from "react";

import { apiFetch } from "../utils/api";

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string;
  gender: string | null;
  address: string | null;
};

function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: ""
  });

  async function loadPatients() {
    try {
      setError("");

      const response = await apiFetch("/patients");

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (response.status === 403) {
          throw new Error("You do not have permission to view patients.");
        }

        throw new Error("Unable to load patients.");
      }

      const result = await response.json();

      setPatients(result.data ?? []);
    } catch (error) {
      console.error("Unable to load patients:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load patients."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) =>
      `${patient.firstName} ${patient.lastName} ${patient.email ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [patients, search]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await apiFetch("/patients", {
        method: "POST",
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please sign in again.");
        }

        if (response.status === 403) {
          throw new Error(
            "You do not have permission to register patients."
          );
        }

        throw new Error(
          result.message || "Unable to create patient."
        );
      }

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: ""
      });

      setShowForm(false);

      await loadPatients();
    } catch (error) {
      console.error("Create patient error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create patient."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="patients-page">
      <header className="page-header">
        <div>
          <span className="section-tag">
            PATIENT DIRECTORY
          </span>

          <h1>People under your care.</h1>

          <p>
            Search, register and manage patient records
            from one workspace.
          </p>
        </div>

        <button
          className="new-button"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          Register patient
        </button>
      </header>

      {error && !showForm && (
        <div className="login-error">
          {error}
        </div>
      )}

      <section className="directory-toolbar">
        <div className="patient-count">
          <strong>{patients.length}</strong>
          <span>registered patients</span>
        </div>

        <input
          className="patient-search"
          type="search"
          placeholder="Search patient name or email"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />
      </section>

      <section className="patient-table-card">
        <div className="table-head">
          <span>Patient</span>
          <span>Contact</span>
          <span>Date of birth</span>
          <span>Location</span>
          <span />
        </div>

        {loading ? (
          <div className="empty-state">
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="empty-state">
            No patients found.
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              className="patient-row"
              key={patient.id}
            >
              <div className="patient-identity">
                <div className="patient-initials">
                  {patient.firstName.charAt(0)}
                  {patient.lastName.charAt(0)}
                </div>

                <div>
                  <strong>
                    {patient.firstName}{" "}
                    {patient.lastName}
                  </strong>

                  <span>
                    Patient #
                    {String(patient.id).padStart(
                      4,
                      "0"
                    )}
                  </span>
                </div>
              </div>

              <div className="patient-detail">
                <strong>
                  {patient.email || "No email"}
                </strong>

                <span>
                  {patient.phone || "No phone"}
                </span>
              </div>

              <div className="patient-detail">
                <strong>
                  {patient.dateOfBirth}
                </strong>

                <span>
                  {patient.gender ||
                    "Not specified"}
                </span>
              </div>

              <div className="patient-detail">
                <strong>
                  {patient.address ||
                    "Not provided"}
                </strong>

                <span>Patient record</span>
              </div>

              <button className="patient-menu">
                →
              </button>
            </div>
          ))
        )}
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={() => {
            if (!submitting) {
              setShowForm(false);
            }
          }}
        >
          <form
            className="patient-modal"
            onSubmit={handleSubmit}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="modal-heading">
              <div>
                <span className="section-tag">
                  NEW RECORD
                </span>

                <h2>Register patient</h2>
              </div>

              <button
                type="button"
                className="modal-close"
                disabled={submitting}
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <div className="form-grid">
              <label>
                First name

                <input
                  required
                  value={form.firstName}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      firstName:
                        event.target.value
                    })
                  }
                />
              </label>

              <label>
                Last name

                <input
                  required
                  value={form.lastName}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      lastName:
                        event.target.value
                    })
                  }
                />
              </label>

              <label>
                Email

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      email:
                        event.target.value
                    })
                  }
                />
              </label>

              <label>
                Phone

                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone:
                        event.target.value
                    })
                  }
                />
              </label>

              <label>
                Date of birth

                <input
                  required
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      dateOfBirth:
                        event.target.value
                    })
                  }
                />
              </label>

              <label>
                Gender

                <select
                  value={form.gender}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      gender:
                        event.target.value
                    })
                  }
                >
                  <option value="">
                    Select
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Other">
                    Other
                  </option>

                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              </label>

              <label className="full-field">
                Address

                <input
                  value={form.address}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      address:
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
                disabled={submitting}
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
                  ? "Creating..."
                  : "Create patient"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Patients;