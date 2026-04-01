import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={layoutStyle}>
      <Sidebar />

      <div style={contentWrapperStyle}>
        <main style={mainStyle}>{children}</main>
      </div>
    </div>
  );
}

const layoutStyle = {
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)",
};

const contentWrapperStyle = {
  flex: 1,
  minWidth: 0,
};

const mainStyle = {
  padding: "28px",
};