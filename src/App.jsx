import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Occurrences from "./pages/Occurrences";
import NewOccurrence from "./pages/NewOccurrence";
import OccurrenceDetails from "./pages/OccurrenceDetails";
import Categories from "./pages/Categories";
import NewProtocol from "./pages/NewProtocol";

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
                  <NewProtocol />
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