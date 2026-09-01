import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

type Role = "ADMIN" | "DOCTOR" | "RECEPTIONIST";

type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(
  null
);

const TOKEN_KEY = "health-care-access-token";

export function AuthProvider({
  children
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const savedToken = localStorage.getItem(TOKEN_KEY);

      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:4000/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${savedToken}`
            }
          }
        );

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const result = await response.json();

        setUser(result.data);
        setToken(savedToken);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(
    email: string,
    password: string
  ) {
    const response = await fetch(
      "http://localhost:4000/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to sign in"
      );
    }

    localStorage.setItem(
      TOKEN_KEY,
      result.data.token
    );

    setToken(result.data.token);
    setUser(result.data.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}