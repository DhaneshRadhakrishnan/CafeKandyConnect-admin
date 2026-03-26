export default function StatCard({ icon, label, value, accent = "var(--cream)" }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700, margin: "8px 0 4px" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</div>
    </div>
  );
}