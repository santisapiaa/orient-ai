export default function Spinner({ size = 20, color = "#1B2A4C" }: { size?: number; color?: string }) {
  const borderWidth = Math.max(2, Math.round(size / 8));
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "9999px",
        border: `${borderWidth}px solid ${color}33`,
        borderTopColor: color,
        animation: "orientai-spin 0.7s linear infinite",
        flexShrink: 0,
      }}
    />
  );
}
