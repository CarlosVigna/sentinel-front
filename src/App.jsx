import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Occurrences from "./pages/Occurrences";
import NewOccurrence from "./pages/NewOccurrence";
import OccurrenceDetails from "./pages/OccurrenceDetails";
import Categories from "./pages/Categories";
import Protocols from "./pages/Protocols";
import NewProtocol from "./pages/NewProtocol";
import Users from "./pages/Users";
import ReportPage from "./pages/ReportPage";
import ChangePassword from "./pages/ChangePassword";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/occurrences"
            element={
              <ProtectedRoute>
                <Layout>
                  <Occurrences />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/occurrences/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewOccurrence />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/occurrences/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <OccurrenceDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <Categories />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/protocols"
            element={
              <ProtectedRoute>
                <Layout>
                  <Protocols />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/protocols/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewProtocol />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/protocols/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <NewProtocol />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Layout>
                  <Users />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <Layout>
                  <ChangePassword />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReportPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;