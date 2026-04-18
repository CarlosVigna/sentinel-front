import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { lazy, Suspense } from "react";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// ── Lazy-loaded pages (code splitting) ──────────────────────
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Occurrences = lazy(() => import("./pages/Occurrences"));
const NewOccurrence = lazy(() => import("./pages/NewOccurrence"));
const OccurrenceDetails = lazy(() => import("./pages/OccurrenceDetails"));
const Categories = lazy(() => import("./pages/Categories"));
const Protocols = lazy(() => import("./pages/Protocols"));
const NewProtocol = lazy(() => import("./pages/NewProtocol"));
const Users = lazy(() => import("./pages/Users"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Reports = lazy(() => import("./pages/Reports"));

function PageLoader() {
  return (
    <div className="sentinel-loading">
      <div className="sentinel-spinner" />
      <span>Carregando...</span>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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

            {/* ✅ RELATÓRIOS CORRETO */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;