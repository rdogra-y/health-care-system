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

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  address: ""
};

function Patients() {
  const [patients, setPatients] =
    useState<Patient[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState(emptyForm);

  async function loadPatients() {
    try {
      setLoading(true);

      const response =
        await apiFetch("/patients");

      if (!response.ok) {
        throw new Error(
          "Unable to load patients"
        );
      }

      const result =
        await response.json();

      setPatients(
        result.data ?? []
      );
    } catch (error) {
      console.error(
        "Patients error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return patients;
      }

      return patients.filter(
        (patient) => {
          const name =
            `${patient.firstName} ${patient.lastName}`
              .toLowerCase();

          return (
            name.includes(value) ||
            patient.email
              ?.toLowerCase()
              .includes(value) ||
            patient.phone?.includes(
              value
            )
          );
        }
      );
    }, [patients, search]);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm({
      ...form,
      [field]: value
    });

    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.dateOfBirth ||
      !form.address.trim()
    ) {
      setError(
        "First name, last name, email, phone, date of birth and address are required."
      );
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        form.email.trim()
      )
    ) {
      setError(
        "Enter a valid email address."
      );
      return;
    }

    const phoneDigits =
      form.phone.replace(
        /\D/g,
        ""
      );

    if (
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      setError(
        "Enter a valid phone number."
      );
      return;
    }

    const dob =
      new Date(
        `${form.dateOfBirth}T00:00:00`
      );

    if (
      Number.isNaN(
        dob.getTime()
      ) ||
      dob > new Date()
    ) {
      setError(
        "Date of birth cannot be in the future."
      );
      return;
    }

    if (
      form.address
        .trim()
        .length < 5
    ) {
      setError(
        "Enter a valid address."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await apiFetch(
          "/patients",
          {
            method: "POST",
            body: JSON.stringify({
              firstName:
                form.firstName.trim(),
              lastName:
                form.lastName.trim(),
              email:
                form.email.trim(),
              phone:
                form.phone.trim(),
              dateOfBirth:
                form.dateOfBirth,
              gender:
                form.gender.trim(),
              address:
                form.address.trim()
            })
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        if (result.errors) {
          const messages =
            Object.values(
              result.errors
            )
              .flat()
              .filter(Boolean)
              .join(" ");

          setError(
            messages ||
              result.message
          );
        } else {
          setError(
            result.message ||
              "Unable to add patient."
          );
        }

        return;
      }

      setForm(emptyForm);
      setError("");
      setShowForm(false);

      await loadPatients();
    } catch (error) {
      console.error(
        "Create patient error:",
        error
      );

      setError(
        "Unable to add patient."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setShowForm(false);
    setForm(emptyForm);
    setError("");
  }

  return (
    <div className="patients-page">
      <header className="page-header">
        <div>
          <span className="section-tag">
            PATIENT DIRECTORY
          </span>

          <h1>
            People at the center of care.
          </h1>

          <p>
            Search patient records
            and register new patients
            securely.
          </p>
        </div>

        <button
          type="button"
          className="new-button"
          onClick={() =>
            setShowForm(true)
          }
        >
          Add patient
        </button>
      </header>

      <div className="directory-toolbar">
        <div className="patient-count">
          <strong>
            {patients.length}
          </strong>

          <span>
            REGISTERED PATIENTS
          </span>
        </div>

        <input
          className="patient-search"
          type="search"
          placeholder="Search patients"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />
      </div>

      <section className="patient-table-card">
        <div className="table-head">
          <span>Patient</span>
          <span>Contact</span>
          <span>Date of birth</span>
          <span>Address</span>
          <span />
        </div>

        {loading ? (
          <div className="empty-state">
            Loading patients...
          </div>
        ) : filteredPatients.length ===
          0 ? (
          <div className="empty-state">
            No patients found.
          </div>
        ) : (
          filteredPatients.map(
            (patient) => (
              <article
                className="patient-row"
                key={
                  patient.id
                }
              >
                <div className="patient-identity">
                  <div className="patient-initials">
                    {patient.firstName.charAt(
                      0
                    )}
                    {patient.lastName.charAt(
                      0
                    )}
                  </div>

                  <div>
                    <strong>
                      {
                        patient.firstName
                      }{" "}
                      {
                        patient.lastName
                      }
                    </strong>

                    <span>
                      ID #
                      {String(
                        patient.id
                      ).padStart(
                        4,
                        "0"
                      )}
                    </span>
                  </div>
                </div>

                <div className="patient-detail">
                  <strong>
                    {patient.email ||
                      "No email"}
                  </strong>

                  <span>
                    {patient.phone ||
                      "No phone"}
                  </span>
                </div>

                <div className="patient-detail">
                  <strong>
                    {formatDate(
                      patient.dateOfBirth
                    )}
                  </strong>

                  <span>
                    Date of birth
                  </span>
                </div>

                <div className="patient-detail">
                  <strong>
                    {patient.address ||
                      "Not provided"}
                  </strong>

                  <span>
                    {patient.gender ||
                      "Patient"}
                  </span>
                </div>

                <button
                  type="button"
                  className="patient-menu"
                >
                  ···
                </button>
              </article>
            )
          )
        )}
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closeModal
          }
        >
          <form
            className="patient-modal"
            onSubmit={
              handleSubmit
            }
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="modal-heading">
              <div>
                <span className="section-tag">
                  PATIENT REGISTRATION
                </span>

                <h2>
                  Add patient
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeModal
                }
              >
                ×
              </button>
            </div>

            {error && (
              <div
                style={{
                  marginBottom:
                    "16px",
                  padding:
                    "11px 14px",
                  borderRadius:
                    "10px",
                  background:
                    "#f7e8e5",
                  color:
                    "#913f36",
                  fontSize:
                    "11px",
                  fontWeight:
                    700
                }}
              >
                {error}
              </div>
            )}

            <div className="form-grid">
              <label>
                First name
                <input
                  required
                  type="text"
                  value={
                    form.firstName
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "firstName",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Last name
                <input
                  required
                  type="text"
                  value={
                    form.lastName
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "lastName",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Email
                <input
                  required
                  type="email"
                  placeholder="name@example.com"
                  value={
                    form.email
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "email",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Phone
                <input
                  required
                  type="tel"
                  placeholder="+1 204 555 0123"
                  value={
                    form.phone
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "phone",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Date of birth
                <input
                  required
                  type="date"
                  max={
                    getToday()
                  }
                  value={
                    form.dateOfBirth
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "dateOfBirth",
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Gender
                <select
                  value={
                    form.gender
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "gender",
                      event.target
                        .value
                    )
                  }
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Non-binary">
                    Non-binary
                  </option>

                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              </label>

              <label className="full-field">
                Address
                <textarea
                  required
                  value={
                    form.address
                  }
                  placeholder="Street, city, province and postal code"
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "address",
                      event.target
                        .value
                    )
                  }
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={
                  closeModal
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="new-button"
                disabled={
                  submitting
                }
              >
                {submitting
                  ? "Adding..."
                  : "Add patient"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function getToday() {
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
    .slice(0, 10);
}

function formatDate(
  value: string
) {
  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  );
}

export default Patients;