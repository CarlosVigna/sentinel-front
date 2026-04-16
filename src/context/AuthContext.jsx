import { createContext, useState, useEffect } from "react";
import { login as loginService } from "../services/authService";
import { getMe } from "../services/userService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoadingAuth(false);
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  }

  async function login(email, senha) {
    const token = await loginService(email, senha);

    localStorage.setItem("token", token);

    const me = await getMe();
    setUser(me);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}