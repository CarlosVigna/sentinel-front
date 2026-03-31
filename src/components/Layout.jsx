import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={layoutStyle}>
      <Sidebar />

      <main style={mainStyle}>
        <div style={contentWrapperStyle}>{children}</div>
      </main>
    </div>
  );
}

const layoutStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "#f1f5f9",
};

const mainStyle = {
  flex: 1,
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
};

const contentWrapperStyle = {
  padding: "28px",
};