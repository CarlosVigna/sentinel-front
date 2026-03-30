import { createContext, useState, useEffect } from "react";
import { login as loginService } from "@/services/authService";

export const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (token) {
      setUser({ logged: true });
    }

  }, []);

  async function login(email, senha) {

    const token = await loginService(email, senha);

    localStorage.setItem("token", token);

    setUser({ logged: true });

  }

  function logout() {

    localStorage.removeItem("token");

    setUser(null);

  }

  return (

    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>

  );

}