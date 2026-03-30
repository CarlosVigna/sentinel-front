import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div
        style={{
          flex: 1,
          background: "#f8fafc",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </div>
  );
}