export default function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", padding: "2rem", textAlign: "center" }}>
      {children}
    </div>
  );
}
